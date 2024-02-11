<script lang="ts">
  import SideBar from "./UI/SideBar.svelte";
  import TopBar from "./UI/TopBar.svelte";
  import SpeedBar from "./UI/SpeedBar.svelte";
  import type { Network } from "../net/net";

  let open = false;
  export let net: Network;
</script>

<div id="ui">
  <div class="topbar">
    <TopBar {net} bind:open></TopBar>
  </div>

  <div class="sidebar">
    <SideBar {open}></SideBar>
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
    z-index: 20;
  }

  .sidebar {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    display: flex;
    z-index: 20;
  }

  .speedbar {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 20;
  }
</style>
