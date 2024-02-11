<script lang="ts">
  import AppButtons from "./AppButtons.svelte";
  import Interface from "./Interface.svelte";

  export let open = false;
  let nodeName = "Test Node";

  let numberOfTimes = 3;
  let interfaces = Array.from(
    { length: numberOfTimes },
    (_, index) => index + 1
  );
</script>

<div id="bg" class={open ? "open" : "close"}>
  <h1>{nodeName}</h1>
  <h2>Interfaces</h2>

  {#each interfaces as i}
    <Interface />
  {/each}

  <h2>Applications</h2>
  <div id="apps-container">
    <AppButtons />
  </div>
</div>

<style>
  .close {
    transform: translate(-100%, 0);
  }

  .open {
    transform: translate(0, 0);
  }

  #bg {
    text-align: left;
    justify-content: space-between;
    align-content: center;
    background-color: rgb(58, 52, 52);
    padding: 2rem;
    width: 25vw;
    height: 80vh;
    margin: auto 0;
    overflow-y: auto;

    transition: transform 0.3s ease;
  }

  h1 {
    margin: 0;
  }

  h2 {
    margin: 0;
    margin-top: 1em;
  }
  #apps-container {
    display: inline-block;
    margin-top: 1rem;
  }
</style>
