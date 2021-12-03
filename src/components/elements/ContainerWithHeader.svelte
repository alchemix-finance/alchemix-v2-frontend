<div class='w-full rounded border border-grey10 bg-grey15 relative'>
  {#if $$slots.header}
    <div class='bg-grey10 w-full'>
      <slot name='header' />
    </div>
  {/if}
  {#if $$slots.body}
    <div class='w-full'>
      <slot name='body' />
    </div>
  {/if}
</div>
