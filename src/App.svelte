<script>
  import Tailwindcss from "./Tailwindcss.svelte";
  import {
    Button,
    Spinner,
    // Input,
    Progress,
    Slider,
    // Autocomplete,
    NavigationDrawer,
    Dialog
  } from "svetamat";

  export let name;
  let visible = false;
  let dialogVisible = false;
  let items = ["SGP", "MYS", "THA", "HKG", "CHN"];
  let value = "SGP";
</script>

<style>
  h1 {
    color: purple;
  }
</style>

<Tailwindcss />
<div class="m-16">
  <h1>Hello {name}!</h1>
  <Spinner />
  <div class="flex flex-row-reverse">
    <Button textColor="text-orange-500" on:click={() => (visible = !visible)}>
      show drawer
    </Button>
    <Button
      textColor="text-green-500"
      on:click={() => (dialogVisible = !dialogVisible)}>
      show dialog
    </Button>
  </div>
<!-- 
  <Input
    outlined
    label="huat mflkermflk ewlkweodsf4 t45 5756 k98o 65ir43o9ri9034ri03
    ri049erjmflsdkfdawdl[phnoptrhk[" /> -->
  <Progress />
  <Slider value={0.28} />
  <!-- <Autocomplete {items} bind:value={value} />{value} -->
  <NavigationDrawer bind:visible modal>
    <div class="bg-white p-2 h-full">halo how are you</div>
  </NavigationDrawer>
  <Dialog bind:visible={dialogVisible} permanent>
    <div class="bg-white w-64 h-48 flex flex-row justify-center items-center">
      <Button on:click={() => (dialogVisible = false)}>Close</Button>
    </div>
  </Dialog>

</div>
