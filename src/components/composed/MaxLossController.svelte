<script>
  import { slide } from 'svelte/transition';
  import { _ } from 'svelte-i18n';
  import settings from '@stores/settings';
  import VaultMessage from '@components/elements/VaultMessage.svelte';

  export let maxLoss;
  export let maxLossPreset;

  const maximumLossInputPref = {
    min: 0,
    max: 100,
    multiplier: 100,
    safeMin: 0.3,
    saneMax: 5,
  };
  let maximumLossInput;

  $: maxLossPreset,
    !!maximumLossInput
      ? maximumLossInput
      : (maximumLossInput = maxLossPreset?.toString() / maximumLossInputPref.multiplier) || 0;

  $: maxLoss = maximumLossInput * maximumLossInputPref.multiplier;
  $: dangerLow = maxLoss < parseInt(maxLossPreset?.toString());
</script>

<style>
  input[type='range'].ltv-slider {
    width: 100%;
    margin: 5px 0;
    background-color: transparent;
    -webkit-appearance: none;
  }

  input[type='range'].ltv-slider:focus {
    outline: none;
  }

  input[type='range'].ltv-slider::-webkit-slider-runnable-track {
    background: #42b792;
    border: 0;
    border-radius: 25px;
    width: 100%;
    height: 6px;
    cursor: pointer;
  }

  input[type='range'].ltv-slider::-webkit-slider-thumb {
    margin-top: -5px;
    width: 16px;
    height: 16px;
    background: #10141a;
    border: 1px solid #42b792;
    border-radius: 4px;
    cursor: pointer;
    -webkit-appearance: none;
  }

  input[type='range'].ltv-slider:focus::-webkit-slider-runnable-track {
    background: #52c19e;
  }

  input[type='range'].ltv-slider::-moz-range-track {
    background: #42b792;
    border: 0;
    border-radius: 25px;
    width: 100%;
    height: 6px;
    cursor: pointer;
  }

  input[type='range'].ltv-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #10141a;
    border: 1px solid #42b792;
    border-radius: 4px;
    cursor: pointer;
  }

  input[type='range'].ltv-slider::-ms-track {
    background: transparent;
    border-color: transparent;
    border-width: 5px 0;
    color: transparent;
    width: 100%;
    height: 6px;
    cursor: pointer;
  }

  input[type='range'].ltv-slider::-ms-fill-lower {
    background: #3ba483;
    border: 0;
    border-radius: 50px;
  }

  input[type='range'].ltv-slider::-ms-fill-upper {
    background: #42b792;
    border: 0;
    border-radius: 50px;
  }

  input[type='range'].ltv-slider::-ms-thumb {
    width: 16px;
    height: 16px;
    background: #10141a;
    border: 1px solid #42b792;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 0;
    /*Needed to keep the Edge thumb centred*/
  }

  input[type='range'].ltv-slider:focus::-ms-fill-lower {
    background: #42b792;
  }

  input[type='range'].ltv-slider:focus::-ms-fill-upper {
    background: #52c19e;
  }

  .range_tick {
    fill: #979ba2;
  }

  .range_tick:last-child {
    -webkit-transform: translateX(-3px);
    -moz-transform: translateX(-3px);
    -ms-transform: translateX(-3px);
    -o-transform: translateX(-3px);
    transform: translateX(-3px);
  }

  /*TODO: Use one of the selectors from https://stackoverflow.com/a/20541859/7077589 and figure out
  how to remove the vertical space around the range input in IE*/
  @supports (-ms-ime-align: auto) {
    /* Pre-Chromium Edge only styles, selector taken from https://stackoverflow.com/a/32202953/7077589 */
    input[type='range'].ltv-slider {
      margin: 0;
      /*Edge starts the margin from the thumb, not the track as other browsers do*/
    }
  }
</style>

<div class="flex flex-col space-y-2 w-full">
  <div class="flex flex-row w-full">
    <p class="flex-auto {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'} text-sm">
      {$_('max_slippage')}:
    </p>
    <p>
      {maximumLossInput}%
    </p>
  </div>
  <div class="flex flex-col w-full text-lg">
    <div class="w-full flex flex-row space-x-4 justify-between items-center">
      <input
        type="range"
        id="ltvSlider"
        class="cursor-pointer w-full ltv-slider"
        name="{$_('migration.ltv_ratio')}"
        min="0.1"
        max="10"
        step="0.05"
        bind:value="{maximumLossInput}"
      />
      <label for="ltvSlider" class="hidden">{maximumLossInput}%</label>
    </div>
    <fieldset class="w-full">
      <svg role="presentation" width="100%" height="10" xmlns="http://www.w3.org/2000/svg">
        <rect class="range_tick" x="0%" y="3" width="1" height="10"></rect>
        <rect class="range_tick" x="10%" y="3" width="1" height="10"></rect>
        <rect class="range_tick" x="20%" y="3" width="1" height="10"></rect>
        <rect class="range_tick" x="30%" y="3" width="1" height="10"></rect>
        <rect class="range_tick" x="40%" y="3" width="1" height="10"></rect>
        <rect class="range_tick" x="50%" y="3" width="1" height="10"></rect>
        <rect class="range_tick" x="60%" y="3" width="1" height="10"></rect>
        <rect class="range_tick" x="70%" y="3" width="1" height="10"></rect>
        <rect class="range_tick" x="80%" y="3" width="1" height="10"></rect>
        <rect class="range_tick" x="90%" y="3" width="1" height="10"></rect>
        <rect class="range_tick" x="100%" y="3" width="1" height="10"></rect>
      </svg>
    </fieldset>
    {#if dangerLow}
      <div class="mt-4" transition:slide|local>
        <VaultMessage
          level="1"
          message="You have chosen a lower than suggested slippage, this transaction will likely fail."
        />
      </div>
    {/if}
  </div>
</div>
