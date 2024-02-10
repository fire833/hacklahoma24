<div class="navbar">
  <a href="/">Home</a>
  <a href="/">PHYS</a>
</div>

<div class="container">
  <slot />
</div>

<style>
  .navbar {
    display: flex;
    justify-content: space-between;
    background-color: white;
    padding: 10px;
  }

  .navbar a {
    color: gray;
    text-decoration: none;
    padding: 4px;
  }

  .navbar a:hover {
    color: black;
  }

  .navbar a:active {
    border: 1px solid white;
    border-radius: 4px;
  }

  :global(body) {
    margin: 0;
  }

  .container {
    max-width: 90%;
    margin: 0 auto;
    width: 1288px;
  }
</style>
