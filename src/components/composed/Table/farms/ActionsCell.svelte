<script>
  import Button from '../../../elements/Button.svelte';

  export let row;
  export let onExpand;
  export let label;
  export let isExpanded = false;

  const handleClick = () => {
    isExpanded = !isExpanded;
    onExpand(row.rowId);
  };
</script>

<Button
  label={label}
  selected={isExpanded}
  on:clicked='{() => handleClick(0)}'
/>
