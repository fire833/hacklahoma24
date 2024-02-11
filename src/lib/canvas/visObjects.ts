import type { Sprite } from "pixi.js";
import type { Network, Node } from "../../net/net.js";

export class VisNode {
  node: Node | undefined;
  sprite: Sprite | undefined;

  constructor(node: Node) {
    this.node = node;
    this.sprite = this.makeSprite();
  }

  // Creates PIXI Sprite object and returns it
  makeSprite(): Sprite {}
}

export class VisEdge {
  nodes: Set<Node> | undefined;
}

export class VisPacket {
  edge: VisEdge | undefined;
}
