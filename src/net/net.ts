import { Address4 } from "ip-address";
import {
  FirewallError,
  NetworkError,
  NoNodeError,
  NoSwitchportError,
} from "./errors";
import { makeString } from "./random";

// Generic node type that is used for all subtypes.
export default class Node {
  public inPacketLog: Array<Packet> = new Array<Packet>();
  public outPacketLog: Array<Packet> = new Array<Packet>();

  // assign a random node id to each node we create.
  public id: string = "node-" + makeString(8);

  private fwRules: Array<FirewallRule> = new Array<FirewallRule>();

  constructor(fwRules?: Array<FirewallRule>, id?: string) {
    if (id) {
      this.id = id;
    }
    if (this.fwRules !== null && this.fwRules !== undefined) {
      this.fwRules = fwRules;
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

  public handleOut(p: Packet) {
    this.outPacketLog.push(p);
  }

  public addRule(rule: FirewallRule) {
    this.fwRules.push(rule);
  }
}

export interface PacketHandler {
  // Either returns the packet to forward to a new node, or if null then
  // no further forwarding will occur, or an error means abort because something
  // went wrong.
  handle(p: Packet): [string, Packet] | NetworkError | null;
}

export class Network {
  public net: Map<string, Node> = new Map<string, Node>();

  // Start at a certain node, and route the packet across the network.
  public send_packet(source: string, p: Packet): NetworkError | null {
    let activeNode: Node = null;

    let n = this.net.get(source);
    if (n) {
      activeNode = n;
    }
    {
      return NoNodeError;
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

  public evaluatePacket(p: Packet): NetworkError | null {
    for (let ip of this.dstIps) {
      if (p.dstip.isInSubnet(ip)) {
        return FirewallError;
      }
    }

    return null;
  }
}

export class Switch extends Node implements PacketHandler {
  private ports: number;
  // internal lookup table of MAC adresses to external nodes.
  private macToIface: Map<string, string> = new Map<string, string>();

  constructor(ports: number) {
    super();
    this.ports = ports;
  }

  // Returns the node to forward to and the output packet, or null
  public handle(p: Packet): [string, Packet] | NetworkError | null {
    let err = super.handleIn(p);
    if (err) {
      return err;
    }

    if (this.macToIface.has(p.dstmac)) {
      super.handleOut(p);
      let n = this.macToIface.get(p.dstmac);
      if (n) {
        return [n, p];
      } else {
        return NoNodeError;
      }
    } else {
      return NoSwitchportError;
    }
  }

  public add_neighbor(mac: string, node: string) {
    if (this.macToIface.size + 1 < this.ports) this.macToIface.set(mac, node);
  }

  public get_num_active_ports() {
    return this.macToIface.size;
  }
}

export class Router extends Node implements PacketHandler {
  constructor() {
    super();
  }

  public handle(p: Packet): [string, Packet] | NetworkError | null {
    let err = super.handleIn(p);
    if (err) {
      return err;
    }

    super.handleOut(p);
    return null;
  }
}

export class Machine extends Node implements PacketHandler {
  constructor() {
    super();
  }

  public handle(p: Packet): [string, Packet] | NetworkError | null {
    let err = super.handleIn(p);
    if (err) {
      return err;
    }

    super.handleOut(p);
    return null;
  }
}

export class InternetGateway extends Node implements PacketHandler {
  constructor() {
    super();
  }

  public handle(p: Packet): [string, Packet] | NetworkError | null {
    let err = super.handleIn(p);
    if (err) {
      return err;
    }

    // fetch(p.payload).then((res) => {});

    super.handleOut(p);
    return null;
  }
}
