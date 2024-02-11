import * as PIXI from "pixi.js";
import type { Network } from "../../net/net";
import { VisEdge, VisNode, VisPacket } from "./visObjects";

import Envelope from "../../assets/sprites/Envelope.png";
import Router from "../../assets/sprites/Router.png";

import { viewport, app, placeCanvas } from "./placeCanvas.js";

export let dragging: any;
let offset = new PIXI.Point();
let dragTarget: any;

export class SimObject {
  net: Network;
  nodes: VisNode[] = [];
  edges: VisEdge[] = [];
  packets: VisPacket[] = [];

  constructor(net: Network) {
    this.net = net;
    this.buildObjects(net);
    this.setUpDrag();
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
      app.stage.addChild(<PIXI.DisplayObject>g.graphic);
    });

    graph[0].forEach((v, k) => {
      let g = new VisNode(v, textures[1]);
      this.nodes.push(g);
      app.stage.addChild(<PIXI.DisplayObject>g.graphic);
      g.graphic.on("pointerdown", this.startDrag);
      g.graphic.on("pointerup", this.stopDrag);
    });
  }

  setUpDrag() {
    app.stage.interactive = true;
    app.stage.hitArea = app.screen;
    console.log("setUpDrag");
  }

  startDrag(event: any) {
    console.log("startDrag");
    app.stage.cursor = "pointer";
    dragTarget = event.target;
    dragTarget.toLocal(event.global, null, offset);
    offset.x *= dragTarget.scale.x;
    offset.y *= dragTarget.scale.y;
    app.stage.on("pointermove", this.moveDrag);
  }

  // Handler for pointermove
  moveDrag(event: any): void {
    console.log("moveDrag");
    dragTarget.x = event.global.x - offset.x;
    dragTarget.y = event.global.y - offset.y;
  }

  stopDrag() {
    console.log("stopDrag");
    app.stage.cursor = "inherit";
    app.stage.off("pointermove", this.moveDrag);
  }
}
