<script lang="ts">
  import { Link } from "svelte-routing";
  import "../assets/fonts/streamster/fonts.css";
</script>

<main>Welcome to Internet of Pings</main>

<Link to="/sim?level=tutorial_1">Start</Link>
<Link to="/sim?level=local">Use Local Storage</Link>
<Link to="/sim?level=upload">Upload File</Link>


<style>
  main {
    font-family: 'Streamster';
    font-size: 80px;
    color: #f890e7;
  }
</style>