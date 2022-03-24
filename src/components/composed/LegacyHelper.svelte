<script>
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import { slide } from 'svelte/transition';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader';
  import settings from '@stores/settings';
  import Button from '@components/elements/Button';
  import { BarLoader } from 'svelte-loading-spinners';
  import { liquidateLegacy, withdrawLegacy, flashloanDeposit } from '@stores/v2/flashloanActions';
  import { signer } from '@stores/v2/derived';
  import { addressStore } from '@stores/v2/alcxStore';
  import MaxLossController from '@components/composed/MaxLossController';
  import InputNumber from '@components/elements/inputs/InputNumber';
  import ToggleSwitch from '@components/elements/ToggleSwitch';

  let mode = 0;
  let processing = false;
  let collateralInitial = 0;
  let targetLtv = 50;
  let maximumLoss = 500;
  let alchemist;
  let useCustomValues = false;

  const migration = async (targetAlchemist) => {
    alchemist = targetAlchemist;
    processing = true;
    try {
      mode = 1;
      await liquidateLegacy(targetAlchemist, [$addressStore, $signer]);
      mode = 2;
      await withdrawLegacy(targetAlchemist, [$addressStore, $signer]).then((response) => {
        console.log(response);
        collateralInitial = response.data;
      });
      mode = 3;
    } catch (error) {
      mode = 0;
      processing = false;
    }
  };

  const flashloan = async (targetAlchemist) => {
    mode = 4;
    try {
      await flashloanDeposit(
        targetAlchemist,
        utils.parseEther(collateralInitial.toString()),
        utils.parseEther((100 / targetLtv).toString()),
        BigNumber.from(maximumLoss.toString()).add(BigNumber.from(100000)).div(BigNumber.from(10)),
        [$signer],
      );
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
    targetLtv = 50;
  };
</script>

<ContainerWithHeader canToggle="{true}" isVisible="{true}">
  <div class="text-sm flex flex-row justify-between" slot="header">
    <p class="self-center">Legacy Migration</p>
  </div>
  <div slot="body" class="flex flex-col space-y-4 p-4">
    {#if processing}
      <div class="w-full flex flex-row space-x-4" transition:slide|local>
        <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}">
          <div class="w-full flex flex-row justify-between items-center">
            <p class="text-lg">Step 1: Liquidating</p>
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
            First step is to liquidate your outstanding debt, if applicable.
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
            <p class="text-lg">Step 2: Withdrawing</p>
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
            Second step withdraws your entire balance from V1.
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
            <p class="text-lg">Step 3: Migrating</p>
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
            Third step flashloans your new balance into a deposit with 50% LTV ratio.
          </p>
          <div class="flex flex-col space-y-2 justify-center items-center h-12">
            {#if mode < 4}
              <div class="w-full">
                <ToggleSwitch
                  label="Default Settings"
                  secondLabel="Custom Settings"
                  useColor="{false}"
                  on:toggleChange="{() => {
                    useCustomValues = !useCustomValues;
                  }}"
                />
              </div>
              <Button
                label="{mode < 3 ? 'Waiting for other steps...' : 'Flashloan into V2'}"
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
            label="Restart"
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
          To make it as simple as possible to migrate your Legacy vault deposits into V2, Alchemix is
          providing a migration tool which enables you to transfer your position into V2 while staying as
          gas-cost efficient as possible.
        </p>
        <p class="mb-4">
          Your wallet will prompt you a few times to sign transactions that take care of the following steps:
        </p>
        <div class="flex flex-row justify-between space-x-4 mb-4">
          <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey15inverse' : 'bg-grey15'}">
            <p class="text-lg">Step 1: Liquidating</p>
            <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
              First step is to liquidate your outstanding debt, if applicable.
            </p>
          </div>
          <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey15inverse' : 'bg-grey15'}">
            <p class="text-lg">Step 2: Withdrawing</p>
            <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
              Second step withdraws your entire balance from V1.
            </p>
          </div>
          <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey15inverse' : 'bg-grey15'}">
            <p class="text-lg">Step 3: Migrating</p>
            <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
              Third step flashloans your new balance into a deposit with 50% LTV ratio.
            </p>
          </div>
        </div>

        <div class="w-full flex flex-row space-x-4 justify-between h-12">
          <Button
            disabled="{processing}"
            label="Migrate from Legacy alUSD"
            borderColor="green4"
            backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
            hoverColor="green4"
            on:clicked="{() => migration(0)}"
          />
          <Button
            disabled="{processing}"
            label="Migrate from Legacy alETH"
            borderColor="green4"
            backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
            hoverColor="green4"
            on:clicked="{() => migration(1)}"
          />
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
            Choose an amount that you want to flashloan into a new V2 position, as well as the desired LTV
            ratio which is used to determine how much debt to take up with each debt token mint.
          </p>
        </div>
        <div class="w-full">
          <label for="yieldInput" class="text-sm text-lightgrey10">
            {$_('available')}: 123123123 DAI
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
                placeholder="~0.00 DAI"
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
            >Target LTV: {targetLtv}%</label
          >
          <input
            type="range"
            id="ltvSlider"
            class="appearance-none rounded-full cursor-pointer h-2 w-full"
            name="LTV Ratio"
            min="0"
            max="50"
            step="5"
            bind:value="{targetLtv}"
          />
        </div>
        <MaxLossController preset="0.5" bind:maxLoss="{maximumLoss}" />
      </div>
    {/if}
  </div>
</ContainerWithHeader>
