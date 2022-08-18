<script>
  import settings from '@stores/settings';
  import { slide } from 'svelte/transition';
</script>

<div transition:slide>
  {#if $$slots.head}
    <div class="p-5 sm:p-8 border-b {$settings.invertColors ? 'border-grey5inverse' : 'border-grey5'}">
      <div class="container mx-auto">
        <slot name="head" />
      </div>
    </div>
  {/if}
  {#if $$slots.message}
    <div class="container mx-auto px-2 lg:px-8 pt-8">
      <div
        class="border-y-1 py-2 rounded text-sm border border-green4 {$settings.invertColors
          ? 'bg-green7 text-white2inverse'
          : 'bg-black2 text-white2'} flex flex-row justify-center space-x-4"
      >
        <slot name="message" />
      </div>
    </div>
  {/if}
  <div class="px-3 lg:px-8 pt-8 pb-12 sm:pb-36">
    <div class="container mx-auto">
      <slot />
    </div>
  </div>
</div>
