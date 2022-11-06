<script>
  export let activeFile;
</script>

<div
  class="flex-grow bg-[url(/waves.svg)] bg-[length:auto_100vmax] p-4 2xl:bg-[length:auto_150vh]"
  class:animate-wave={!activeFile}
>
  <slot />
</div>
