import * as PIXI from "pixi.js";
import { Network, NodeType } from "../../net/net";
import { VisEdge, VisNode, VisPacket } from "./visObjects";

import Router from "../../assets/sprites/Router.png";
import Switch from "../../assets/sprites/Switch.png";
import Toaster from "../../assets/sprites/Toaster.png";
import Car from "../../assets/sprites/Car.png";
import Computer from "../../assets/sprites/Computer.png";

import { app } from "./placeCanvas.js";

export let dragging: any;

export class SimObject {
  offset: PIXI.Point = new PIXI.Point();
  net: Network;
  nodes: VisNode[] = [];
  edges: VisEdge[] = [];
  packets: VisPacket[] = [];
  dragTarget: any = null;

  constructor(net: Network) {
    this.net = net;
    this.buildObjects(net);
    this.setUpDrag();
  }

  tick(): void {}

  async loadTextures(): Promise<Map<NodeType, PIXI.Texture<PIXI.Resource>[]>> {
    let textureMap: Map<NodeType, PIXI.Texture<PIXI.Resource>[]> = new Map<
      NodeType,
      PIXI.Texture<PIXI.Resource>[]
    >();

    textureMap.set(NodeType.Router, [await PIXI.Assets.load(Router)]);
    textureMap.set(NodeType.Switch, [await PIXI.Assets.load(Switch)]);
    textureMap.set(NodeType.Machine, [
      await PIXI.Assets.load(Computer),
      await PIXI.Assets.load(Toaster),
      await PIXI.Assets.load(Car),
    ]);
    return textureMap;
  }

  async buildObjects(net: Network) {
    let textureMap: Map<NodeType, PIXI.Texture<PIXI.Resource>[]> =
      await this.loadTextures();
    // load the texture we need
    let graph = net.get_graph();

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

    // Draw nodes
    graph[0].forEach((v, k) => {
      let textures = textureMap.get(v.nodeType);
      let g = new VisNode(
        v,
        textures[Math.floor(Math.random() * textures.length)]
      );
      this.nodes.push(g);
      g.graphic.on("pointerdown", this.startDrag);
      g.graphic.on("pointerup", this.stopDrag);
      app.stage.addChild(<PIXI.DisplayObject>g.graphic);
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
    this.dragTarget = event.target;
    this.dragTarget.toLocal(event.global, null, this.offset);
    this.offset.x *= this.dragTarget.scale.x;
    this.offset.y *= this.dragTarget.scale.y;
    app.stage.on("pointermove", this.moveDrag);
  }

  // Handler for pointermove
  moveDrag(event: any): void {
    console.log("moveDrag");
    this.dragTarget.x = event.global.x - this.offset.x;
    this.dragTarget.y = event.global.y - this.offset.y;
  }

  stopDrag() {
    console.log("stopDrag");
    app.stage.cursor = "inherit";
    app.stage.off("pointermove", this.moveDrag);
  }
}
