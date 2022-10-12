<script>
  import { _ } from 'svelte-i18n';
  import { slide } from 'svelte/transition';
  import { utils } from 'ethers';

  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';
  import Button from '@components/elements/Button.svelte';
  import MaxLossController from '@components/composed/MaxLossController.svelte';
  import InputNumber from '@components/elements/inputs/InputNumber.svelte';

  import { sweepLegacy } from '@stores/v2/flashloanActions';
  import { signer } from '@stores/v2/derived';
  import { fetchBalanceByAddress } from '@stores/v2/asyncMethods';
  import settings from '@stores/settings';

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
      await sweepLegacy(targetAlchemist, [$signer]).then((response) => {
        fetchBalanceByAddress(response.underlying, [$signer]);
      });
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
</script>

<ContainerWithHeader canToggle="{true}" isVisible="{true}">
  <div class="text-sm flex flex-row justify-between" slot="header">
    <p class="self-center">{$_('migration.title')}</p>
  </div>
  <div slot="body" class="flex flex-col space-y-4 p-4">
    <div
      class="w-full rounded p-4 {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}"
      transition:slide|local
    >
      <p class="mb-4">
        {$_('migration.paragraph_1')}
      </p>
      <p class="mb-4">
        {$_('migration.paragraph_2b')}
      </p>
      <div class="flex flex-row justify-between space-x-4 mb-4">
        <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey15inverse' : 'bg-grey15'}">
          <p class="text-lg">Alchemist: alUSD</p>
          <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
            {$_('migration.alusd_explain')}
          </p>
          <div class="w-full">
            <Button
              label="{$_('migration.from_alusd')}"
              borderColor="green4"
              backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
              hoverColor="green4"
              height="h-12"
              on:clicked="{() => migration(0)}"
            />
          </div>
        </div>
        <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey15inverse' : 'bg-grey15'}">
          <p class="text-lg">Alchemist: alETH</p>
          <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
            {$_('migration.aleth_explain')}
          </p>
          <div class="w-full">
            <Button
              label="{$_('migration.from_aleth')}"
              borderColor="green4"
              backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
              hoverColor="green4"
              height="h-12"
              on:clicked="{() => migration(1)}"
            />
          </div>
        </div>
      </div>
    </div>
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
