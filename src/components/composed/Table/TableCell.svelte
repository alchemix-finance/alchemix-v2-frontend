<script>
  // Generic table cell component which renders the given cell component and passes it all props
  // or simply returns value assuming it's renderable

  export let CellComponent;
  export let value;
  export let fullWidth;
</script>

<div class:w-full="{fullWidth}">
  {#if CellComponent}
    <svelte:component this="{CellComponent}" {...$$props} />
  {:else}
    <div>
      {value}
    </div>
  {/if}
</div>
