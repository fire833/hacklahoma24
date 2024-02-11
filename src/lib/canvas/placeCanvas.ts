import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";
import Envelope from "../../assets/sprites/Envelope.png";
import Router from "../../assets/sprites/Router.png";
import { VisMode, visMode, speed } from "../../stores";
import type { Network } from "../../net/net.js";

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
