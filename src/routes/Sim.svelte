<script lang="ts">
  import UI from "../lib/UI.svelte";
  import Canvas from "../lib/Canvas.svelte";
  import { Network } from "../net/net";
  import { Machine, Router, Switch } from "../net/subnodes";
  import Modal from "../lib/UI/Modal.svelte";
  import { Address4 } from "ip-address/dist/ipv4";

  const urlParam = new URLSearchParams(window.location.search).get("level");
  $: openModal = urlParam === "upload";
  $: openTutModal = urlParam === "tutorial_1";

  let net = new Network();
  let a = new Switch(16, undefined, 100, -100);
  let b = new Switch(16, undefined, -200, -40);
  let c = new Switch(16, undefined, 200, 60);
  let d = new Switch(16, undefined, -100, -80);
  let e = new Switch(16, undefined, -40, 40);
  let m = new Machine(
    2,
    new Address4("10.0.3.4/24"),
    undefined,
    undefined,
    80,
    80
  );
  net.add_node(a);
  net.add_node(b);
  net.add_node(c);
  net.add_node(d);
  net.add_node(e);
  net.add_node(m);

  net.add_edge(a.id, b.id);
  net.add_edge(a.id, c.id);
  net.add_edge(m.id, b.id);
  net.add_edge(a.id, d.id);
  net.add_edge(a.id, e.id);

  let uploadedFiles: any;

  let handleFileUpload = (event: { target: { files: any } }) => {
    uploadedFiles = event.target.files;
  };

  let handleSubmitFile = async () => {
    if (uploadedFiles.length > 0) {
      const file = uploadedFiles[0];
      const reader = new FileReader();

      reader.onload = function (e) {
        const fileContent = e.target?.result as string;
        let parsedJSON = JSON.parse(fileContent).network;
        try {
          net = new Network();
          for (let currSwitch of parsedJSON.switches) {
            net.add_node(Switch.parseJSON(JSON.stringify(currSwitch)));
            console.log(Switch.parseJSON(JSON.stringify(currSwitch)));
          }
          console.log("Finish switches");
          for (let currRouter of parsedJSON.routers) {
            net.add_node(Router.parseJSON(JSON.stringify(currRouter)));
            console.log(Router.parseJSON(JSON.stringify(currRouter)));
          }

          for (let currMachine of parsedJSON.machines) {
            net.add_node(Machine.parseJSON(JSON.stringify(currMachine)));
            console.log(Machine.parseJSON(JSON.stringify(currMachine)));
          }

          net = net;
        } catch (error) {
          console.log(`Error: ${error}`);
        }
      };
      reader.readAsText(file);
    }
  };
</script>

<main>
  {#if openModal}
    <Modal showModal={openModal}>
      <h2>Please upload your network JSON object</h2>
      <input type="file" name="filename" on:change={handleFileUpload} />
      <input
        type="submit"
        on:click={async () => {
          openModal = !openModal;
          await handleSubmitFile();
          console.log(net);
        }}
      />
    </Modal>
  {/if}
  <div class="ui">
    <UI />
  </div>
  <div class="canvas">
    <Canvas {net} />
  </div>

  {#if openTutModal}
    <Modal showTutModal={openTutModal}>
      <h2>Welcome to the tutorial!</h2>
      <h3>Please open the sidebar to follow the tutorial</h3>
    </Modal>
  {/if}
  <div class="ui">
    <UI {openTutModal} />
  </div>
  <div class="canvas">
    <Canvas {net} />
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
