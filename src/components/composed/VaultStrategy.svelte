<script>
  import { _ } from 'svelte-i18n';
  import { slide, fly } from 'svelte/transition';
  import { utils } from 'ethers';
  import settings from '@stores/settings';
  import FarmNameCell from '@components/composed/Table/farms/FarmNameCell.svelte';
  import CurrencyCell from '@components/composed/Table/CurrencyCell.svelte';
  import VaultCapacityCell from '@components/composed/Table/VaultCapacityCell.svelte';
  import YieldCell from '@components/composed/Table/YieldCell.svelte';
  import Button from '@components/elements/Button.svelte';
  import Deposit from '@components/composed/Modals/vaults/Deposit.svelte';
  import Withdraw from '@components/composed/Modals/vaults/Withdraw.svelte';
  import Migrate from '@components/composed/Modals/vaults/Migrate.svelte';
  import { vaultsStore } from '@stores/v2/alcxStore';

  export let strategy;

  let isExpanded = false;
  let isHovered = false;
  let mode = 0;
  let prevMode = 0;
  let _capInfo;

  $: ltv = 100 / parseFloat(utils.formatEther($vaultsStore[strategy?.col5.vault.type]?.ratio));

  const toggleExpanded = () => {
    isExpanded = !isExpanded;
  };

  const toggleMode = (_mode) => {
    prevMode = mode;
    mode = _mode;
  };
</script>

<style>
  .transition-fix {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }

  .transition-fix > * {
    grid-row: 1;
    grid-column: 1;
  }
</style>

<div class="flex flex-row relative items-center">
  <div
  class="flex flex-col pl-2 pr-2 md:pl-0 md:pr-8 border rounded {$settings.invertColors
      ? 'bg-grey10inverse border-grey3inverse'
      : 'bg-grey10 border-grey3'}  py-4 w-full relative"
    on:mouseenter="{() => (isHovered = true)}"
    on:mouseleave="{() => (isHovered = false)}"
  >
    <div class="absolute -left-3 top-10 lg:-left-2 lg:top-8">
      <div class="flex justify-center items-center w-6">
        <Button
          borderColor="bronze3"
          selected="{isHovered}"
          borderSize="1"
          fontSize="text-base"
          py="py-0"
          label="{isExpanded ? '-' : '+'}"
          on:clicked="{() => toggleExpanded()}"
        />
      </div>
    </div>
    <div
      class="w-full grid grid-cols-12 justify-between items-center hover:cursor-pointer"
      on:click="{() => toggleExpanded()}"
    >
      <div class="col-span-6 md:col-span-3 mb-4 md:mb-0">
        <FarmNameCell
          farmIcon="{strategy.col2.farmIcon}"
          farmName="{strategy.col2.farmName}"
          farmSubtitle="{strategy.col2.farmSubtitle}"
          isBeta="{strategy.col2.isBeta}"
          tokenIcon="{strategy.col2.tokenIcon}"
          isHalted="{false}"
        />
      </div>
      <div class="col-span-4 sm:col-span-3 md:col-span-2 order-3 md:order-none">
        <p class="text-center text-xs text-xs lg:text-sm text-lightgrey10">Deposit</p>
        <CurrencyCell value="{strategy.deposited.value}" token="{strategy.deposited.token}" />
      </div>
      <div class="col-span-4 sm:col-span-3 md:col-span-2 order-4 md:order-none">
        <p class="text-center text-xs lg:text-sm text-lightgrey10">TVL</p>
        <CurrencyCell value="{strategy.col3.value}" token="{strategy.col3.token}" />
      </div>
      <div class="flex flex-col px-2 md:px-8 col-span-6 md:col-span-3 mb-4 md:mb-0">
        <p class=" text-center text-xs lg:text-sm text-lightgrey10">Utilization</p>
        <VaultCapacityCell
          vaultType="{strategy.limit.vaultType}"
          signer="{strategy.limit.signer}"
          yieldTokenAddress="{strategy.limit.yieldTokenAddress}"
          underlyingPerShare="{strategy.limit.underlyingPerShare}"
          yieldPerShare="{strategy.limit.yieldPerShare}"
          decimals="{strategy.limit.decimals}"
          symbol="{strategy.limit.symbol}"
          bind:capInfo="{_capInfo}"
        />
      </div>
      <div class="self-start col-span-2 sm:col-span-3 md:col-span-1 flex items-center flex-col justify-center h-full  order-5 md:order-none">
        <p class="text-center text-xs lg:text-sm text-lightgrey10">LTV</p>
        <YieldCell yieldRate="{ltv}" yieldType="" />
      </div>
      <div class="self-start col-span-2 sm:col-span-3 md:col-span-1 flex items-center flex-col justify-center h-full order-6 md:order-none">
        <p class="text-center text-xs lg:text-sm text-lightgrey10">{strategy.col4.yieldType}</p>
        <YieldCell yieldRate="{strategy.col4.yieldRate}" yieldType="" />
      </div>
    </div>
    {#if isExpanded}
      <div class="w-full flex flex-col md:ml-4 mt-4 overflow-hidden" transition:slide|local>
        <div
          class="flex flex-row border rounded {$settings.invertColors
            ? 'bg-grey3inverse border-grey1inverse'
            : 'bg-black2 border-grey1'} mb-4"
        >
          <div class="flex justify-between space-x-2 w-full p-2">
            <Button
              label="{$_('actions.deposit')}"
              solid="{false}"
              width="w-full"
              height="h-8"
              selected="{mode === 0}"
              canToggle="{true}"
              borderSize="0"
              on:clicked="{() => toggleMode(0)}"
            />

            <Button
              label="{$_('actions.withdraw')}"
              solid="{false}"
              width="w-full"
              height="h-8"
              selected="{mode === 1}"
              canToggle="{true}"
              borderSize="0"
              on:clicked="{() => toggleMode(1)}"
            />
            <Button
              label="{$_('actions.migrate')}"
              solid="{false}"
              width="w-full"
              height="h-8"
              selected="{mode === 2}"
              canToggle="{true}"
              borderSize="0"
              on:clicked="{() => toggleMode(2)}"
            />
          </div>
        </div>
        <div class="transition-fix">
          {#if mode === 0}
            <div in:fly|local="{{ x: -200 }}" out:fly|local="{{ x: -200 }}">
              <Deposit
                vault="{strategy.col5.vault}"
                borrowLimit="{strategy.col5.borrowLimit}"
                capInfo="{_capInfo}"
              />
            </div>
          {:else if mode === 1}
            <div
              in:fly|local="{{ x: prevMode < 1 ? 200 : -200 }}"
              out:fly|local="{{ x: mode < 1 ? 200 : -200 }}"
            >
              <Withdraw vault="{strategy.col5.vault}" borrowLimit="{strategy.col5.borrowLimit}" />
            </div>
          {:else if mode === 2}
            <div in:fly|local="{{ x: 200 }}" out:fly|local="{{ x: 200 }}">
              <Migrate vault="{strategy.col5.vault}" vaultType="{strategy.limit.vaultType}" />
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
