import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";
import Envelope from "../../assets/sprites/Envelope.png";
import Router from "../../assets/sprites/Router.png";
import { VisMode, visMode, speed } from "../../stores";
import type { Network, Node } from "../../net/net.js";

export let viewport: Viewport;
export let app: PIXI.Application<HTMLCanvasElement>;

export function placeCanvas(canvas: HTMLElement) {
  PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

  app = new PIXI.Application<HTMLCanvasElement>({
    backgroundAlpha: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    antialias: true,
    autoDensity: true,
  });

  viewport = new Viewport({
    worldWidth: 100,
    worldHeight: 100,
    events: app.renderer.events,
  });

  canvas.replaceChildren(app.view);
  app.stage.addChild(viewport);

  app.stage.position.y = window.innerHeight / 2;
  app.stage.position.x = window.innerWidth / 2;
  app.stage.scale.y = 2;
  app.stage.scale.x = 2;

  // Function to handle resize event
  function resize() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    viewport.resize(window.innerWidth, window.innerHeight);
  }

  // Listen for window resize events
  window.addEventListener("resize", resize);

  resize();
}

export async function addStarterObjects(net: Network) {
  // load the texture we need
  const envelopeTexture: PIXI.Texture<PIXI.Resource> =
    await PIXI.Assets.load(Envelope);
  const routerTexture: PIXI.Texture<PIXI.Resource> =
    await PIXI.Assets.load(Router);

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
    drawLine(edge, graph[0]);
  });

  graph[0].forEach((v, k) => {
    drawNode(v, routerTexture);
  });
}

function drawLine(edge: string[], nodeMap: Map<string, Node>) {
  let graphic = new PIXI.Graphics();

  viewport.addChild(graphic);
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

  viewport.addChild(graphic);
}

function drawNode(node: Node, texture: PIXI.Texture<PIXI.Resource>) {
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

  viewport.addChild(nodeSprite);
}
