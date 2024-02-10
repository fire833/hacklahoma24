<script lang="ts">
  let modes = ["PHYS", "LINK", "IP", "APP"];
  export let visMode = "PHYS";

  export let open = false;
</script>

<div id="bg">
  Layer:
  {#each modes as mode}
    <button
      class:active={visMode === mode}
      on:click={() => {
        visMode = mode;
      }}>{mode}</button
    >
  {/each}

  <button on:click={() => open=!open}>
    Sidebar Toggle
  </button>
</div>

<style>
  #bg {
    justify-content: space-between;
    background-color: rgb(58, 52, 52);
    padding: 10px;
    width: 40vw;
    margin: 0 auto;
  }

  button {
    margin: 0 4px;
  }

  .active {
    background-color: brown;
  }
</style>
