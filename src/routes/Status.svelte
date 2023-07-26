<script lang="ts">
  import Icon, { type IconifyIcon } from "@iconify/svelte";
  export let icon: IconifyIcon;
</script>

<div class="vertical-container m-auto rounded-2xl bg-surface-container-high p-6">
  <Icon {icon} height={24} class="text-secondary" />
  <slot />
</div>

<style lang="postcss">
  .vertical-container {
    @apply flex flex-col items-center gap-4;
  }
</style>
