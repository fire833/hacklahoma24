<script lang="ts">
  import type { Network } from "../../net/net.js";
  import { Machine, Router, Switch } from "../../net/subnodes.js";
  import { VisMode, visMode } from "../../stores.js";
  import { writable } from 'svelte/store'
  import Modal from "./Modal.svelte";

  let setting: VisMode;

  let showModal1 = false;
  let showModal2 = false;
  let showModal3 = false;
  let showModal4 = false;

  visMode.subscribe((value) => {
    setting = value;
  });

  function updateMode(mode: VisMode) {
    visMode.update(() => mode);
    
    }

  function popModal(mode) {
    if(mode === "PHYS") {
      showModal1 = true;
    }
    if(mode === "LINK") {
      showModal2 = true;
    }
    if(mode === "IP") {
      showModal3 = true;
    }
    if(mode === "APP") {
      showModal4 = true;
    }
  }

  // Function to export the network object to JSON
  const exportNetworkToJson = () => {
    let switchArray = [];
    let routerArray = [];
    let machineArray = [];

    for (let object of net.net.values()) {
      if (object instanceof Router) {
        routerArray.push(object.toJSON());
      } else if (object instanceof Machine) {
        machineArray.push(object.toJSON());
      } else if (object instanceof Switch) {
        switchArray.push(object.toJSON());
      }
    }

    let outputJSON = {
      network: {
        switches: switchArray,
        routers: routerArray,
        machines: machineArray,
      },
    };

    const jsonData = JSON.stringify(outputJSON);
    const blob = new Blob([jsonData], { type: "application/json" });

    const a = document.createElement("a");
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = "network_data.json";

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  export let open = false;
  export let net: Network;
</script>

<div id="bg">
  <p>Layer:</p>
  <div class="button-group">
    {#each Object.values(VisMode).filter((value) => typeof value == "string") as mode}
      <button class:sunset={setting === mode} on:click={() => { updateMode(mode); popModal(mode) }}>
        {mode}
      </button>
    {/each}
  </div>

  <button on:click={() => (open = !open)}> Sidebar Toggle </button>
  <button on:click={exportNetworkToJson}> Export Network </button>
</div>

{#if showModal1}
    <Modal showModal={showModal1}>
      <h2>Please upload your network JSON object</h2>
    </Modal>
  {/if}

  {#if showModal2}
  <Modal showModal={showModal2}>
    <h2>Please upload your network JSON object</h2>
  </Modal>
{/if}

{#if showModal3}
    <Modal showModal={showModal3}>
      <h2>Please upload your network JSON object</h2>
    </Modal>
  {/if}

  {#if showModal4}
    <Modal showModal={showModal4}>
      <h2>Please upload your network JSON object</h2>
    </Modal>
  {/if}

<style>
  #bg {
    z-index: 20;
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
