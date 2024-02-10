<script>
  export let open = false;
</script>

<div id="bg" class={open ? "open" : "close"}>Sidebar</div>

<style>
  #bg {
    display: block;
    justify-content: space-between;
    background-color: rgb(58, 52, 52);
    padding: 10px;
    width: 25vw;
    height: 80vh;
    transition: transform 0.3s ease;
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
