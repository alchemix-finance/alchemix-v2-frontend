<script>
  import { slide } from 'svelte/transition';
</script>

<div transition:slide>
  {#if $$slots.head}
    <div class="p-8 border-b border-grey5">
      <div class="container mx-auto">
        <slot name="head" />
      </div>
    </div>
  {/if}
  <div class="px-8 pt-8 pb-36">
    <div class="container mx-auto">
      <slot />
    </div>
  </div>
</div>
