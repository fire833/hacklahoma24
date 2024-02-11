import * as PIXI from "pixi.js";
import type { Network, Node } from "../../net/net.js";

export class VisNode {
  node: Node | undefined;
  graphic: PIXI.Sprite | undefined;

  constructor(node: Node, texture: PIXI.Texture<PIXI.Resource>) {
    this.node = node;
    this.graphic = this.makeGraphic(node, texture);
  }

  // Creates PIXI Sprite object and returns it
  makeGraphic(node: Node, texture: PIXI.Texture<PIXI.Resource>): PIXI.Sprite {
    const nodeSprite = new PIXI.Sprite(texture);

    if (node.nodeX) {
      nodeSprite.x = node.nodeX - nodeSprite.width / 2;
    } else {
      nodeSprite.x = 0;
    }
    if (node.nodeY) {
      nodeSprite.y = node.nodeY - (3 * nodeSprite.height) / 4;
    } else {
      nodeSprite.y = 0;
    }

    return nodeSprite;
  }
}

export class VisEdge {
  nodes: Set<Node> | undefined;
  graphic: PIXI.Graphics | undefined;

  constructor(edge: string[], nodeMap: Map<string, Node>) {
    this.graphic = this.makeGraphic(edge, nodeMap);
  }

  makeGraphic(edge: string[], nodeMap: Map<string, Node>): PIXI.Graphics {
    let graphic = new PIXI.Graphics();

    let x1 = 0;
    let y1 = 0;

    if (undefined !== nodeMap.get(edge[0])) {
      x1 = nodeMap.get(edge[0]).nodeX;
      y1 = nodeMap.get(edge[0]).nodeY;
    }

    let x2 = 0;
    let y2 = 0;
    if (undefined !== nodeMap.get(edge[1])) {
      x2 = nodeMap.get(edge[1]).nodeX;
      y2 = nodeMap.get(edge[1]).nodeY;
    }

    graphic.moveTo(x1, y1);

    graphic.lineStyle(2, 0xc70cd2).lineTo(x2, y2);

    graphic.closePath();
    graphic.endFill();

    return graphic;
  }
}

export class VisPacket {
  edge: VisEdge | undefined;
}
