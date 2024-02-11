import { Application, Assets, Sprite, HTMLText } from "pixi.js";
import Envelope from "../../assets/sprites/Envelope.png";
import Router from "../../assets/sprites/Router.png";
import { VisMode } from "../../stores";
import type { Network } from "../../net/net.js";

export function placeCanvas(canvas: HTMLElement) {
    // The application will create a renderer using WebGL, if possible,
    // with a fallback to a canvas render. It will also setup the ticker
    // and the root stage PIXI.Container
    const app = new Application<HTMLCanvasElement>({backgroundAlpha: 0});

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


    return app;
  }

export async function addStarterObjects(app: Application<HTMLCanvasElement>, net: Network, speed: Number, visMode: VisMode) {
  
    // load the texture we need
    const envelopeTexture = await Assets.load(Envelope);
    const routerTexture = await Assets.load(Router);


    const text = new HTMLText("Speed: " + speed + " visMode: " + visMode, {
      fontSize: 20,
      fill: "white",
    });
    text.x = app.renderer.width / 2;
    text.y = app.renderer.height / 2;


    net.get_graph()[0].forEach((v,k) => {
      // This creates a texture from a 'bunny.png' image
      const nodeSprite = new Sprite(routerTexture);

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
    const bunny = new Sprite(envelopeTexture);

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