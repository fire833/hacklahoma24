<script lang="ts">
  import type { Network } from "../../net/net.js";
  import { Machine, Router, Switch } from "../../net/subnodes.js";
  import { VisMode, visMode } from "../../stores.js";

  let setting: VisMode;

  visMode.subscribe((value) => {
    setting = value;
  });

  function updateMode(mode: VisMode) {
    visMode.update(() => mode);
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
      <button class:sunset={setting === mode} on:click={() => updateMode(mode)}>
        {mode}
      </button>
    {/each}
  </div>

  <button on:click={() => (open = !open)}> Sidebar Toggle </button>
  <button on:click={exportNetworkToJson}> Export Network </button>
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
