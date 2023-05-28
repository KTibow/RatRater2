<script lang="ts">
  import { Button } from "m3-svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  let chooser: HTMLInputElement;
</script>

<input
  type="file"
  bind:this={chooser}
  class="hidden"
  on:change={() => {
    const file = chooser.files && chooser.files[0];
    if (!file) return;
    dispatch("chosen", file);
  }}
/>
<Button type="filled" on:click={() => chooser.click()}>Choose a file</Button>
