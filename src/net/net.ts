import { Address4 } from "ip-address";
import { FirewallError, NetworkError } from "./errors";
import { makeString } from "./random";

// Generic node type that is used for all subtypes.
export abstract class Node {
  public inPacketLog: Array<Packet> = new Array<Packet>();
  public outPacketLog: Array<Packet> = new Array<Packet>();

  public currPacketQueue: Array<Packet> = new Array<Packet>();
  public nextPacketQueue: Array<Packet> = new Array<Packet>();

  // Mapping of IP addresses to the MAC address, and the node edge to forward along.
  private arpTable: Map<Address4, [string, string]> = new Map<
    Address4,
    [string, string]
  >();

  // Mapping of all interfaces indices with the appropriate IP/MAC.
  public interfaces: Map<number, [Address4 | null, string | null]>;

  // assign a random node id to each node we create.
  public id: string = "node-" + makeString(8);

  private fwRules: Array<FirewallRule> = new Array<FirewallRule>();

  public nodeX: number | undefined;
  public nodeY: number | undefined;

  constructor(numPorts: number, id?: string) {
    if (id) {
      this.id = id;
    }

    // create all of our interfaces. [IP, MAC].
    this.interfaces = new Map<number, [Address4 | null, string | null]>();
    for (let i = 0; i < numPorts; numPorts++) {
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
}

export class Network {
  public net: Map<string, Node> = new Map<string, Node>();

  public tick() {
    for (let node of this.net) {
      node[1].tick(this);
    }
  }
}

export class Packet {
  public srcmac: string;
  public dstmac: string;
  public srcip: Address4;
  public dstip: Address4;

  public payload: string;
  public app: MachineApplication;

  constructor(
    srcmac: string,
    dstmac: string,
    srcip: Address4,
    dstip: Address4,
    payload: string,
    app: MachineApplication
  ) {
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

export enum MachineApplication {
  Ping,
  SSH,
  VideoStream,
}
