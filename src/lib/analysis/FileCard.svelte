<script lang="ts">
  import Icon from "@iconify/svelte";
  import iconFile from "@iconify-icons/ic/outline-insert-drive-file";
  import { file, type Loaded } from "$lib/state";

  const getSize = (bytes: number) =>
    bytes < 1000
      ? bytes + " B"
      : bytes < 1000000
      ? Math.floor(bytes / 1000) + " kB"
      : Math.floor(bytes / 1000000) + " MB";
  $: fileL = $file as Loaded;
</script>

<div class="file-card flex items-center">
  <Icon icon={iconFile} height={24} />
  <p class="grow whitespace-nowrap pl-4 font-mono">{fileL.file.name}</p>
  <p class="whitespace-nowrap pl-4">{getSize(fileL.file.size)}</p>
  <p class="pl-4">{fileL.hash}</p>
</div>
