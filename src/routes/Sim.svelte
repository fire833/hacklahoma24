<script lang="ts">
  import UI from "../lib/UI.svelte";
  import Canvas from "../lib/Canvas.svelte";
  import { Network } from "../net/net";
  import { Machine, Switch } from "../net/subnodes";
  import { Address4 } from "ip-address";
  import Modal from "../lib/UI/Modal.svelte";

  const urlParam = new URLSearchParams(window.location.search).get("level");
  $: openModal = urlParam === "upload"

  let net = new Network();
  net.add_node(new Switch(16, undefined, 20, 20));
  net.add_node(new Switch(16, undefined, -20, -40));
  net.add_node(new Switch(16, undefined, 20, 60));
  net.add_node(new Switch(16, undefined, -20, -80));
  net.add_node(new Switch(16, undefined, 40, 20));
  net.add_node(
    new Machine(2, new Address4("10.0.3.4/24"), undefined, undefined, 80, 80)
  );

  let uploadedFiles : any;

  let handleFileUpload = (event: { target: { files: any; }; }) => {
    uploadedFiles = event.target.files;
  }

  let handleSubmitFile = () => {
    if(uploadedFiles.length > 0) {
      const file = uploadedFiles[0];
      const reader = new FileReader();

      reader.onload = function(e) {
        const fileContent = e.target?.result as string;
        try {
          let testSwitch = Switch.parseJSON(fileContent);
          console.log(testSwitch);
        } catch (error) {
          console.log(`Error: ${error}`)
        }
      };

      reader.readAsText(file);
    }
  }
</script>

<main>
  {#if openModal}
    <Modal showModal={openModal}>
      <h2>Please upload your network JSON object</h2>
      <input type="file" name="filename" on:change={handleFileUpload}>
      <input type="submit" on:click={() => {
        openModal = !openModal;
        handleSubmitFile();
      }}>
    </Modal>
  {/if}
  <div class="ui">
    <UI openModal={openModal}/>
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
