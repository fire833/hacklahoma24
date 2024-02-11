<script lang="ts">
  import SideBar from "./UI/SideBar.svelte";
  import TopBar from "./UI/TopBar.svelte";
  import SpeedBar from "./UI/SpeedBar.svelte";
  import type { Network } from "../net/net";
  import tutorialData1 from "../../public/tutorials/Tutorial_1.json"
  import tutorialData2 from "../../public/tutorials/Tutorial_2.json"
  import tutorialData3 from "../../public/tutorials/Tutorial_3.json"
  import { onMount } from "svelte";

  let open = false;
  export let net: Network;
  export let currentTut = tutorialData1;
  export let renderTutorialJSON: (json: any) => void;
</script>

<div id="ui">
  <div class="topbar">
    <TopBar {net} bind:open></TopBar>
  </div>

  <div class="sidebar">
    <SideBar {open} {net} currentTut={currentTut} renderTutorialJSON={renderTutorialJSON} ></SideBar>
  </div>

  <div class="speedbar">
    <SpeedBar></SpeedBar>
  </div>
</div>

<style>
  .topbar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
  }

  .sidebar {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    display: flex;
  }

  .speedbar {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 20;
  }
</style>
