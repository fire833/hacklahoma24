import { Address4 } from "ip-address";
import { broadcastmac } from "./consts";
import {
  FirewallError,
  NetworkError,
  NoNodeError,
  NoRouteError,
  NoSwitchportError,
} from "./errors";
import { makeString } from "./random";

// Generic node type that is used for all subtypes.
export default abstract class Node {
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

  public abstract handle(packet: Packet): Array<NetworkError> | null;

  public tick() {
    for (let packet of this.currPacketQueue) {
      this.handle(packet);
    }

    this.currPacketQueue = this.nextPacketQueue;
    this.nextPacketQueue = new Array();
  }
}

export class Network {
  public net: Map<string, Node> = new Map<string, Node>();

  public tick() {
    for (let node of this.net) {
      node[1].tick();
    }
  }
}

export class Packet {
  public srcmac: string;
  public dstmac: string;
  public srcip: Address4;
  public dstip: Address4;

  public payload: string;

  constructor(
    srcmac: string,
    dstmac: string,
    srcip: Address4,
    dstip: Address4,
    payload: string
  ) {
    this.srcmac = srcmac;
    this.dstmac = dstmac;
    this.srcip = srcip;
    this.dstip = dstip;
    this.payload = payload;
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

export class Switch extends Node {
  // internal lookup table of MAC adresses to external nodes.
  private macToIface: Map<string, string> = new Map<string, string>();
  private numPorts: number;

  constructor(ports: number, id?: string) {
    super(0, id);
    this.numPorts = ports;
  }

  // Returns the node to forward to and the output packet, or null
  public handle(p: Packet): Array<NetworkError> | null {
    let err = super.handleIn(p);
    if (err) {
      return new Array(err);
    }

    if (p.dstmac === broadcastmac) {
      // for (let neigh of this.macToIface) {
      // }
      return null;
    } else if (this.macToIface.has(p.dstmac)) {
      let n = this.macToIface.get(p.dstmac);
      if (n) {
        super.handleOut(p);
        return null;
      } else {
        return Array(NoNodeError);
      }
    } else {
      return Array(NoSwitchportError);
    }
  }

  public add_neighbor(port: number, mac: string, node: string) {}

  public get_num_active_ports() {
    return this.macToIface.size;
  }
}

export class Router extends Node {
  private subnetToIface: Map<Address4, string> = new Map<Address4, string>();

  constructor(ports: number, id?: string) {
    super(ports, id);
  }

  public handle(p: Packet): Array<NetworkError> | null {
    let err = super.handleIn(p);
    if (err) {
      return Array(err);
    }

    for (let route of this.subnetToIface) {
      if (p.dstip.isInSubnet(route[0])) {
        let n = this.subnetToIface.get(p.dstip);
        if (n) {
          let found = super.findAddrCached(p.dstip);
          if (found) {
            let newP = p;

            super.handleOut(newP);
            return null;
          }
        } else {
          return Array(NoNodeError);
        }
      }
    }

    return Array(NoRouteError);
  }

  public add_route(subnet: Address4, node: string) {}
}

export class Machine extends Node {
  private ip: Address4;

  constructor(ports: number, ip: Address4, id?: string) {
    super(ports, id);
    this.ip = ip;
  }

  public handle(p: Packet): Array<NetworkError> | null {
    let err = super.handleIn(p);
    if (err) {
      return Array(err);
    }

    super.handleOut(p);
    return null;
  }
}

export enum MachineApplication {
  Ping,
  SSH,
}

export class InternetGateway extends Node {
  constructor(id?: string) {
    super(1, id);
  }

  public handle(p: Packet): Array<NetworkError> | null {
    let err = super.handleIn(p);
    if (err) {
      return Array(err);
    }

    // fetch(p.payload).then((res) => {});

    super.handleOut(p);
    return null;
  }
}
