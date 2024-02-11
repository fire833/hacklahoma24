<script lang="ts">
  import { VisMode, visMode } from "../../stores.js";

  let setting: VisMode;

  visMode.subscribe((value) => {
    setting = value;
  });

  function updateMode(mode: VisMode) {
    visMode.update(() => mode);
  }

  export let open = false;
</script>

<div id="bg">
  <p>Layer:</p>
  <div class="button-group">
    {#each Object.values(VisMode).filter((value) => typeof value == "string") as mode}
      <button class:sunset={setting === mode} on:click={() => updateMode(mode)}>
        {mode}
      </button>
    {/each}
  </div>

  <button on:click={() => (open = !open)}> Sidebar Toggle </button>
</div>

<style>
  #bg {
    display: flex;
    justify-content: space-between;
    background-color: rgb(58, 52, 52);
    padding: 10px 20px;
    margin: 0 auto;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }

  .button-group {
    display: flex;
    border-radius: 8px;
    overflow: hidden;
  }

  .button-group button {
    display: flex;
    border-radius: 0;
  }

  .button-group button:last-child {
    border-radius: 0 8px 8px 0;
  }

  .button-group button:first-child {
    border-radius: 8px 0 0 8px;
  }
</style>
