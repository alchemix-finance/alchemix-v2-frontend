<script>
  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';
  import Button from '../../../elements/Button.svelte';

  export let row;
  export let onExpand;
  export let isExpanded = false;

  let selectedAction = 0;

  const dispatch = createEventDispatcher();

  const handleClick = (action) => {
    selectedAction = action;
    onExpand(row.rowId);
    dispatch('switchAction', action)
  };
</script>

<div class='grid grid-cols-3 gap-6 mx-4'>
  <div class='col-span-1'>
    <Button
      label='Stake'
      on:clicked='{() => handleClick(0)}'
    />
  </div>
  <div class='col-span-1'>
    <Button
      label='Unstake'
      on:clicked='{() => handleClick(1)}'
    />
  </div>
  <div class='col-span-1'>
    <Button
      label='Claim'
      on:clicked='{() => handleClick(2)}'
    />
  </div>
</div>
