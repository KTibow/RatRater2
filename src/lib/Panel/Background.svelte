<script>
  export let activeFile;
</script>

<div
  class="flex flex-grow flex-col items-start bg-[url(/waves.svg)] bg-[length:auto_100vmax] p-4 2xl:bg-[length:auto_150vh]"
  class:animate-wave={!activeFile}
>
  <slot />
  <p class="mt-auto">
    Made by KTibow - Support in <a
      href="https://discord.gg/v4VCe6EsBA"
      class="text-blue-200 underline"
    >
      The Fight Against Malware
    </a>
  </p>
</div>
