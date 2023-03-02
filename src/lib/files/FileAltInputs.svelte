<script>
  import { createEventDispatcher } from "svelte";
  import Icon from "@iconify/svelte";
  import iconFile from "@iconify-icons/ic/outline-file-present";

  const dispatch = createEventDispatcher();
  let currentX = 0,
    currentY = 0,
    hide = true;
</script>

<svelte:window
  on:dragover={(e) => {
    hide = !e.dataTransfer.types.includes("Files");
    if (hide) return;
    e.preventDefault();
    (currentX = e.clientX), (currentY = e.clientY);
  }}
  on:drop={(e) => {
    hide = true;
    const file = e.dataTransfer.files[0];
    if (!file) return;
    e.preventDefault();
    dispatch("chosen", file);
  }}
  on:dragleave={() => (hide = true)}
  on:dragexit={() => (hide = true)}
  on:paste={(e) => {
    const file = e.clipboardData.files[0];
    if (!file) return;
    e.preventDefault();
    dispatch("chosen", file);
  }}
/>
<div
  class="dragover-positioning fixed rounded-2xl bg-primary-container text-on-primary-container transition-[clip-path]"
  class:custom-hide={hide}
  style="left: {currentX}px; top: {currentY}px;"
>
  <Icon icon={iconFile} height={32} />
</div>

<style lang="postcss">
  .dragover-positioning {
    @apply flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden;
    clip-path: circle(2.829rem);
  }
  .custom-hide {
    clip-path: circle(0);
  }
</style>
