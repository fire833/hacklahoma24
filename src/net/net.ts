import { FirewallError, NetworkError } from "./errors";
import { makeString } from "./random";

// Generic node type that is used for all subtypes.
export default class Node {
  public inPacketLog: [Packet];
  public outPacketLog: [Packet];

  // assign a random node id to each node we create.
  public id: string = "node-" + makeString(8);

  private fwRules: Array<FirewallRule> = new Array<FirewallRule>();

  constructor(id?: string, fwRules?: Array<FirewallRule>) {
    this.id = id;
    this.fwRules = fwRules;
  }

  // If return false, don't forward the packet since it was handled by the super node.
  // Returns the node to forward to and the output packet, or null
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
  // no further forwarding will occur.
  handle(p: Packet): [string, Packet] | NetworkError;
}

export class Network {
  public net: Map<string, Node> = new Map<string, Node>();

  // Start at a certain node, and route the packet across the network.
  public send_packet(source: string, p: Packet): NetworkError | null {
    return null;
  }
}

export class Packet {
  public srcmac: string;
  public dstmac: string;
  public srcip: string;
  public dstip: string;

  public payload: string;
}

export class FirewallRule {
  public dstIps: [string];

  public evaluatePacket(p: Packet): boolean {
    return true;
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
  public handle(p: Packet): [string, Packet] | NetworkError {
    let err = super.handleIn(p);
    if (err) {
      return err;
    }

    if (this.macToIface.has(p.dstmac)) {
      return [this.macToIface.get(p.dstmac), p];
    }

    super.handleOut(p);
    return null;
  }

  public add_neighbor(mac: string, node: string) {
    if (this.macToIface.size + 1 < this.ports) this.macToIface.set(mac, node);
  }
}

export class Router extends Node implements PacketHandler {
  constructor() {
    super();
  }

  public handle(p: Packet): [string, Packet] | NetworkError {
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

  public handle(p: Packet): [string, Packet] | NetworkError {
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

  public handle(p: Packet): [string, Packet] | NetworkError {
    let err = super.handleIn(p);
    if (err) {
      return err;
    }

    // fetch(p.payload).then((res) => {});

    super.handleOut(p);
    return null;
  }
}
