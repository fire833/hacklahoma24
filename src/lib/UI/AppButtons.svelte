<script>
  import Car from "../../assets/sprites/Car.png";
  import Computer from "../../assets/sprites/Computer.png";
  import Router from "../../assets/sprites/Router.png";
  import { onMount } from 'svelte';

  import { Link } from "svelte-routing";
  let applications = [
    { name: "Ping", logo: Car },
    { name: "YouTube", logo: Computer },
    { name: "Netflix", logo: Router },
  ];

  let current = "";
  const urlParam = new URLSearchParams(window.location.search).get("level");
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
