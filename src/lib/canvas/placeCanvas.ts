import { Viewport } from "pixi-viewport";
import * as PIXI from "pixi.js";

export let viewport: Viewport;
export let app: PIXI.Application<HTMLCanvasElement>;
export let ticker = PIXI.Ticker.shared;

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

  app.view.setAttribute("style", "cursor:auto");

  canvas.replaceChildren(app.view);
  app.stage.addChild(viewport);

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
