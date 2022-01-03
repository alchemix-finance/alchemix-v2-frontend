<script>
import { createEventDispatcher } from 'svelte';

export let label;

let checkboxState = false;

const dispatch = createEventDispatcher();

const broadcastValue = () => {
  dispatch('toggleChange', {
    value: checkboxState,
  });
};

$: checkboxState, () => broadcastValue();
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
  <div class="relative inline-block">
    <input type="checkbox" class="sr-only" bind:checked="{checkboxState}" />
    <div class="line block bg-grey5 w-10 h-6 rounded-full"></div>
    <div class="dot absolute left-1 top-1 bg-white2 w-4 h-4 rounded-full transition"></div>
  </div>
  {#if label}
    <p class="inline-block ml-3">
      {label}
    </p>
  {/if}
</label>
