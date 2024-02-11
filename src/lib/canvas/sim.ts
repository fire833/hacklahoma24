import * as PIXI from "pixi.js";
import type { Network } from "../../net/net";
import { VisEdge, VisNode, VisPacket } from "./visObjects";

import Envelope from "../../assets/sprites/Envelope.png";
import Router from "../../assets/sprites/Router.png";

import { viewport, app, placeCanvas } from "./placeCanvas.js";

export class Sim {
  net: Network;
  nodes: VisNode[] = [];
  edges: VisEdge[] = [];
  packets: VisPacket[] = [];

  constructor(net: Network) {
    this.net = net;
    this.buildObjects(net);
  }

  tick(): void {}

  async loadTextures(): Promise<PIXI.Texture[]> {
    const envelopeTexture: PIXI.Texture<PIXI.Resource> =
      await PIXI.Assets.load(Envelope);
    const routerTexture: PIXI.Texture<PIXI.Resource> =
      await PIXI.Assets.load(Router);
    return [envelopeTexture, routerTexture];
  }

  async buildObjects(net: Network) {
    let textures: PIXI.Texture[] = await this.loadTextures();
    // load the texture we need
    let graph = net.get_graph();

    // Make fake edges for debugging

    let edges: string[][] = [];

    let nodeArray = Array.from(graph[0].keys());

    graph[0].forEach((v, k) => {
      let otherNode: string =
        nodeArray[Math.floor(Math.random() * nodeArray.length)];
      edges.push(Array(k, otherNode));
    });

    // Draw edges

    edges.forEach((edge) => {
      let g = new VisEdge(edge, graph[0]);
      this.edges.push(g);
      viewport.addChild(<PIXI.DisplayObject>g.graphic);
    });

    graph[0].forEach((v, k) => {
      let g = new VisNode(v, textures[1]);
      this.nodes.push(g);
      viewport.addChild(<PIXI.DisplayObject>g.graphic);
    });
  }
}
