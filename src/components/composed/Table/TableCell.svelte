<script>
// Generic table cell component which renders the given cell component and passes it all props
// or simply returns data.value assuming it's renderable
export let data;
const CellComponent = data.CellComponent;
</script>

<div>
  {#if CellComponent}
    <CellComponent {...$$props} />
  {:else}
    {data.value}
  {/if}
</div>
