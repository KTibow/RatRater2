<script>
  export let size;
  export let hash;
  export let comment;
  export let files;
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
  <tr>
    <td class="border-r border-outline px-2">Files</td>
    <td class="px-2">
      {files.filter((f) => !f.dir && f.name.endsWith(".class")).length} classes,
      {files.filter((f) => !f.dir).length} total
    </td>
  </tr>
</table>
