<script>
  import { fly } from "svelte/transition";
  import { tick } from "svelte";
  import Button from "./Button.svelte";
  export let open = false;
  let dialog;
  $: tick().then(() => {
    if (dialog) {
      if (open && !dialog.open) dialog.showModal();
      else if (!open && dialog.open) dialog.close();
    }
  });
</script>

{#key open}
  <dialog
    bind:this={dialog}
    on:cancel={(e) => {
      e.preventDefault();
      open = false;
    }}
    on:click={() => (open = false)}
    transition:fly={{ x: -100 }}
    class="rounded-lg border-none bg-black/40 p-0"
  >
    <div on:click={(e) => e.stopPropagation()} class="p-8">
      <slot />
      <Button on:click={() => (open = false)} styling="block w-full p-4">Close</Button>
    </div>
  </dialog>
{/key}
