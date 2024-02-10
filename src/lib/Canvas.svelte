<script lang="ts">
  import { Application, Assets, Sprite } from "pixi.js";
  import { onMount } from "svelte";
  import Envelope from "../assets/sprites/Envelope.png";

  let canvas: HTMLElement;

  onMount(async () => {
    // The application will create a renderer using WebGL, if possible,
    // with a fallback to a canvas render. It will also setup the ticker
    // and the root stage PIXI.Container
    const app = new Application<HTMLCanvasElement>();

    // The application will create a canvas element for you that you
    // can then insert into the DOM
    canvas.appendChild(app.view);

    // load the texture we need
    const texture = await Assets.load(Envelope);

    // This creates a texture from a 'bunny.png' image
    const bunny = new Sprite(texture);

    // Setup the position of the bunny
    bunny.x = app.renderer.width / 2;
    bunny.y = app.renderer.height / 2;

    // Rotate around the center
    bunny.anchor.x = 0.5;
    bunny.anchor.y = 0.5;

    // Add the bunny to the scene we are building
    app.stage.addChild(bunny);

    // Listen for frame updates
    app.ticker.add(() => {
      // each frame we spin the bunny around a bit
      bunny.rotation += 0.01;
    });
  });
</script>

<div bind:this={canvas}>Canvas</div>
