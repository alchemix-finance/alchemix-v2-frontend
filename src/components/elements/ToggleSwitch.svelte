<script>
  import { createEventDispatcher } from 'svelte';
  import settings from '@stores/settings';

  export let label;
  export let secondLabel;
  export let forceState;
  export let useColor = true;

  let checkboxState = false;

  const dispatch = createEventDispatcher();

  const broadcastValue = () => {
    dispatch('toggleChange', {
      value: checkboxState,
    });
  };

  const updateState = (state) => {
    checkboxState = state;
  };

  $: checkboxState, broadcastValue();
  $: forceState, updateState(forceState);
</script>

<style>
  input:checked ~ .dot {
    transform: translateX(100%);
    background-color: #3eb88e;
  }

  input:checked ~ .dotGrey {
    transform: translateX(100%);
  }

  input:checked ~ .line {
    background-color: #0e251d;
  }

  input:checked ~ .lineInverse {
    background-color: #dedbd3;
  }
</style>

<label class="flex items-center justify-between cursor-pointer" on:click="{() => broadcastValue()}">
  {#if label}
    <p
      class="inline-block {$settings.invertColors
        ? 'text-lightgrey10inverse'
        : 'text-lightgrey10'} text-sm mr-2"
    >
      {label}
    </p>
  {/if}
  <div class="relative inline-block">
    <input type="checkbox" class="sr-only" bind:checked="{checkboxState}" />
    <div
      class="block {$settings.invertColors
        ? 'bg-grey5inverse lineInverse'
        : 'bg-grey5 line'} w-10 h-6 rounded-full"
    ></div>
    <div
      class="{useColor ? 'dot' : 'dotGrey'} absolute left-1 top-1 {$settings.invertColors
        ? 'bg-lightgrey10inverse'
        : 'bg-lightgrey10'} w-4 h-4 rounded-full transition"
    ></div>
  </div>
  {#if secondLabel}
    <p
      class="inline-block {$settings.invertColors
        ? 'text-lightgrey10inverse'
        : 'text-lightgrey10'} text-sm ml-2"
    >
      {secondLabel}
    </p>
  {/if}
</label>
