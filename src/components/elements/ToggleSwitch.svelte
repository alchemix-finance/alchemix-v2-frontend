<script>
  import { createEventDispatcher } from 'svelte';

  export let label;
  export let forceState;

  let checkboxState = false;

  const dispatch = createEventDispatcher();

  const broadcastValue = () => {
    dispatch('toggleChange', {
      value: checkboxState,
    });
  };

  const updateState = () => {
    checkboxState = false;
  };

  $: checkboxState, broadcastValue();
  $: forceState, updateState();
</script>

<style>
  input:checked ~ .dot {
    transform: translateX(100%);
    background-color: #3eb88e;
  }

  input:checked ~ .line {
    background-color: #0e251d;
  }
</style>

<label class="flex items-center justify-between cursor-pointer">
  {#if label}
    <p class="inline-block text-lightgrey10 text-sm mr-2">
      {label}
    </p>
  {/if}
  <div class="relative inline-block">
    <input type="checkbox" class="sr-only" bind:checked="{checkboxState}" />
    <div class="line block bg-grey5 w-10 h-6 rounded-full"></div>
    <div class="dot absolute left-1 top-1 bg-lightgrey10 w-4 h-4 rounded-full transition"></div>
  </div>
</label>
