import * as PIXI from 'pixi.js';
import Envelope from "../../assets/sprites/Envelope.png";
import Router from "../../assets/sprites/Router.png";
import { VisMode } from "../../stores";
import type { Network } from "../../net/net.js";

export function placeCanvas(canvas: HTMLElement) {
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    // The application will create a renderer using WebGL, if possible,
    // with a fallback to a canvas render. It will also setup the ticker
    // and the root stage PIXI.Container
    const app = new PIXI.Application<HTMLCanvasElement>({backgroundAlpha: 0});

    // Function to handle resize event
    function resize() {
      app.renderer.resize(window.innerWidth, window.innerHeight);
    }

    // Listen for window resize events
    window.addEventListener("resize", resize);

    resize();

    // The application will create a canvas element for you that you
    // can then insert into the DOM
    canvas.replaceChildren(app.view);

    app.stage.position.y = window.innerHeight / 2;
    app.stage.position.x = window.innerWidth   / 2;
    app.stage.scale.y = 3;
    app.stage.scale.x = 3;

    return app;
  }

export async function addStarterObjects(app: PIXI.Application<HTMLCanvasElement>, net: Network, speed: Number, visMode: VisMode) {

  
    
const back = new PIXI.Container();
const foreground = new PIXI.Container()
const viewport = new PIXI.Viewport({
    worldWidth: 800,
    worldHeight: 800,
    passiveWheel: true,                            // whether the 'wheel' event is set to passive (note: if false, e.preventDefault() will be called when wheel is used over the viewport)
});
  
    // load the texture we need
    const envelopeTexture = await PIXI.Assets.load(Envelope);
    const routerTexture = await PIXI.Assets.load(Router);


    const text = new PIXI.HTMLText("Speed: " + speed + " visMode: " + visMode, {
      fontSize: 20,
      fill: "white",
    });
    text.x = app.renderer.width / 2;
    text.y = app.renderer.height / 2;


    net.get_graph()[0].forEach((v,k) => {
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

      app.stage.addChild(nodeSprite);
    })

    // This creates a texture from a 'bunny.png' image
    const bunny = new PIXI.Sprite(envelopeTexture);

    // Setup the position of the bunny
    bunny.x = app.renderer.width / 2;
    bunny.y = app.renderer.height / 2;

    // Rotate around the center
    bunny.anchor.x = 0.5;
    bunny.anchor.y = 0.5;

    // Add the bunny to the scene we are building
    app.stage.addChild(text);
    app.stage.addChild(bunny);

    // Listen for frame updates
    app.ticker.add(() => {
      // each frame we spin the bunny around a bit
      bunny.rotation += 0.01;
    });
}