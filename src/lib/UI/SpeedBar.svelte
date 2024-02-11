<script lang="ts">
  import { speed } from "../../stores.js";

  let slider: HTMLInputElement;

  function updateSpeed() {
    speed.update(() => Number(slider.value));
  }
</script>

<div id="bg">
  <div>Simulation Speed</div>
  <div>
    <input
      type="range"
      min="1"
      max="100"
      bind:this={slider}
      on:input={updateSpeed}
    />
    <div id="labels">
      <div>1 t/s</div>
      <div>100 t/s</div>
    </div>
  </div>
</div>

<style>
  #bg {
    display: flex;
    flex-direction: row;

    padding: 20px;
    margin: 0 auto;
    background-color: rgb(58, 52, 52);

    align-items: center;
    gap: 20px;
  }

  #labels {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
  }

  input[type="range"]::-webkit-slider-runnable-track {
    background: #ddd;
    border: none;
    border-radius: 3px;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    border: none;
    height: 16px;
    width: 16px;
    background: url("../../assets/sprites/Slider.png");
  }
</style>
