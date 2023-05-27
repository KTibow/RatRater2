<script>
  import Icon from "@iconify/svelte";
  import iconFile from "@iconify-icons/ic/outline-insert-drive-file";

  export let currentFile;
  export let hash;

  const getSize = (bytes) =>
    bytes < 1000
      ? bytes + " B"
      : bytes < 1000000
      ? Math.floor(bytes / 1000) + " kB"
      : Math.floor(bytes / 1000000) + " MB";
</script>

<div class="file-card flex items-center">
  <Icon icon={iconFile} height={24} />
  <p class="grow pl-4 font-mono">{currentFile.name}</p>
  <p class="pl-4">{getSize(currentFile.size)}</p>
  <p class="pl-4">{hash}</p>
</div>
