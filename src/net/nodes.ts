import { Address4 } from "ip-address";
import { broadcastmac } from "./consts";
import { NetworkError, NoNodeError, NoSwitchportError } from "./errors";
import { Network, Node, Packet, PacketType } from "./net";

export class Switch extends Node {
  // internal lookup table of MAC adresses to external nodes.
  private macToIface: Map<string, string> = new Map<string, string>();
  private numPorts: number;

  constructor(ports: number, id?: string, x?: number, y?: number) {
    super(0, id, x, y);
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
        p.srcnode = super.id;
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
        p.srcnode = super.id;
        super.handleOut(p);
        return null;
      } else {
        arr.push(NoNodeError);
        return arr;
      }
    } else {
      arr.push(NoSwitchportError);
      return arr;
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

  public override toJSON() : string {
    return JSON.stringify({
      "super": super.toJSON(),
      "macToIface": this.macToIface,
      "numPorts": this.numPorts,
    })
  }
}

export class Router extends Node {
  constructor(ports: number, id?: string, x?: number, y?: number) {
    super(ports, id, x, y);
  }

  public handle(p: Packet, net: Network): Array<NetworkError> | null {
    let arr = Array();
    let err = super.handleIn(p);
    if (err) {
      arr.push(err);
      return arr;
    }

    switch (p.app) {
      case PacketType.ARPRequest: {
        super.resolveArpRequest(p, net);
        break;
      }
      case PacketType.ARPResponse: {
        super.resolveArpResponse(p);
        break;
      }
      default: {
        for (let route of super.interfaces) {
          // if we find an interface with the same subnet, we need to forward to that network.
          if (route[1][0] && p.dstip.isInSubnet(route[1][0])) {
            let n = super.arpTable.get(p.dstip); // If we don't have a
            if (n) {
              let found = super.findAddrCached(p.dstip);
              if (found) {
                let newP = p;

                super.handleOut(newP);
                return null;
              }
            } else {
              super.interfaces;
            }
          }
        }
      }
    }

    return arr;
  }

  public add_route(subnet: Address4, node: string) {}
}

export enum MachineType {
  Computer,
  Car,
  Toaster,
}

function randomMachineType(): MachineType {
  let num = Math.floor(Math.random() * 3);
  switch (num) {
    case 0:
      return MachineType.Computer;
    case 1:
      return MachineType.Car;
    default:
      return MachineType.Toaster;
  }
}

export class Machine extends Node {
  private ip: Address4;
  public mType: MachineType = randomMachineType();

  constructor(
    ports: number,
    ip: Address4,
    id?: string,
    mType?: MachineType,
    x?: number,
    y?: number
  ) {
    super(ports, id, x, y);
    this.ip = ip;
    if (mType) {
      this.mType = mType;
    }
  }

  public handle(p: Packet, net: Network): Array<NetworkError> | null {
    let arr = Array();
    let err = super.handleIn(p);
    if (err) {
      arr.push(err);
      return arr;
    }

    switch (p.app) {
      case PacketType.ARPRequest: {
        super.resolveArpRequest(p, net);
        break;
      }
      case PacketType.ARPResponse: {
        super.resolveArpResponse(p);
        break;
      }
      case PacketType.Ping: {
        if (net.net.get(p.srcnode)) {
        }
      }
      case PacketType.SSH: {
      }
      case PacketType.VideoStream: {
      }
    }

    return null;
  }

  public override toJSON() : string {
    return JSON.stringify({
      "super": super.toJSON(),
      "ip": this.ip,
      "mType": this.mType,
    })
  }
}

export class InternetGateway extends Node {
  constructor(id?: string, x?: number, y?: number) {
    super(1, id, x, y);
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
