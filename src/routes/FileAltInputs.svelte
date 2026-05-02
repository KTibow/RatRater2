<script lang="ts">
  import { Icon } from "m3-svelte";
  import iconFile from "@ktibow/iconset-ic/outline-file-present";
  import { loadFile } from "$lib/state";

  let currentX = 0,
    currentY = 0,
    hide = true;
</script>

<svelte:window
  on:dragover={(e) => {
    hide = !e.dataTransfer || !e.dataTransfer.types.includes("Files");
    if (hide) return;
    e.preventDefault();
    currentX = e.clientX;
    currentY = e.clientY;
  }}
  on:drop={(e) => {
    hide = true;
    const file = e.dataTransfer && e.dataTransfer.files[0];
    if (!file) return;
    e.preventDefault();
    loadFile(file);
  }}
  on:dragleave={() => (hide = true)}
  on:dragexit={() => (hide = true)}
  on:paste={(e) => {
    const file = e.clipboardData && e.clipboardData.files[0];
    if (!file) return;
    e.preventDefault();
    loadFile(file);
  }}
/>
<div
  class="dragover-positioning fixed rounded-lg bg-primary-container text-on-primary-container"
  class:custom-hide={hide}
  style="left: {currentX}px; top: {currentY}px;"
>
  <Icon icon={iconFile} width="2rem" height="2rem" />
</div>

<style lang="postcss">
  .dragover-positioning {
    @apply flex items-center justify-center overflow-hidden;
    width: 4rem;
    height: 4rem;
    transition:
      clip-path 0.5s,
      opacity 0.5s;
    transform: translate(-50%, -50%);
    clip-path: circle(2.829rem);
  }
  .custom-hide {
    clip-path: circle(0);
    opacity: 0;
  }
</style>
