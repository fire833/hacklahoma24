<script lang="ts">
  import { afterUpdate, onMount } from "svelte";
  import { viewport, app, placeCanvas } from "./canvas/placeCanvas.js";
  import type { Network } from "../net/net.js";
  import type { Application } from "pixi.js";
  import type { Viewport } from "pixi-viewport";
  import { SimObject } from "./canvas/sim.js";

  export let net: Network;

  let canvas: HTMLElement;

  afterUpdate(async () => {
    placeCanvas(canvas);
    new SimObject(net);
  });
</script>

<div class="canvas" bind:this={canvas} />

<style>
  .canvas {
    position: absolute;
    width: 100%;
  }
</style>
