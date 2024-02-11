import { Address4 } from "ip-address";
import { broadcastmac } from "./consts";
import {
  FirewallError,
  NetworkError,
  NoNodeError,
  NoPortError,
} from "./errors";
import { makeRandomMAC, makeString } from "./random";

export enum NodeType {
  Router,
  Machine,
  InternetGateway,
  Switch,
}

// Generic node type that is used for all subtypes.
export abstract class Node {
  public abstract nodeType: NodeType;

  // logs of packets
  public inPacketLog: Array<Packet> = new Array<Packet>();
  public outPacketLog: Array<Packet> = new Array<Packet>();

  // queues of packets for ticks
  public currPacketQueue: Array<Packet> = new Array<Packet>();
  public nextPacketQueue: Array<Packet> = new Array<Packet>();

  public arpWaitMap: Map<Address4, Packet> = new Map<Address4, Packet>();

  // Mapping of IP addresses to the MAC address, and the node edge to forward along.
  public arpTable: Map<Address4, ArpEntry> = new Map<Address4, ArpEntry>();

  // Mapping of all interfaces indices with the appropriate IP/MAC/Node/Othermac (the MAC address on the other side of the physical connection, only used for switches).
  public interfaces: Map<number, Interface>;

  // assign a random node id to each node we create.
  public id: string = "node-" + makeString(8);

  // firewall rules for stuff
  public fwRules: Array<FirewallRule> = new Array<FirewallRule>();

  public nodeX: number | undefined = 0;
  public nodeY: number | undefined = 0;

  constructor(numPorts: number, id?: string, x?: number, y?: number) {
    if (id) {
      this.id = id;
    }
    this.nodeX = x ?? 0;
    this.nodeY = y ?? 0;

    // create all of our interfaces. [IP, MAC].
    this.interfaces = new Map<number, Interface>();
    for (let i = 0; i < numPorts; i++) {
      this.interfaces.set(i, new Interface(this));
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
  public findAddrCached(ip: Address4): ArpEntry | undefined {
    return this.arpTable.get(ip);
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
    for (let iface of this.interfaces) {
      arr.push([iface[1].srcnode, iface[1].dstnode]);
    }

    return arr;
  }

  public add_edge(other: Node): NetworkError | null {
    let lindex = this.get_free_nic();
    let rindex = other.get_free_nic();
    if (lindex && rindex) {
      let curr = this.interfaces.get(lindex);
      let outside = other.interfaces.get(rindex);
      if (curr && outside) {
        this.interfaces.set(lindex, new Interface(this, curr.ip, other));
        other.interfaces.set(rindex, new Interface(other, outside.ip, this));
      } else {
        return NoPortError;
      }
      return null;
    } else {
      return NoPortError;
    }
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
      if (iface[1].ip && addr.isInSubnet(iface[1].ip)) {
        return true;
      }
    }

    return false;
  }

  // Get the next free NIC without an IP assigned.
  public get_free_nic(): number | null {
    // If we have an empty slot, then fill it with the other node.
    for (let iface of this.interfaces) if (!iface[1].ip) return iface[0];

    return null;
  }

  public resolveArpRequest(p: Packet, net: Network) {
    for (let iface of this.interfaces) {
      // If someone is looking for us, then return our MAC address.
      if (iface[1].ip === p.dstip) {
        let n = net.net.get(p.srcnode);
        if (n) {
          let outP = new Packet(
            this.id,
            p.dstmac,
            p.srcmac,
            iface[1].ip,
            p.dstip,
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

  // Take a packet from the current node and decide where to move it next.
  // Place it in the next packet queue of the neighbor associated with the interface,
  // otherwise hold the packet for ARP resolution.
  public route(p: Packet, net: Network) {
    for (let iface of this.interfaces) {
      // if we find an interface with the same subnet, we need to forward to that network.
      if (iface[1].ip && p.dstip.isInSubnet(iface[1].ip)) {
        let n = this.arpTable.get(p.dstip);
        // If we don't have an ARP entry for this destination IP, we need to block and run ARP instead.
        // If we do have an entry, then just go ahead and forward the packet along.
        if (n) {
          // We need to mangle the packet
          p.srcmac = n.dstmac;
          p.dstmac = n.dstmac;
          let forward_node = net.net.get(n.dstnode);
          if (forward_node) {
            forward_node.appendPacket(p);
            this.handleOut(p);
            return;
          }
        } else {
          if (iface[1].dstnode)
            // Need to run ARP.
            this.sendArpRequest(
              iface[1].ip,
              iface[1].mac,
              iface[1].dstnode,
              p.dstip,
              net
            );
          this.arpWaitMap.set(p.dstip, p);
          return;
        }
      }
    }
  }

  // If we get an ARP response, add to our ARP table.
  public resolveArpResponse(p: Packet, net: Network) {
    if (p.app === PacketType.ARPResponse)
      this.arpTable.set(p.srcip, new ArpEntry(p.srcip, p.srcmac, p.srcnode));

    // If we just resolved an IP that we were waiting for in our
    // arp wait cache, then we can send the packet off directly.
    let val = this.arpWaitMap.get(p.dstip);
    if (val) {
      this.route(val, net);
    }
  }

  public sendArpRequest(
    srcip: Address4,
    srcmac: string,
    dstnode: string,
    dstip: Address4,
    net: Network
  ) {
    let n = net.net.get(dstnode);
    if (n) {
      n.appendPacket(
        new Packet(
          this.id,
          srcmac,
          broadcastmac,
          srcip,
          dstip,
          "",
          PacketType.ARPRequest
        )
      );
    }
  }

  public toJSON(): object {
    return {
      inPacketLog: this.inPacketLog,
      outPacketLog: this.outPacketLog,
      currPacketQueue: this.currPacketQueue,
      nextPacketQueue: this.nextPacketQueue,
      arpTable: [...this.arpTable],
      interfaces: this.interfaces,
      id: this.id,
      fwRules: this.fwRules,
      nodeX: this.nodeX,
      nodeY: this.nodeY,
    };
  }
}

export class Network {
  public net: Map<string, Node> = new Map<string, Node>();

  public active_node: string = "unknown";

  public tick() {
    for (let node of this.net) {
      node[1].tick(this);
    }
  }

  public get_graph(): [Map<string, Node>, Array<[string, string]>] {
    let arr = Array();
    for (let node of this.net) {
      arr = [...arr, node[1].get_edges()];
    }

    return [this.net, arr];
  }

  public add_node(n: Node) {
    this.net.set(n.id, n);
  }

  public add_edge(srcnode: string, destnode: string): NetworkError | null {
    let src = this.net.get(srcnode);
    let dest = this.net.get(destnode);
    if (!src || !dest) return NoNodeError;

    src.add_edge(dest);
    dest.add_edge(src);

    return null;
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

export class Interface {
  id: string = "iface-" + makeString(8);

  ip?: Address4;
  mac: string;

  srcnode: string;
  dstnode?: string;

  // The destination MAC address of an interface. This is only to be used internally by
  // the Switch node type, since it needs to store which destination MACs are on which NICs.
  dstmac?: string;

  // arpEntries: Map<Address4, ArpEntry> = new Map<Address4, ArpEntry>();

  constructor(node: Node, ip?: Address4, neighbor?: Node, dstmac?: string) {
    this.ip = ip;
    this.mac = makeRandomMAC();
    this.srcnode = node.id;
    this.dstnode = neighbor?.id;
    this.dstmac = dstmac;
  }
}

export class ArpEntry {
  dstip: Address4;
  dstmac: string;
  dstnode: string;

  constructor(ip: Address4, mac: string, node: string) {
    this.dstip = ip;
    this.dstmac = mac;
    this.dstnode = node;
  }
}
