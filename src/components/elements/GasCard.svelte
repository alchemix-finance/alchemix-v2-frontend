<script>
  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';
  import settings from '@stores/settings';

  export let description = 'standard';
  export let gasFee = {
    maxFeePerGas: 0,
    baseFeePerGas: 0,
    maxPriorityFeePerGas: 0,
  };
  export let cardColor = $settings.invertColors ? 'lightgrey20inverse' : 'lightgrey20';
  export let isActive = false;
  export let compactView = false;

  const dispatch = createEventDispatcher();

  // @dev emits an event 'gasSelected'
  const eventCheck = () => {
    if (!isActive) dispatch('gasSelected');
  };
  $: normalizedGas = typeof gasFee === 'number' ? gasFee : gasFee.baseFeePerGas + gasFee.maxPriorityFeePerGas;
</script>

<div
  class="rounded border border-{isActive ? cardColor : 'lightgrey20'} py-4 px-6 {isActive
    ? `${$settings.invertColors ? 'bg-grey1inverse' : 'bg-grey1'}`
    : `cursor-pointer hover:${$settings.invertColors ? 'bg-grey1inverse' : 'bg-grey1'}`} w-full"
  on:click="{eventCheck}"
>
  <div class="flex flex-row justify-between mb-3">
    <p class="capitalize font-alcxTitles text-sm {compactView ? '' : 'opacity-50'}">
      {compactView ? `${description}: ${normalizedGas}` : description}
    </p>
    <p class="bg-{cardColor} w-4 h-1 rounded self-center"></p>
  </div>
  {#if !compactView}
    <p class="text-3xl mb-3">
      {normalizedGas} Gwei
    </p>
  {/if}
  {#if typeof gasFee === 'object'}
    <div class="flex flex-row justify-between">
      <p class="text-sm opacity-50">{$_('base')}: {gasFee.baseFeePerGas}</p>
      <p class="text-sm opacity-50">
        {$_('prio')}: {gasFee.maxPriorityFeePerGas}
      </p>
      <p class="text-sm opacity-50">{$_('max')}: {gasFee.maxFeePerGas}</p>
    </div>
  {/if}
</div>
