<script>
import { createEventDispatcher } from 'svelte';
export let description = 'standard';
export let gasFee = '0';
export let cardColor = 'lightgrey20';
export let isActive = false;

const dispatch = createEventDispatcher();

// @dev emits an event 'gasSelected'
const eventCheck = () => {
  if (!isActive) dispatch('gasSelected');
};
</script>

<div
  class="rounded border border-{isActive
    ? cardColor
    : 'lightgrey20'} py-4 px-6 {isActive
    ? ''
    : 'cursor-pointer hover:bg-grey1'}"
  on:click="{eventCheck}"
>
  <div class="flex flex-row justify-between mb-3">
    <p class="capitalize font-alcxTitles text-sm opacity-50">
      {description}
    </p>
    <p class="bg-{cardColor} w-4 h-1 rounded self-center"></p>
  </div>
  <p class="text-3xl">{gasFee} Gwei</p>
</div>
