<script>
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import { slide } from 'svelte/transition';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader';
  import settings from '@stores/settings';
  import Button from '@components/elements/Button';
  import { BarLoader } from 'svelte-loading-spinners';
  import { limitCheck, liquidateLegacy, withdrawLegacy, flashloanDeposit } from '@stores/v2/flashloanActions';
  import { signer } from '@stores/v2/derived';
  import { addressStore, balancesStore } from '@stores/v2/alcxStore';
  import MaxLossController from '@components/composed/MaxLossController';
  import InputNumber from '@components/elements/inputs/InputNumber';
  import ToggleSwitch from '@components/elements/ToggleSwitch';
  import { getTokenDataFromBalancesBySymbol } from '@stores/v2/helpers';
  import { fetchBalanceByAddress, fetchUpdateVaultByAddress } from '@stores/v2/asyncMethods';

  let mode = 0;
  let processing = false;
  let collateralInitial = 0;
  let targetLtv = 95;
  let maximumLoss = 1000;
  let alchemist;
  let useCustomValues = false;
  let canMigrateAlUSD = false;
  let canMigrateAlETH = false;
  let ethData;
  let daiData;

  const migration = async (targetAlchemist) => {
    alchemist = targetAlchemist;
    processing = true;
    try {
      mode = 1;
      await liquidateLegacy(targetAlchemist, [$addressStore, $signer]);
      mode = 2;
      await withdrawLegacy(targetAlchemist, [$addressStore, $signer]).then((response) => {
        if (response.withdrawAmount) {
          collateralInitial = utils.formatEther(response.withdrawAmount);
          fetchBalanceByAddress(response.underlyingToken, [$signer]);
        } else {
          useCustomValues = true;
        }
      });
      mode = 3;
    } catch (error) {
      reset();
      console.log(error);
    }
  };

  const flashloan = async (targetAlchemist) => {
    mode = 4;
    try {
      await flashloanDeposit(
        targetAlchemist,
        utils.parseEther(collateralInitial.toString()),
        BigNumber.from(targetLtv.toString()),
        BigNumber.from(maximumLoss.toString()).add(BigNumber.from(100000)),
        [$addressStore, $signer],
      ).then((response) => {
        Promise.all([
          fetchBalanceByAddress(response.underlyingToken, [$signer]),
          fetchUpdateVaultByAddress(response.vaultType, response.alchemistAddress, [$signer, $addressStore]),
        ]);
      });
      mode = 5;
    } catch (error) {
      reset();
      console.log(error);
    }
  };

  const reset = () => {
    mode = 0;
    processing = false;
    useCustomValues = false;
    targetLtv = 95;
  };

  const updateMigrate = (vault, state) => {
    console.log(vault, state);
    switch (vault) {
      case 1:
        canMigrateAlETH = state;
        break;
      default:
      case 0:
        canMigrateAlUSD = state;
        break;
    }
  };

  onMount(() => {
    [0, 1].map(async (vault) => {
      const limits = await limitCheck(vault, [$addressStore, $signer]);
      if (limits.mintLimit.currentLimit.gte(limits.openDebt) && limits.openDebt.gt(BigNumber.from(0))) {
        updateMigrate(vault, true);
      }
    });
    ethData = getTokenDataFromBalancesBySymbol('WETH', [$balancesStore]);
    daiData = getTokenDataFromBalancesBySymbol('DAI', [$balancesStore]);
  });
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
    margin-top: 0px;
    /*Needed to keep the Edge thumb centred*/
  }

  input[type='range'].ltv-slider:focus::-ms-fill-lower {
    background: #42b792;
  }

  input[type='range'].ltv-slider:focus::-ms-fill-upper {
    background: #52c19e;
  }

  /*TODO: Use one of the selectors from https://stackoverflow.com/a/20541859/7077589 and figure out
  how to remove the virtical space around the range input in IE*/
  @supports (-ms-ime-align: auto) {
    /* Pre-Chromium Edge only styles, selector taken from hhttps://stackoverflow.com/a/32202953/7077589 */
    input[type='range'].ltv-slider {
      margin: 0;
      /*Edge starts the margin from the thumb, not the track as other browsers do*/
    }
  }
</style>

<ContainerWithHeader canToggle="{true}" isVisible="{canMigrateAlUSD || canMigrateAlETH}">
  <div class="text-sm flex flex-row justify-between" slot="header">
    <p class="self-center">{$_('migration.title')}</p>
  </div>
  <div slot="body" class="flex flex-col space-y-4 p-4">
    {#if processing}
      <div class="w-full flex flex-row space-x-4" transition:slide|local>
        <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}">
          <div class="w-full flex flex-row justify-between items-center">
            <p class="text-lg">{$_('migration.step')} 1: {$_('migration.liquidating')}</p>
            {#if mode > 1}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#42B792"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                ></path>
              </svg>
            {/if}
          </div>
          <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
            {$_('migration.liq_explain')}
          </p>
          <div class="flex flex-row justify-center items-center h-12">
            <BarLoader
              duration="{mode === 1 ? '2.1s' : '0'}"
              color="{mode > 1 ? '#42B792' : $settings.invertColors ? '#6C93C7' : '#F5C59F'}"
            />
          </div>
        </div>
        <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}">
          <div class="w-full flex flex-row justify-between items-center">
            <p class="text-lg">{$_('migration.step')} 2: {$_('migration.withdrawing')}</p>
            {#if mode > 2}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#42B792"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                ></path>
              </svg>
            {/if}
          </div>
          <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
            {$_('migration.wit_explain')}
          </p>
          <div class="flex flex-row justify-center items-center h-12">
            <BarLoader
              duration="{mode === 2 ? '2.1s' : '0'}"
              color="{mode > 2 ? '#42B792' : $settings.invertColors ? '#6C93C7' : '#F5C59F'}"
            />
          </div>
        </div>
        <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}">
          <div class="w-full flex flex-row justify-between items-center">
            <p class="text-lg">{$_('migration.step')} 3: {$_('migration.migrating')}</p>
            {#if mode > 4}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#42B792"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                ></path>
              </svg>
            {/if}
          </div>
          <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
            {$_('migration.mig_explain')}
          </p>
          <div class="flex flex-col space-y-2 justify-center items-center h-12">
            {#if mode < 4}
              <div class="w-full">
                <ToggleSwitch
                  label="{$_('migration.toggle_default')}"
                  secondLabel="{$_('migration.toggle_custom')}"
                  useColor="{false}"
                  forceState="{useCustomValues}"
                  on:toggleChange="{() => {
                    useCustomValues = !useCustomValues;
                  }}"
                />
              </div>
              <Button
                label="{mode < 3 ? $_('migration.flashloan_waiting') : $_('migration.flashloan_ready')}"
                borderColor="green4"
                backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
                hoverColor="green4"
                fontSize="text-md"
                disabled="{mode < 3}"
                on:clicked="{() => flashloan(alchemist)}"
              />
            {:else}
              <BarLoader
                duration="{mode === 4 ? '2.1s' : '0'}"
                color="{mode > 4 ? '#42B792' : $settings.invertColors ? '#6C93C7' : '#F5C59F'}"
              />
            {/if}
          </div>
        </div>
      </div>
      {#if mode === 5}
        <div class="w-full flex flex-row h-12" transition:slide|loca>
          <Button
            label="{$_('migration.restart')}"
            borderColor="green4"
            backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
            hoverColor="green4"
            on:clicked="{() => reset()}"
          />
        </div>
      {/if}
    {:else}
      <div
        class="w-full rounded p-4 {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}"
        transition:slide|local
      >
        <p class="mb-4">
          {$_('migration.paragraph_1')}
        </p>
        <p class="mb-4">
          {$_('migration.paragraph_2')}
        </p>
        <div class="flex flex-row justify-between space-x-4 mb-4">
          <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey15inverse' : 'bg-grey15'}">
            <p class="text-lg">{$_('migration.step')} 1: {$_('migration.liquidating')}</p>
            <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
              {$_('migration.liq_explain')}
            </p>
          </div>
          <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey15inverse' : 'bg-grey15'}">
            <p class="text-lg">{$_('migration.step')} 2: {$_('migration.withdrawing')}</p>
            <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
              {$_('migration.wit_explain')}
            </p>
          </div>
          <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey15inverse' : 'bg-grey15'}">
            <p class="text-lg">{$_('migration.step')} 3: {$_('migration.migrating')}</p>
            <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
              {$_('migration.mig_explain')}
            </p>
          </div>
        </div>
        <div
          class="w-full flex flex-row justify-between h-12"
          class:space-x-4="{canMigrateAlUSD || canMigrateAlETH}"
        >
          <div class:hidden="{!canMigrateAlUSD}" class="w-full">
            <Button
              disabled="{!canMigrateAlUSD}"
              label="{$_('migration.from_alusd')}"
              borderColor="green4"
              backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
              hoverColor="green4"
              height="h-12"
              on:clicked="{() => migration(0)}"
            />
          </div>
          <div class:hidden="{!canMigrateAlETH}" class="w-full">
            <Button
              disabled="{!canMigrateAlETH}"
              label="{$_('migration.from_aleth')}"
              borderColor="green4"
              backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
              hoverColor="green4"
              height="h-12"
              on:clicked="{() => migration(1)}"
            />
          </div>
          <div
            class:hidden="{canMigrateAlUSD || canMigrateAlETH}"
            class="w-full flex flex-row justify-center space-x-4 items-center"
          >
            <Button
              label="{$_('migration.no_position')}"
              borderColor="green4"
              backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
              hoverColor="green4"
              height="h-12"
              on:clicked="{() => {
                updateMigrate(0, true);
                updateMigrate(1, true);
              }}"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#42B792"
                stroke-width="2"
                slot="rightSlot"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                ></path>
              </svg>
            </Button>
          </div>
        </div>
      </div>
    {/if}
    {#if useCustomValues && mode < 4}
      <div
        class="w-full flex flex-col space-y-4 rounded p-4 {$settings.invertColors
          ? 'bg-grey10inverse'
          : 'bg-grey10'}"
        transition:slide|local
      >
        <div class="w-full">
          <p class="mb-4">
            {$_('migration.cus_explain')}
          </p>
        </div>
        <div class="w-full">
          <label for="yieldInput" class="text-sm text-lightgrey10">
            {$_('available')}
            : {utils.formatEther(alchemist === 0 ? daiData.balance : ethData.balance)}
            {alchemist === 0 ? daiData.symbol : ethData.symbol}
          </label>
          <div
            class="flex {$settings.invertColors
              ? 'bg-grey3inverse border-grey3inverse'
              : 'bg-grey3 border-grey3'} rounded border"
          >
            <div class="w-full">
              <InputNumber
                id="yieldInput"
                bind:value="{collateralInitial}"
                placeholder="~0.00 {alchemist === 0 ? daiData.symbol : ethData.symbol}"
                class="w-full rounded appearance-none text-xl text-right h-full p-4 {$settings.invertColors
                  ? 'bg-grey3inverse text-lightgrey5inverse'
                  : 'bg-grey3 text-lightgrey5'}"
              />
            </div>
            <div class="flex flex-col">
              <Button
                label="MAX"
                width="w-full"
                fontSize="text-xs"
                textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
                backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
                borderSize="0"
                height="h-10"
                on:clicked="{() => {
                  collateralInitial = utils.formatEther(alchemist === 0 ? daiData.balance : ethData.balance);
                }}"
              />
              <Button
                label="CLEAR"
                width="w-max"
                fontSize="text-xs"
                textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
                backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
                borderSize="0"
                height="h-10"
                on:clicked="{() => {
                  collateralInitial = '';
                }}"
              />
            </div>
          </div>
        </div>
        <div class="w-full flex flex-row space-x-4 justify-between items-center">
          <label
            for="ltvSlider"
            class="text-sm w-32 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}"
            >{$_('migration.target_ltv')}: 1.{targetLtv}×</label
          >
          <input
            type="range"
            id="ltvSlider"
            class="cursor-pointer w-full ltv-slider"
            name="{$_('migration.ltv_ratio')}"
            min="0"
            max="95"
            step="5"
            bind:value="{targetLtv}"
          />
        </div>
        <MaxLossController preset="1" bind:maxLoss="{maximumLoss}" />
      </div>
    {/if}
  </div>
</ContainerWithHeader>
