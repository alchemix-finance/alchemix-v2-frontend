<script>
  import { _ } from 'svelte-i18n';
  import { slide } from 'svelte/transition';
  import ToggleSwitch from '@components/elements/ToggleSwitch';
  import InputNumber from '@components/elements/inputs/InputNumber';
  import Button from '@components/elements/Button';

  export let maxLoss;

  const typeOfLoses = Object.freeze({
    '0.1': 0,
    '0.5': 1,
    '1': 2,
  });

  const lossPresets = {
    [typeOfLoses['0.1']]: 0.1,
    [typeOfLoses['0.5']]: 0.5,
    [typeOfLoses['1']]: 1,
  };

  const maximumLossInputPref = {
    min: 0,
    max: 100,
    multiplier: 1000,
  };

  let currentPreset = typeOfLoses['0.1'];

  let useCustomAmount = false;
  let maximumLossInput = 0;

  maxLoss = lossPresets[typeOfLoses['0.1']] * maximumLossInputPref.multiplier;

  $: maxLoss = useCustomAmount
    ? maximumLossInput < 100
      ? maximumLossInput * maximumLossInputPref.multiplier
      : 100 * maximumLossInputPref.multiplier
    : lossPresets[currentPreset] * maximumLossInputPref.multiplier;
</script>

<div class="flex flex-col space-y-2 w-full">
  <div class="flex flex-row w-full">
    <p class="flex-auto text-lightgrey10 text-sm">
      {$_('max_slippage')}:
    </p>
    <ToggleSwitch
      label="{$_('custom_amount')}"
      on:toggleChange="{() => (useCustomAmount = !useCustomAmount)}"
    />
  </div>

  {#if useCustomAmount}
    <div
      class="flex bg-grey3 rounded border {maximumLossInput > maximumLossInputPref.max
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
          maximumLossInputPref.max
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
            maximumLossInput = maximumLossInputPref.max;
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
        class="border border-grey5 rounded-l w-full {currentPreset === typeOfLoses['0.1']
          ? 'bg-grey3'
          : 'hover:bg-grey10'}"
        on:click="{() => (currentPreset = typeOfLoses['0.1'])}"
      >
        <p
          class="text-center h-full py-3 {currentPreset === typeOfLoses['0.1']
            ? 'opacity-100'
            : 'opacity-50 hover:opacity-100'}"
        >
          0.1%
        </p>
      </button>
      <button
        class="border-t border-b border-grey5 w-full {currentPreset === typeOfLoses['0.5']
          ? 'bg-grey3'
          : 'hover:bg-grey10'}"
        on:click="{() => (currentPreset = typeOfLoses['0.5'])}"
      >
        <p
          class="text-center h-full py-3 {currentPreset === typeOfLoses['0.5']
            ? 'opacity-100'
            : 'opacity-50 hover:opacity-100'}"
        >
          0.5%
        </p>
      </button>
      <button
        class="border border-grey5 rounded-r w-full {currentPreset === typeOfLoses['1']
          ? 'bg-grey3'
          : 'hover:bg-grey10'}"
        on:click="{() => (currentPreset = typeOfLoses['1'])}"
      >
        <p
          class="text-center h-full py-3 {currentPreset === typeOfLoses['1']
            ? 'opacity-100'
            : 'opacity-50 hover:opacity-100'}"
        >
          1%
        </p>
      </button>
    </div>
  {/if}
</div>
