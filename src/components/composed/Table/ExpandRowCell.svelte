<script>
export let row;
export let onExpand;
export let isExpanded = false;

const handleClick = () => {
  onExpand(row.rowId);
};
</script>

<div class="flex justify-center items-center">
  <button on:click="{() => handleClick()}" class="bg-grey20 w-6 h-6 border border-grey5 rounded-sm">
    <img src="images/{isExpanded ? 'minus' : 'plus'}.png" alt class="p-1" />
  </button>
</div>
