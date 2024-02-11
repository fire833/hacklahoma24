import { Address4 } from "ip-address";
import { FirewallError, NetworkError } from "./errors";
import { makeString } from "./random";

// Generic node type that is used for all subtypes.
export abstract class Node {
  // logs of packets
  public inPacketLog: Array<Packet> = new Array<Packet>();
  public outPacketLog: Array<Packet> = new Array<Packet>();

  // queues of packets for ticks
  public currPacketQueue: Array<Packet> = new Array<Packet>();
  public nextPacketQueue: Array<Packet> = new Array<Packet>();

  // Mapping of IP addresses to the MAC address, and the node edge to forward along.
  public arpTable: Map<Address4, [string, string]> = new Map<
    Address4,
    [string, string]
  >();

  // Mapping of all interfaces indices with the appropriate IP/MAC.
  public interfaces: Map<number, [Address4 | null, string | null]>;

  // assign a random node id to each node we create.
  public id: string = "node-" + makeString(8);

  // firewall rules for stuff
  private fwRules: Array<FirewallRule> = new Array<FirewallRule>();

  public nodeX: number | undefined;
  public nodeY: number | undefined;

  constructor(numPorts: number, id?: string, x?: number, y?: number) {
    if (id) {
      this.id = id;
    }
    this.nodeX = x;
    this.nodeY = y;

    // create all of our interfaces. [IP, MAC].
    this.interfaces = new Map<number, [Address4 | null, string | null]>();
    for (let i = 0; i < numPorts; i++) {
      this.interfaces.set(i, [null, null]);
    }
  }

  // If return false, don't forward the packet since it was
  // handled by the super node. Returns the node to forward
  // to and the output packet, or null
  public handleIn(p: Packet): NetworkError | null {
    this.inPacketLog.push(p);
    this.fwRules.forEach((rule, i) => {
      if (!rule.evaluatePacket(p)) {
        return FirewallError;
      }
    });

    return null;
  }

  public addFirewallRule(ip: Address4) {
    this.fwRules.push(new FirewallRule(new Array<Address4>(ip)));
  }

  public handleOut(p: Packet) {
    this.outPacketLog.push(p);
  }

  public addRule(rule: FirewallRule) {
    this.fwRules.push(rule);
  }

  // Returns the found MAC address/node to forward along, otherwise cache miss.
  public findAddrCached(ip: Address4): [string, string] | null {
    let found = this.arpTable.get(ip);
    if (found) {
      return [found[0], found[1]];
    } else {
      return null;
    }
  }

  // For callers who need to forward packets to this node, add to the next tick queue.
  public appendPacket(p: Packet) {
    this.nextPacketQueue.push(p);
  }

  public abstract handle(
    packet: Packet,
    net: Network
  ): Array<NetworkError> | null;

  public get_edges(): Array<[string, string]> {
    let arr = Array();
    for (let iface of this.arpTable) {
      arr.push([this.id, iface[1][1]]);
    }

    return arr;
  }

  public tick(net: Network) {
    for (let packet of this.currPacketQueue) {
      this.handle(packet, net);
    }

    this.currPacketQueue = this.nextPacketQueue;
    this.nextPacketQueue = new Array();
  }

  // Returns whether a provided address is outsie of the subnets of all interfaces,
  // in which case needs to go to the default gateway.
  public isAddressRemote(addr: Address4): boolean {
    for (let iface of this.interfaces) {
      if (iface[1][0]) {
        if (addr.isInSubnet(iface[1][0])) {
          return true;
        }
      }
    }

    return false;
  }

  public resolveArpRequest(p: Packet, net: Network) {
    for (let iface of this.interfaces) {
      // If someone is looking for us, then return our MAC address.
      if (iface[1][0] && iface[1][1] && iface[1][0] === p.dstip) {
        let n = net.net.get(p.srcnode);
        if (n) {
          let outP = new Packet(
            this.id,
            iface[1][1],
            p.dstmac,
            p.dstip,
            p.srcip,
            p.payload,
            PacketType.ARPResponse
          );

          n.appendPacket(outP);
          this.handleOut(outP);
          return;
        }
      }
    }
  }

  // If we get an ARP response, add to our ARP table.
  public resolveArpResponse(p: Packet) {
    if (p.app === PacketType.ARPResponse)
      this.arpTable.set(p.srcip, [p.srcmac, p.srcnode]);
  }

  public toJSON() : string {
    return JSON.stringify({
      "inPacketLog": this.inPacketLog,
      "outPacketLog": this.outPacketLog,
      "currPacketQueue": this.currPacketQueue,
      "nextPacketQueue": this.nextPacketQueue,
      "arpTable": this.arpTable,
      "interfaces": this.interfaces,
      "id": this.id,
      "fwRules": this.fwRules,
      "nodeX": this.nodeX,
      "nodeY": this.nodeY,
    });
  }
}

export class Network {
  public net: Map<string, Node> = new Map<string, Node>();

  public tick() {
    for (let node of this.net) {
      node[1].tick(this);
    }
  }

  public get_graph(): [Map<string, Node>, Array<[string, string]>] {
    let arr = Array();
    for (let node of this.net) {
      arr.push(node[1].get_edges());
    }

    return [this.net, arr];
  }

  public add_node(n: Node) {
    this.net.set(n.id, n);
  }
}

export class Packet {
  // A node can have multiple mac addresses for multiple interfaces, but will only have 1 id.
  // This value should be updated on every
  public srcnode: string;
  public srcmac: string;
  public dstmac: string;
  public srcip: Address4;
  public dstip: Address4;

  public payload: string;
  public app: PacketType;

  constructor(
    srcnode: string,
    srcmac: string,
    dstmac: string,
    srcip: Address4,
    dstip: Address4,
    payload: string,
    app: PacketType
  ) {
    this.srcnode = srcnode;
    this.srcmac = srcmac;
    this.dstmac = dstmac;
    this.srcip = srcip;
    this.dstip = dstip;
    this.payload = payload;
    this.app = app;
  }
}

export class FirewallRule {
  public dstIps: Array<Address4> = new Array<Address4>();

  constructor(ips: Array<Address4>) {
    this.dstIps = ips;
  }

  public evaluatePacket(p: Packet): NetworkError | null {
    for (let ip of this.dstIps) {
      if (p.dstip.isInSubnet(ip)) {
        return FirewallError;
      }
    }

    return null;
  }
}

export enum PacketType {
  Ping,
  SSH,
  VideoStream,
  ARPRequest,
  ARPResponse,
}
