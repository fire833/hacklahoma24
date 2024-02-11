<script>
  import Wifi from "../../assets/sprites/Wifi.png";
  export let name = "Name/ID";
  export let IP = "IP Address";
  export let mac = "MAC Address";
</script>

<div class="interface">
  <div id="name-div">
    <div>{name}</div>
    <div>{IP}</div>
    <div>{mac}</div>
  </div>
  <img src={Wifi} alt="Wifi icon" />
</div>

<style>
  .interface {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    border-left: 2px solid rgb(190, 29, 29);
    padding-left: 1rem;
    margin-top: 10px;
  }

  img {
    width: 50px;
    height: 60px;
  }
</style>
