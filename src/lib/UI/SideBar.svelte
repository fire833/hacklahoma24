<script lang="ts">
  import { writable } from "svelte/store";
  import AppButtons from "./AppButtons.svelte";
  import type { Network } from "../../net/net";
  import tutorialData1 from "../../../public/tutorials/Tutorial_1.json";
  import tutorialData2 from "../../../public/tutorials/Tutorial_2.json";
  import tutorialData3 from "../../../public/tutorials/Tutorial_3.json";
  import tutorialData4 from "../../../public/tutorials/Tutorial_4.json";

  export let currentTut: any;
  export let renderTutorialJSON: (json: any) => void;

  enum SideBarModes {
    Tutorial,
    Node,
    // PacketFlows,
    // NodeEditing,
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
  function toggle() {
    open = !open;
  }

  export let net: Network;
  console.log(net);
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
    try {
      currentTut = eval(`tutorialData${counter}`);
      console.log("Next");
    } catch (error) {
      console.log(error);
    }
    renderTutorialJSON(currentTut);
  }

  function backwardClick() {
    event?.preventDefault();
    counter = counter - 1;
    try {
      currentTut = eval(`tutorialData${counter}`);
      console.log("Prev");
    } catch (error) {
      console.log(error);
    }
    renderTutorialJSON(currentTut);
  }
</script>

<div id="bg" class={open ? "open" : "close"}>
  <div class="button-group">
    {#each Object.values(SideBarModes).filter((value) => typeof value == "string") as mode}
      <button
        class:sunset={setting === SideBarModes[mode]}
        on:click={() => updateButton(SideBarModes[mode])}
      >
        {mode}
      </button>
    {/each}
  </div>

  {#if setting === SideBarModes.Node}
    <h1>{nodeName}</h1>

    <button
      on:click={() => {
        console.log("ticked the network");
        net.tick();
      }}>Tick the network!</button
    >

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
      <button on:click={backwardClick} class="back">Back</button>
    {/if}

    {#if counter <= 3}
      <button on:click={forwardClick} class="next">Next</button>
    {/if}
    <!-- {:else if setting === SideBarModes.PacketFlows}
    {#if currNode}
      <h2>Node {currNode?.id} Incoming Packets Log</h2>
      {#each currNode.inPacketLog as p}
        <h3>
          MAC: {p.srcmac} SRCIP: {p.srcip} DSTMAC: {p.dstmac} DSTIP: {p.dstip} TYPE:
          {p.app}
        </h3>
      {/each}
      <h2>Node {currNode?.id} Outgoing Packets Log</h2>
      {#each currNode.outPacketLog as p}
        <h3>
          MAC: {p.srcmac} SRCIP: {p.srcip} DSTMAC: {p.dstmac} DSTIP: {p.dstip} TYPE:
          {p.app}
        </h3>
      {/each}
    {/if} -->
  {/if}
</div>

<button class={open ? "toggle open" : "toggle close"} on:click={toggle}
  ><div class="pill"></div></button
>

<style>
  .close {
    transform: translate(-25vw, 0);
  }

  .open {
    transform: translate(0, 0);
  }

  .button-group {
    justify-content: center;
    margin-bottom: 1.5rem;
  }
  .pill {
    background-color: rgba(256, 256, 256, 0.4);
  }

  .toggle {
    z-index: 20;
    border-radius: 0 8px 0 0;
    transition:
      transform 0.3s ease,
      border 0.2s;
    border-bottom: 0;
    border-left: 0;
  }

  #bg {
    z-index: 20;
    text-align: left;
    justify-content: space-between;
    align-content: center;
    background-color: var(--color-bg);
    padding: 2rem;
    width: 25vw;
    height: 70vh;
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
