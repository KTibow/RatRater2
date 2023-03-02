<script>
  import { Button } from "m3-svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  /** @type HTMLInputElement */
  let chooser;
</script>

<input
  type="file"
  id="chooser"
  bind:this={chooser}
  class="hidden"
  on:change={() => {
    const file = chooser.files[0];
    if (!file) return;
    dispatch("chosen", file);
  }}
/>
<Button type="filled" on:click={() => chooser.click()}>Choose a file</Button>
