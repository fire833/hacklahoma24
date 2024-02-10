<script lang="ts">
  import { Router, Link, Route } from "svelte-routing";
  import Landing from "./routes/Landing.svelte";
  import Sim from "./routes/Sim.svelte";

  export let url = "";
</script>

<Router {url}>
  <div>
    <Route path="/"><Landing /></Route>
    <Route path="/sim"><Sim /></Route>
  </div>
</Router>
