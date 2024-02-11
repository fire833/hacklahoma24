import { Address4 } from "ip-address";
import { broadcastmac } from "./consts";
import {
  NetworkError,
  NoNodeError,
  NoPortError,
  NoSwitchportError,
} from "./errors";
import { Network, Node, Packet, PacketType } from "./net";

enum NodeType {
  Router,
  Machine,
  InternetGateway,
  Switch,
}

export class Switch extends Node {
  constructor(ports: number, id?: string, x?: number, y?: number) {
    super(ports, id, x, y);
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
      for (let neigh of this.interfaces)
        if (neigh[1][2]) {
          let node = net.net.get(neigh[1][2]);
          if (node) {
            p.srcnode = super.id;
            node.appendPacket(p);
            super.handleOut(p);
          } else {
            arr.push(NoNodeError);
          }
        }
      return null;
    } else if (this.getInterfaceToForward(p.dstmac)) {
      let dstnode = this.getInterfaceToForward(p.dstmac);
      if (dstnode) {
        let n = net.net.get(dstnode);
        if (n) {
          p.srcnode = super.id;
          n.appendPacket(p);
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
    } else {
      arr.push(NoNodeError);
      return arr;
    }
  }

  private getInterfaceToForward(dstmac: string): string | null {
    for (let iface of super.interfaces) {
      if (iface[1][3] === dstmac) return iface[1][2];
    }

    return null;
  }

  public override toJSON(): object {
    return {
      type: NodeType.Switch,
      super: super.toJSON(),
    };
  }

  public static parseJSON(json: string): Switch {
    let returnSwitch = new Switch(1);
    let parsedJSON = JSON.parse(json);

    returnSwitch.inPacketLog = parsedJSON.super.inPacketLog;
    returnSwitch.outPacketLog = parsedJSON.super.outPacketLog;
    returnSwitch.currPacketQueue = parsedJSON.super.currPacketQueue;
    returnSwitch.nextPacketQueue = parsedJSON.super.nextPacketQueue;
    try {
      returnSwitch.arpTable = new Map<Address4, [string, string]>(parsedJSON.super.arpTable);
    } catch (error) {
      returnSwitch.arpTable = new Map<Address4, [string, string]>();
    }
    try {
      returnSwitch.interfaces = new Map<number, [Address4 | null, string | null, string | null, string | null]>(parsedJSON.super.interfaces);
    } catch (error) {
      returnSwitch.interfaces = new Map<number, [Address4 | null, string | null, string | null, string | null]>();
    }
    returnSwitch.id = parsedJSON.super.id;
    returnSwitch.fwRules = parsedJSON.super.fwRules;
    returnSwitch.nodeX = parsedJSON.super.nodeX;
    returnSwitch.nodeY = parsedJSON.super.nodeY;

    return returnSwitch;
  }

  // Custom edge code for switches only.
  public override add_edge(other: Node): NetworkError | null {
    let lindex = this.get_free_nic();
    let rindex = other.get_free_nic();
    if (lindex && rindex) {
      let curr = this.interfaces.get(lindex);
      let outside = other.interfaces.get(rindex);
      if (curr && outside) {
        // Setting address, current iface MAC, other node ID, outside MAC.
        this.interfaces.set(lindex, [null, curr[1], other.id, outside[1]]);
        other.interfaces.set(rindex, [outside[0], outside[1], this.id, null]);
      } else {
        return NoPortError;
      }
      return null;
    } else {
      return NoPortError;
    }
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
        super.resolveArpResponse(p, net);
        break;
      }
      default: {
        super.route(p, net);
      }
    }

    return arr;
  }

  public override toJSON(): object {
    return {
      type: NodeType.Router,
      super: super.toJSON(),
    };
  }

  public static parseJSON(json: string): Router {
    let returnRouter = new Router(1);
    let parsedJSON = JSON.parse(json);

    returnRouter.inPacketLog = parsedJSON.super.inPacketLog;
    returnRouter.outPacketLog = parsedJSON.super.outPacketLog;
    returnRouter.currPacketQueue = parsedJSON.super.currPacketQueue;
    returnRouter.nextPacketQueue = parsedJSON.super.nextPacketQueue;
    try {
      returnRouter.arpTable = new Map<Address4, [string, string]>(parsedJSON.super.arpTable);
    } catch (error) {
      returnRouter.arpTable = new Map<Address4, [string, string]>();
    }
    try {
      returnRouter.interfaces = new Map<number, [Address4 | null, string | null, string | null, string | null]>(parsedJSON.super.interfaces);
    } catch (error) {
      returnRouter.interfaces = new Map<number, [Address4 | null, string | null, string | null, string | null]>();
    }
    returnRouter.id = parsedJSON.super.id;
    returnRouter.fwRules = parsedJSON.super.fwRules;
    returnRouter.nodeX = parsedJSON.super.nodeX;
    returnRouter.nodeY = parsedJSON.super.nodeY;

    return returnRouter;
  }
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

  public setIP(ip: Address4): void {
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
      case PacketType.ARPRequest: {
        super.resolveArpRequest(p, net);
        break;
      }
      case PacketType.ARPResponse: {
        super.resolveArpResponse(p, net);
        break;
      }
      case PacketType.Ping: {
        let n = net.net.get(p.srcnode);
        if (n) {
          n.appendPacket(
            new Packet(
              this.id,
              p.dstmac,
              p.srcmac,
              p.dstip,
              p.srcip,
              "",
              PacketType.Ping
            )
          );
        }
      }
      case PacketType.SSH: {
        let n = net.net.get(p.srcnode);
        if (n) {
          n.appendPacket(
            new Packet(
              this.id,
              p.dstmac,
              p.srcmac,
              p.dstip,
              p.srcip,
              "",
              PacketType.SSH
            )
          );
        }
      }
      case PacketType.VideoStream: {
        let n = net.net.get(p.srcnode);
        if (n) {
          n.appendPacket(
            new Packet(
              this.id,
              p.dstmac,
              p.srcmac,
              p.dstip,
              p.srcip,
              "",
              PacketType.VideoStream
            )
          );
        }
      }
    }

    return null;
  }

  public override toJSON(): object {
    return {
      type: NodeType.Machine,
      super: super.toJSON(),
      ip: this.ip,
      mType: this.mType,
    };
  }

  public static parseJSON(json: string): Machine {
    let returnMachine = new Machine(1, new Address4("1.1.1.1"));
    let parsedJSON = JSON.parse(json);

    returnMachine.inPacketLog = parsedJSON.super.inPacketLog;
    returnMachine.outPacketLog = parsedJSON.super.outPacketLog;
    returnMachine.currPacketQueue = parsedJSON.super.currPacketQueue;
    returnMachine.nextPacketQueue = parsedJSON.super.nextPacketQueue;
    try {
      returnMachine.arpTable = new Map<Address4, [string, string]>(parsedJSON.super.arpTable);
    } catch (error) {
      returnMachine.arpTable = new Map<Address4, [string, string]>();
    }
    try {
      returnMachine.interfaces = new Map<number, [Address4 | null, string | null, string | null, string | null]>(parsedJSON.super.interfaces);
    } catch (error) {
      returnMachine.interfaces = new Map<number, [Address4 | null, string | null, string | null, string | null]>();
    }
    returnMachine.id = parsedJSON.super.id;
    returnMachine.fwRules = parsedJSON.super.fwRules;
    returnMachine.nodeX = parsedJSON.super.nodeX;
    returnMachine.nodeY = parsedJSON.super.nodeY;
    returnMachine.setIP(parsedJSON.ip);
    returnMachine.mType = parsedJSON.mType;

    return returnMachine;
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

  public override toJSON(): object {
    return {
      type: NodeType.InternetGateway,
      super: super.toJSON(),
    };
  }

  public static parseJSON(json: string): InternetGateway {
    let returnInternetGateway = new Router(1);
    let parsedJSON = JSON.parse(json);

    returnInternetGateway.inPacketLog = parsedJSON.super.inPacketLog;
    returnInternetGateway.outPacketLog = parsedJSON.super.outPacketLog;
    returnInternetGateway.currPacketQueue = parsedJSON.super.currPacketQueue;
    returnInternetGateway.nextPacketQueue = parsedJSON.super.nextPacketQueue;
    returnInternetGateway.arpTable = parsedJSON.super.arpTable;
    returnInternetGateway.interfaces = parsedJSON.super.interfaces;
    returnInternetGateway.id = parsedJSON.super.id;
    returnInternetGateway.fwRules = parsedJSON.super.fwRules;
    returnInternetGateway.nodeX = parsedJSON.super.nodeX;
    returnInternetGateway.nodeY = parsedJSON.super.nodeY;

    return returnInternetGateway;
  }
}
