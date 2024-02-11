<script>
  import Car from "../../assets/sprites/Car.png";
  import Computer from "../../assets/sprites/Computer.png";
  import Router from "../../assets/sprites/Router.png";
  import { onMount } from 'svelte';
  import tutorialData1 from "./Tutorial_1.json";
  import tutorialData2 from "./Tutorial_2.json";
  import { Link } from "svelte-routing";
  let current = "";
  let counter = 1;
  let applications = [
    { name: "Ping", logo: Car },
    { name: "YouTube", logo: Computer },
    { name: "Netflix", logo: Router },
  ];


  const urlParam = new URLSearchParams(window.location.search).get("level");

  let currentTut = tutorialData1;

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

{#each applications as { name, logo } (logo)}
  <button
    class={current === name ? "app sunset" : "app"}
    on:click={() => (current = name)}
  >
    <img src={logo} alt={`${name} Logo`} />
    {name}
  </button>
{/each}


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
<a href="sim?level=tutorial_{counter}"on:click={backwardClick}>Back</a>

{/if}

{#if counter <= 6} 
<a href="sim?level=tutorial_{counter}" on:click={forwardClick}>Next</a>

{/if}


 <!-- button on click do this and then get new url at same time so it updates -->
<Link to="/sim?level=tutorial_2">Start</Link>


<style>
  .app {
    align-items: center;
    display: inline-flex;
    padding: 0.5rem 0.7rem;
    margin: 0.5rem;
    gap: 0.5rem;
  }
  .app img {
    width: 30px;
    height: 30px;
  }
</style>
