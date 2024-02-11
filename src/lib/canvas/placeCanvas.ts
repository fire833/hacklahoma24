import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";
import Envelope from "../../assets/sprites/Envelope.png";
import Router from "../../assets/sprites/Router.png";
import { VisMode, visMode, speed } from "../../stores";
import type { Network } from "../../net/net.js";

export let viewport: Viewport;

export function placeCanvas(
  canvas: HTMLElement
): [PIXI.Application<HTMLCanvasElement>, Viewport] {
  PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // The application will create a renderer using WebGL, if possible,
  // with a fallback to a canvas render. It will also setup the ticker
  // and the root stage PIXI.Container
  const app = new PIXI.Application<HTMLCanvasElement>({
    backgroundAlpha: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    antialias: true,
    autoDensity: true,
  });

  // The application will create a canvas element for you that you
  // can then insert into the DOM
  canvas.replaceChildren(app.view);

  viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: 100,
    worldHeight: 100,
    events: app.renderer.events,
  })
    .drag()
    .pinch()
    .wheel()
    .decelerate();

  app.stage.addChild(viewport);

  app.ticker.start();

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

  return [app, viewport];
}

export async function addStarterObjects(
  app: PIXI.Application<HTMLCanvasElement>,
  net: Network
) {
  // load the texture we need
  const envelopeTexture = await PIXI.Assets.load(Envelope);
  const routerTexture = await PIXI.Assets.load(Router);

  let text = new PIXI.HTMLText("Speed: " + speed + " visMode: " + visMode, {
    fontSize: 20,
    fill: "white",
  });

  viewport.addChild(text);

  speed.subscribe((value) => {
    text.text = "Speed: " + value;
  });

  net.get_graph()[0].forEach((v, k) => {
    // This creates a texture from a 'bunny.png' image
    const nodeSprite = new PIXI.Sprite(routerTexture);
    nodeSprite.roundPixels = true;

    // Setup the position of the bunny
    if (v.nodeX) {
      nodeSprite.x = v.nodeX;
    } else {
      nodeSprite.x = 0;
    }
    if (v.nodeY) {
      nodeSprite.y = v.nodeY;
    } else {
      nodeSprite.y = 0;
    }

    viewport.addChild(nodeSprite);
  });
}
