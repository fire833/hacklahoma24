import { Address4 } from "ip-address";
import { broadcastmac } from "./consts";
import {
  NetworkError,
  NoNodeError,
  NoRouteError,
  NoSwitchportError,
} from "./errors";
import { MachineApplication, Network, Node, Packet } from "./net";

export class Switch extends Node {
  // internal lookup table of MAC adresses to external nodes.
  private macToIface: Map<string, string> = new Map<string, string>();
  private numPorts: number;

  constructor(ports: number, id?: string) {
    super(0, id);
    this.numPorts = ports;
  }

  // Returns the node to forward to and the output packet, or null
  public handle(p: Packet, net: Network): Array<NetworkError> | null {
    let arr = Array();
    let err = super.handleIn(p);
    if (err) {
      arr.push(err);
      return arr;
    }

    if (p.dstmac === broadcastmac) {
      for (let neigh of this.macToIface) {
        let node = net.net.get(neigh[1]);
        if (node) {
          node.appendPacket(p);
        } else {
          arr.push(NoNodeError);
        }
      }
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

  public add_neighbor(mac: string, node: string) {
    if (this.macToIface.size + 1 <= this.numPorts)
      this.macToIface.set(mac, node);
  }

  public get_num_active_ports() {
    return this.macToIface.size;
  }

  public override get_edges(): Array<[string, string]> {
    let arr = Array();
    for (let m of this.macToIface) {
      arr.push([super.id, m[1]]);
    }

    return arr;
  }
}

export class Router extends Node {
  private subnetToIface: Map<Address4, string> = new Map<Address4, string>();

  constructor(ports: number, id?: string) {
    super(ports, id);
  }

  public handle(p: Packet, net: Network): Array<NetworkError> | null {
    let arr = Array();
    let err = super.handleIn(p);
    if (err) {
      arr.push(err);
      return arr;
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

  public handle(p: Packet, net: Network): Array<NetworkError> | null {
    let arr = Array();
    let err = super.handleIn(p);
    if (err) {
      arr.push(err);
      return arr;
    }

    switch (p.app) {
      case MachineApplication.Ping: {
      }
    }

    super.handleOut(p);
    return null;
  }
}

export class InternetGateway extends Node {
  constructor(id?: string) {
    super(1, id);
  }

  public handle(p: Packet, net: Network): Array<NetworkError> | null {
    let arr = Array();
    let err = super.handleIn(p);
    if (err) {
      arr.push(err);
      return arr;
    }

    // fetch(p.payload).then((res) => {});

    super.handleOut(p);
    return null;
  }
}
