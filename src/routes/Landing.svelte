<script lang="ts">
  import { Link } from "svelte-routing";
  import "../assets/fonts/streamster/fonts.css";
</script>

<main>
  <h1>Internet of Pings</h1>
  <div id="options">
    <div>
      <Link to="/sim?level=tutorial_1">Start</Link>
    </div>
    <div>
      <Link to="/sim?level=upload">Upload File</Link>
    </div>
  </div>
</main>

<style>
  h1 {
    font-family: "Streamster";
    font-size: 10rem;
    color: #f890e7;
    margin-top: 0;
    margin-bottom: 5rem;
  }

  #options {
    display: inline-flex;
    gap: 5ch;
  }
</style>
