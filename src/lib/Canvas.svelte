<script lang="ts">
  import { afterUpdate, onMount } from "svelte";
  import { addStarterObjects, placeCanvas } from "./canvas/placeCanvas.js";
  import { speed, visMode } from "../stores";
  import type { Network } from "../net/net.js";
  import type { Application } from "pixi.js";

  export let net: Network;

  let canvas: HTMLElement;

  let app: Application<HTMLCanvasElement>;

  onMount(async () => {
    app = placeCanvas(canvas);
    addStarterObjects(app, net, $speed, $visMode);
  });
</script>

<div class="canvas" bind:this={canvas} />

<style>
  .canvas {
    width: 100%;
  }
</style>
