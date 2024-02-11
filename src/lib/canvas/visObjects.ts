import type { Network, Node } from "../../net/net.js";

export class VisNode {
  node: Node | undefined;
}

export class VisEdge {
  nodes: Set<Node> | undefined;
}

export class VisPacket {
  edge: VisEdge | undefined;
}
