<script>
  import TfamLink from "$lib/TFAMLink.svelte";

  export let activeFile;
</script>

<div
  class="flex flex-grow flex-col items-start bg-[url(/waves.svg)] bg-[length:auto_100vmax] p-4 2xl:bg-[length:auto_150vh]"
  class:animate-wave={!activeFile}
>
  <slot />
  <p class="mt-auto">
    Made by KTibow - Support in <TfamLink />
  </p>
</div>
