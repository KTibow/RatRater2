<script>
  export let size;
  export let hash;
  export let comment;
  const getSize = (bytes) =>
    bytes < 1000
      ? bytes + " B"
      : bytes < 1000000
      ? Math.floor(bytes / 1000) + " kB"
      : Math.floor(bytes / 1000000) + " MB";
</script>

<table class="lg:ml-auto">
  <tr>
    <td class="border-r border-outline px-2">Size</td>
    <td class="px-2">{getSize(size)}</td>
  </tr>
  <tr>
    <td class="border-r border-outline px-2">SHA256 hash</td>
    <td class="px-2 font-mono">{hash}</td>
  </tr>
  {#if comment}
    <tr>
      <td class="border-r border-outline px-2">Zip comment</td>
      <td class="px-2 font-mono">
        <span class="inline-block max-w-2xl overflow-auto whitespace-nowrap align-middle">
          {comment}
        </span>
      </td>
    </tr>
  {/if}
</table>
