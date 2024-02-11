<script lang="ts">
  import UI from "../lib/UI.svelte";
  import Canvas from "../lib/Canvas.svelte";
  import { Network } from "../net/net";
  import { Machine, Switch } from "../net/subnodes";
  import { Address4 } from "ip-address";

  let net = new Network();
  net.add_node(new Switch(16, undefined, 10, 10));
  net.add_node(new Switch(16, undefined, -10, -20));
  net.add_node(new Switch(16, undefined, 10, 30));
  net.add_node(new Switch(16, undefined, -10, -40));
  net.add_node(new Switch(16, undefined, 20, 10));
  net.add_node(
    new Machine(2, new Address4("10.0.3.4/24"), undefined, undefined, 40, 40)
  );
</script>

<main>
  <div class="ui">
    <UI />
  </div>
  <div class="canvas">
    <Canvas />
  </div>
</main>

<style>
  main {
    display: flex;
  }
  .ui {
    z-index: 100;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
  .canvas {
    z-index: 0;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
</style>
