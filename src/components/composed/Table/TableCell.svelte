<script>
// Generic table cell component which renders the given cell component and passes it all props
// or simply returns value assuming it's renderable

export let CellComponent;
export let value;
export let key;

$: key, ('table cell data', value);
</script>

<div>
  {#if CellComponent}
    <CellComponent {...$$props} />
  {:else}
    <div>
      {value}
    </div>
  {/if}
</div>
