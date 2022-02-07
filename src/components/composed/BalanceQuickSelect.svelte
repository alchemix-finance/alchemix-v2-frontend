<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '../elements/Button.svelte';

  const dispatch = createEventDispatcher();

  const setInputValue = (percentage) => {
    dispatch('setInputValue', {
      value: percentage,
    });
  };
</script>

<div class="grid grid-cols-4 gap-2">
  <div class="col-span-1">
    <Button label="25%" on:clicked="{() => setInputValue(25)}" />
  </div>
  <div class="col-span-1">
    <Button label="50%" on:clicked="{() => setInputValue(50)}" />
  </div>
  <div class="col-span-1">
    <Button label="75%" on:clicked="{() => setInputValue(75)}" />
  </div>
  <div class="col-span-1">
    <Button label="100%" on:clicked="{() => setInputValue(100)}" />
  </div>
</div>
