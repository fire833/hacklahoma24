<script lang="ts">
  import { writable } from "svelte/store";
  import AppButtons from "./AppButtons.svelte";
  import type { Network } from "../../net/net";
  import tutorialData1 from "../../../public/tutorials/Tutorial_1.json";
  import tutorialData2 from "../../../public/tutorials/Tutorial_2.json";
  import tutorialData3 from "../../../public/tutorials/Tutorial_3.json";

  export let currentTut : any;
  export let renderTutorialJSON: (json: any) => void;

  enum SideBarModes {
    Tutorial,
    Node,
    PacketFlows,
    NodeEditing,
  }

  let setting: SideBarModes = SideBarModes.Tutorial;

  let sideBarMode = writable<SideBarModes>(SideBarModes.Tutorial);
  sideBarMode.subscribe((value) => {
    setting = value;
  });

  function updateButton(mode: SideBarModes) {
    sideBarMode.update(() => mode);
  }

  export let open = false;
  export let net: Network;
  console.log(net)
  $: currNode = net.net.get(net.active_node);

  let nodeName = "Test Node";

  let counter = 1;
  let numberOfTimes = 3;
  let interfaces = Array.from(
    { length: numberOfTimes },
    (_, index) => index + 1
  );

  function forwardClick() {
    event?.preventDefault();
    counter = counter + 1;
    currentTut = eval(`tutorialData${counter}`);
    renderTutorialJSON(currentTut)
  }

  function backwardClick() {
    event?.preventDefault();
    counter = counter - 1;
    currentTut = eval(`tutorialData${counter}`);
    renderTutorialJSON(currentTut)
  }
</script>

<div id="bg" class={open ? "open" : "close"}>
  {#each Object.values(SideBarModes).filter((value) => typeof value == "string") as mode}
    <button
      class:sunset={setting === SideBarModes[mode]}
      on:click={() => updateButton(SideBarModes[mode])}
    >
      {mode}
    </button>
  {/each}

  {#if setting === SideBarModes.Node}
    <h1>{nodeName}</h1>
    <h2>Interfaces</h2>

    {#if currNode}
      {#each currNode.interfaces as [index, iface]}
        <div>
          <h2>Interface {index}</h2>
          <h3>IP: {iface.ip}</h3>
          <h3>MAC: {iface.mac}</h3>
        </div>
      {/each}
    {/if}

    <h2>Applications</h2>
    <div id="apps-container">
      <AppButtons />
    </div>
  {:else if setting === SideBarModes.Tutorial}
    {#if currentTut}
      <h1>{currentTut.title}</h1>

      {#each currentTut.sections as section (section.title)}
        <div>
          <h2>{section.title}</h2>
          {#each section.steps as step (step.text)}
            <p>{step.text}</p>
          {/each}
        </div>
      {/each}
    {/if}

    {#if counter >= 2}
      <a href="sim?level=tutorial_{counter}" on:click={backwardClick}>Back</a>
    {/if}

    {#if counter <= 6}
      <a href="sim?level=tutorial_{counter}" on:click={forwardClick}>Next</a>
    {/if}
  {:else if setting === SideBarModes.PacketFlows}{:else if setting === SideBarModes.NodeEditing}{/if}
</div>

<style>
  .close {
    transform: translate(-100%, 0);
  }

  .open {
    transform: translate(0, 0);
  }

  #bg {
    z-index: 20;
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
