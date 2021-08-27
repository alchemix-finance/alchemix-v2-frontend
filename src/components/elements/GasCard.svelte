<script>
import { _ } from 'svelte-i18n';
import { createEventDispatcher } from 'svelte';
export let description = 'standard';
export let gasFee = {
  maxFeePerGas: 0,
  baseFeePerGas: 0,
  maxPriorityFeePerGas: 0,
};
export let cardColor = 'lightgrey20';
export let isActive = false;
export let compactView = false;

const dispatch = createEventDispatcher();

// @dev emits an event 'gasSelected'
const eventCheck = () => {
  if (!isActive) dispatch('gasSelected');
};
</script>

<div
  class="rounded border border-{isActive ? cardColor : 'lightgrey20'} py-4 px-6 {isActive
    ? ''
    : 'cursor-pointer hover:bg-grey1'} w-full"
  on:click="{eventCheck}"
>
  <div class="flex flex-row justify-between mb-3">
    <p class="capitalize font-alcxTitles text-sm {compactView ? '' : 'opacity-50'}">
      {compactView ? `${description}: ${gasFee.baseFeePerGas + gasFee.maxPriorityFeePerGas}` : description}
    </p>
    <p class="bg-{cardColor} w-4 h-1 rounded self-center"></p>
  </div>
  {#if !compactView}
    <p class="text-3xl mb-3">
      {gasFee.baseFeePerGas + gasFee.maxPriorityFeePerGas} Gwei
    </p>
  {/if}
  <div class="flex flex-row justify-between">
    <p class="text-sm opacity-50">{$_('base')}: {gasFee.baseFeePerGas}</p>
    <p class="text-sm opacity-50">
      {$_('prio')}: {gasFee.maxPriorityFeePerGas}
    </p>
    <p class="text-sm opacity-50">{$_('max')}: {gasFee.maxFeePerGas}</p>
  </div>
</div>
