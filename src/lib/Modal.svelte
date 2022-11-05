<script>
  import { fly } from "svelte/transition";
  import { tick } from "svelte";
  export let open = false;
  let dialog;
  $: tick().then(() => {
    if (dialog) {
      if (open) dialog.showModal();
      else dialog.close();
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
      <button
        on:click={() => (open = false)}
        class="block w-full rounded-md bg-blue-500/40 p-4 text-center transition-all hover:bg-blue-500/60"
        >Close</button
      >
    </div>
  </dialog>
{/key}
