<script lang="ts">
  import { afterUpdate, onMount } from "svelte";
  import { placeCanvas } from "./canvas/render.js";
  import { speed, visMode } from "../stores";

  let canvas: HTMLElement;

  afterUpdate(() => {
    placeCanvas(canvas, $speed, $visMode);
  });
</script>

<div class="canvas" bind:this={canvas} />

<style>
  .canvas {
    min-height: 100%;
    width: 100%;
  }
</style>
