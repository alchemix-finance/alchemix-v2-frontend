<script>
export let row;
export let onExpand;
export let isExpanded = false;

const handleClick = () => {
  onExpand(row.rowId);
};
</script>

<div class="flex justify-center items-center">
  <button on:click="{() => handleClick()}" class="bg-grey20 w-9 h-9 border border-grey10 rounded-sm">
    <img src="images/{isExpanded ? 'minus' : 'plus'}.png" alt class="p-2" />
  </button>
</div>
