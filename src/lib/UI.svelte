<script>
  import SideBar from "./UI/SideBar.svelte";
  import TopBar from "./UI/TopBar.svelte";
  import SpeedBar from "./UI/SpeedBar.svelte";
</script>

<div id="ui">
  <div class="topbar">
    <TopBar></TopBar>
  </div>

  <div class="sidebar">
    <SideBar></SideBar>
  </div>

  <div class="speedbar">
    <SpeedBar></SpeedBar>
  </div>
</div>

<style>
  #ui {
    display: block;
  }
  .topbar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }

  .sidebar {
    position: absolute;
    top: 4em;
    left: 0;
  }

  .speedbar {
    position: absolute;
    top: 0;
    right: 0;
  }
</style>
