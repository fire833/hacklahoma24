<script lang="ts">
  
  import { Sprite } from "pixi.js";
import { spring } from "svelte/motion";
import Car from "../../assets/sprites/Car.png";
  import Computer from "../../assets/sprites/Computer.png"
  import Router from "../../assets/sprites/Router.png"
  import Toaster from "../../assets/sprites/Toaster.png"

  export let open = false;

  let names1 = "Name/ID"
  let names2 = "IP"
  let names3 = "MAC"
  let applications = [ { name: "Ping", logo: Car}, { name: "YouTube", logo: Computer}, 
  { name: "Netflix", logo: Router}]
  let numberOfTimes = 3
  let nameAmount = Array.from({ length: numberOfTimes }, (_, index) => index + 1);

  function handleButtonClick(name: string) {
    console.log(`Button clicked for ${name}`);
  }

</script>

<div id="bg" class={open ? "open" : "close"}>Name

<div id="interf">Interfaces

</div>
  
  {#each nameAmount as number (number)}
  <div id="name-div">
    <p>{ names1 }</p>  
    <p>{ names2 }</p>
    <p>{ names3 }</p>
  </div>
  <img class ="img2" src={ Toaster } alt = "Image">
    {/each}
  <div id="blocks-container">
  {#each applications as { name, logo } (logo)}  
    <button on:click={() => handleButtonClick(name)} id="app-blocks">
      <img src={logo} alt={`${name} Logo`} />
      <p>{name}</p>
    </button>
    {/each}
</div>
</div> 

<style>
  #bg {
    display: block;
    justify-content: space-between;
    background-color: rgb(58, 52, 52);
    padding: 10px;
    width: 25vw;
    height: 80vh;
    transition: transform 0.3s ease;
    overflow-y: auto;
    max-height: 500px;
  }

  #name-div {
    border-left: 1px solid rgb(190, 29, 29);
    padding: 10px;
    margin-top: 10px;
    max-width: 300px; 
    font-size: 13.5px;
    line-height: 1;
    margin-left: 0;
    margin-right: 500px;

  }

  .img2 {
    position: relative;
    top: -105px;
    left: 150px;
  }

  #blocks-container {
    display: flex;
    flex-wrap: wrap; 
    margin-top: 10px;
  }

  #app-blocks {
    border: solid 1px rgb(190, 29, 29);
    padding: 5px;
    max-width: 250px;
    margin-bottom: 10px; 
    margin-left: 10px;
    display: flex;
    flex-direction: row;
    cursor: pointer;
    text-indent: 5px;
  }

  #interf {
    margin-right: 385px;
  }

  .close {
    /* Can do 400% to have it on right side of screen */
    transform: translate(-100%, 0);
  }

  .open {
    /* Can do 290% to have it on right side of screen */
    transform: translate(0, 0);
  }
</style>
