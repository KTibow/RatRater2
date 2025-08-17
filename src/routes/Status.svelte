<script lang="ts">
  import { Icon } from "m3-svelte";
  import type { IconifyIcon } from "@iconify/types";
  export let icon: IconifyIcon;
</script>

<div class="vertical-container m-auto rounded-lg bg-surface-container-high p-6">
  <Icon {icon} width="2rem" height="2rem" class="text-secondary" />
  <slot />
</div>

<style lang="postcss">
  .vertical-container {
    @apply flex flex-col items-center;
    gap: 1rem;
  }
</style>
