<script>
  import Button from '../../../elements/Button.svelte';
  import ExitCell from './ExitCell.svelte';

  export let poolId;
  export let row;
  export let onExpand;
  export let label;
  export let isExpanded = false;

  export let farm;
  export let farmType;

  const handleClick = () => {
    isExpanded = !isExpanded;
    onExpand(row.rowId);
  };
</script>

<div class="flex justify-between space-x-2">
  <Button label="{label}" selected="{isExpanded}" on:clicked="{() => handleClick(0)}" />

  <ExitCell farm="{farm}" farmType="{farmType}" />
</div>
