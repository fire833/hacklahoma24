<script lang="ts">
  import { speed } from "../../stores.js";

  let setting: Number;

  speed.subscribe((value) => {
    setting = value;
  });

  function updateSpeed() {
    setting = document.getElementById("sendSpeed").value;
    speed.update(() => setting);
  }
</script>

<div id="bg">
  <input
    type="range"
    min="1"
    max="100"
    on:change={() => updateSpeed()}
    class="slider"
    id="sendSpeed"
  />
</div>

<style>
  #bg {
    justify-content: space-between;
    background-color: rgb(58, 52, 52);
    padding: 10px;
    margin: 0 auto;
  }
</style>
