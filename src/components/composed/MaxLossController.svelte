<script>
  import { _ } from 'svelte-i18n';
  import { createEventDispatcher, onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import ToggleSwitch from '@components/elements/ToggleSwitch';
  import InputNumber from '@components/elements/inputs/InputNumber';
  import Button from '@components/elements/Button';

  let maximumLossInput;
  let useCustomAmount = false;
  let selectedButton = 0;

  const dispatch = createEventDispatcher();
  const lossPresets = [0.1, 0.5, 1];
  const maximumLoss = {
    min: 0,
    max: 100,
    multiplier: 1000,
  };

  const broadcastValue = () => {
    dispatch('valueChanged', {
      value: maximumLossInput * maximumLoss.multiplier,
    });
  };

  const toggleInput = () => {
    if (useCustomAmount) selectSlippage(selectedButton);
    useCustomAmount = !useCustomAmount;
    if (!useCustomAmount) maximumLossInput = lossPresets[selectedButton - 1];
  };

  const selectSlippage = (num) => {
    selectedButton = num;
    maximumLossInput = lossPresets[num - 1];
  };

  onMount(() => {
    // TODO add settings to get default from user, fallback to 1
    selectSlippage(1);
  });

  $: maximumLossInput, broadcastValue();
</script>

<div class="flex flex-col space-y-2 w-full">
  <div class="flex flex-row w-full">
    <p class="flex-auto text-lightgrey10 text-sm">
      {$_('max_slippage')}:
    </p>
    <ToggleSwitch label="{$_('custom_amount')}" on:toggleChange="{toggleInput}" />
  </div>

  {#if useCustomAmount}
    <div
      class="flex bg-grey3 rounded border {maximumLossInput > maximumLoss.max
        ? 'border-red3'
        : 'border-grey3'}"
      transition:slide|local
    >
      <div class="w-full">
        <InputNumber
          id="underlyingInput"
          bind:value="{maximumLossInput}"
          placeholder="0-100%"
          class="w-full rounded appearance-none text-xl text-right h-full p-4 bg-grey3 {maximumLossInput >
          maximumLoss.max
            ? 'text-red3'
            : 'text-lightgrey5'}"
        />
      </div>
      <div class="flex flex-col">
        <Button
          label="MAX"
          width="w-full"
          fontSize="text-xs"
          textColor="lightgrey10"
          backgroundColor="grey3"
          borderSize="0"
          height="h-10"
          on:clicked="{() => {
            maximumLossInput = maximumLoss.max;
          }}"
        />
        <Button
          label="CLEAR"
          width="w-max"
          fontSize="text-xs"
          textColor="lightgrey10"
          backgroundColor="grey3"
          borderSize="0"
          height="h-10"
          on:clicked="{() => {
            maximumLossInput = '';
          }}"
        />
      </div>
    </div>
  {:else}
    <div class="flex flex-row w-full text-lg" transition:slide|local>
      <button
        class="border border-grey5 rounded-l w-full {selectedButton === 1 ? 'bg-grey3' : 'hover:bg-grey10'}"
        on:click="{() => selectSlippage(1)}"
      >
        <p
          class="text-center h-full py-3 {selectedButton === 1
            ? 'opacity-100'
            : 'opacity-50 hover:opacity-100'}"
        >
          0.1%
        </p>
      </button>
      <button
        class="border-t border-b border-grey5 w-full {selectedButton === 2 ? 'bg-grey3' : 'hover:bg-grey10'}"
        on:click="{() => selectSlippage(2)}"
      >
        <p
          class="text-center h-full py-3 {selectedButton === 2
            ? 'opacity-100'
            : 'opacity-50 hover:opacity-100'}"
        >
          0.5%
        </p>
      </button>
      <button
        class="border border-grey5 rounded-r w-full {selectedButton === 3 ? 'bg-grey3' : 'hover:bg-grey10'}"
        on:click="{() => selectSlippage(3)}"
      >
        <p
          class="text-center h-full py-3 {selectedButton === 3
            ? 'opacity-100'
            : 'opacity-50 hover:opacity-100'}"
        >
          1%
        </p>
      </button>
    </div>
  {/if}
</div>
