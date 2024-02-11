<script lang="ts">
  import { writable } from "svelte/store";
  import AppButtons from "./AppButtons.svelte";
  import Interface from "./Interface.svelte";
  import tutorialData1 from "./Tutorial_1.json";
  import tutorialData2 from "./Tutorial_2.json";

  let currentTut = tutorialData1;

  enum SideBarModes {
    Tutorial,
    Node,
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
  }

  function backwardClick() {
    event?.preventDefault();
    counter = counter - 1;
    currentTut = eval(`tutorialData${counter}`);
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

    {#each interfaces as i}
      <Interface />
    {/each}

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
  {/if}
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
