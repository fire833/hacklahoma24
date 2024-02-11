<script>
  import Car from "../../assets/sprites/Car.png";
  import Computer from "../../assets/sprites/Computer.png";
  import Router from "../../assets/sprites/Router.png";
  let current = "";
  let applications = [
    { name: "Ping", logo: Car },
    { name: "YouTube", logo: Computer },
    { name: "Netflix", logo: Router },
  ];
</script>

{#each applications as { name, logo } (logo)}
  <button
    class={current === name ? "app selected" : "app"}
    on:click={() => (current = name)}
  >
    <img src={logo} alt={`${name} Logo`} />
    {name}
  </button>
{/each}

<style>
  .app {
    border-radius: 8px;
    border: 1px solid transparent;
    transition: border-color 0.25s;

    align-items: center;
    display: inline-flex;
    padding: 0.5rem 0.7rem;
    margin: 0.5rem;
    cursor: pointer;
    gap: 0.5rem;
  }

  .app:hover {
    border-color: #646cff;
  }
  .app img {
    width: 30px;
    height: 30px;
  }

  .selected {
    background-color: brown;
  }
</style>
