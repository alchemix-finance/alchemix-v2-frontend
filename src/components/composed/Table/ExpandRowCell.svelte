<script>
  import Button from '../../elements/Button.svelte';

  export let row;
  export let onExpand;
  export let isExpanded = false;

  const handleClick = () => {
    onExpand(row.rowId);
    isExpanded = !isExpanded;
  };

  // $: isExpanded, console.log('isExpanded', isExpanded);
</script>

<div class="flex justify-center items-center w-6">
  <Button
    borderSize="1"
    fontSize="text-md"
    py="py-0"
    label="{isExpanded ? '-' : '+'}"
    on:clicked="{() => handleClick()}"
  />
</div>
