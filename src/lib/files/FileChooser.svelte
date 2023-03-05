<script>
  import { Button, Snackbar, SnackbarPlacer } from "m3-svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  /** @type HTMLInputElement */
  let chooser;
  let jar
</script>

<input
  type="file"
  id="chooser"
  bind:this={chooser}
  class="hidden"
  on:change={() => {
    const file = chooser.files[0];
    if (!file) return;
    if (!file.name.endsWith(".jar")) {
      jar = true
      return
    }
    dispatch("chosen", file);
  }}
/>
<Button type="filled" on:click={() => chooser.click()}>Choose a file</Button>
<SnackbarPlacer>
  <Snackbar bind:open={jar}>We do not support files other than .jar</Snackbar>
</SnackbarPlacer>