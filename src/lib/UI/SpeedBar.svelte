<script lang="ts">
  import { speed } from "../../stores.js";

  let setting: Number;

  speed.subscribe((value) => {
    setting = value;
  });

  function updateSpeed(num: Number) {
    speed.update(() => num);
  }
</script>

<div id="bg">
  <input
    type="range"
    min="1"
    max="100"
    value={setting}
    on:change={() => updateSpeed(setting)}
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
