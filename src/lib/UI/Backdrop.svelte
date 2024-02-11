<script lang="ts">
  import { visMode } from "../../stores";

  let mode;
  visMode.subscribe((value) => {
    mode = value;
  });
</script>

<div class={mode}></div>

<style>
  div {
    width: 100%;
    height: 400%;
    background: rgb(116, 0, 184);
    background: linear-gradient(
      0deg,
      rgba(116, 0, 184, 1) 0%,
      rgba(105, 48, 195, 1) 22%,
      rgba(94, 96, 206, 1) 54%,
      rgba(83, 144, 217, 1) 76%,
      rgba(78, 168, 222, 1) 100%
    );
    transition: all 1s;
  }
  .APP {
    transform: translateY(0);
  }
  .IP {
    transform: translateY(-25%);
  }
  .LINK {
    transform: translateY(-50%);
  }
  .PHYS {
    transform: translateY(-75%);
  }
</style>
