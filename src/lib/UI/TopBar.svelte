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
      showModal2 = false;
      showModal3 = false;
      showModal4 = false;
    }
    if(mode === "LINK") {
      showModal2 = true;
      showModal1 = false;
      showModal3 = false;
      showModal4 = false;
    }
    if(mode === "IP") {
      showModal3 = true;
      showModal1 = false;
      showModal2 = false;
      showModal4 = false;
    }
    if(mode === "APP") {
      showModal4 = true;
      showModal1 = false;
      showModal3 = false;
      showModal2 = false;
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
      <h2>The Physical Layer</h2>
      <p>The physical layer is the lowest layer within the OSI (Open Systems Interconnection) model.
        The main goal of this layer is to set and define the hardware characteristics of the network. 
        This includes types of internet communication tools such as fiber optics, the representation of data, 
        and the bandwidth. This allows for the rest of the network to work in harmony!
      </p>
    </Modal>
  {/if}

  {#if showModal2}
  <Modal showModal={showModal2}>
    <h2>The Link Layer</h2>
    <p>The link layer is the second layer within the OSI model. This layer is responsible for making sure
      there is a successful transmission of frames between devices within the same network. In order for the 
      layer to work, the layer relies on a Media Access Control (MAC) address to identify other devices within the network.
      The layer also looks at error detection and flow control.
    </p>
  </Modal>
{/if}

{#if showModal3}
    <Modal showModal={showModal3}>
      <h2>The IP Layer</h2>
      <p>The Internet Protocol (IP) layer is the third layer within the OSI model. This layer is responsible 
        for the addressing, routing, and sending of packets of data between networks. This allows for communication between
        networks which at the root is basically the internet as we know it. This layer is probably the most well known layer when thinking
        about the internet and one that is a very important piece within the OSI model.  
      </p>
    </Modal>
  {/if}

  {#if showModal4}
    <Modal showModal={showModal4}>
      <h2>The Application Layer</h2>
      <p>The application layer is the last layer within the OSI model. This layer is what connects and allows the user to
        view and configure networks. This includes data representation to the user and application, it provides SSH opportunities,
      and simply allows for web services such as HTTP to exist and function. This layer provides the easiest view into how networks
    operate.  </p>
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
