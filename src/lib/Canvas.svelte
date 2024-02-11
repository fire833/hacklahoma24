<script lang="ts">
  import { afterUpdate, onMount } from "svelte";
  import {
    viewport,
    app,
    placeCanvas,
    addStarterObjects,
  } from "./canvas/placeCanvas.js";
  import type { Network } from "../net/net.js";
  import type { Application } from "pixi.js";
  import type { Viewport } from "pixi-viewport";

  export let net: Network;

  let canvas: HTMLElement;

  onMount(async () => {
    placeCanvas(canvas);
    addStarterObjects(net);
  });

  afterUpdate(async () => {
    placeCanvas(canvas);
    addStarterObjects(net);
  })
</script>

<div class="canvas" bind:this={canvas} />

<style>
  .canvas {
    width: 100%;
  }
</style>
