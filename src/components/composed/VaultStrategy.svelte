<script>
  import { _ } from 'svelte-i18n';
  import { slide, fly } from 'svelte/transition';
  import { utils, FixedNumber } from 'ethers';
  import { fetchTokenEnabledStatus } from '@stores/v2/asyncMethods';

  import settings from '@stores/settings';
  import { vaultsStore, networkStore } from '@stores/v2/alcxStore';
  import { signer } from '@stores/v2/derived';
  import { vaultMessages, VaultConstants } from '@stores/v2/constants';
  import { getTokenPriceInEth } from '@middleware/llama';
  import { reservesStore } from '@stores/aaveReserves';

  import FarmNameCell from '@components/composed/Table/farms/FarmNameCell.svelte';
  import CurrencyCell from '@components/composed/Table/CurrencyCell.svelte';
  import VaultCapacityCell from '@components/composed/Table/VaultCapacityCell.svelte';
  import YieldCell from '@components/composed/Table/YieldCell.svelte';
  import Button from '@components/elements/Button.svelte';
  import Deposit from '@components/composed/Modals/vaults/Deposit.svelte';
  import Withdraw from '@components/composed/Modals/vaults/Withdraw.svelte';
  import Migrate from '@components/composed/Modals/vaults/Migrate.svelte';
  import Info from '@components/composed/Modals/vaults/Info.svelte';
  import VaultMessage from '@components/elements/VaultMessage.svelte';

  export let strategy;

  let isExpanded = false;
  let isHovered = false;
  let mode = 0;
  let prevMode = 0;
  let _capInfo;
  let isPaused = false;

  let bonusYield = false;
  let bonusYieldRate = '0';
  let bonusYieldValue = '0';
  let bonusYieldToken = '';
  let aaveReserve;
  let tokenPriceInEth = 0;
  const WEI_DEC = 10 ** 18;
  const SPY = 31536000;
  let CHAIN_DEC;

  const getAaveReserveOpt = (_underlying) => {
    return $reservesStore
      .filter((reserve) => reserve.underlyingAsset.toLowerCase() === _underlying.toLowerCase())
      .filter((entry) => entry.aToken.rewards.emissionsPerSecond !== '0')[0];
  };

  $: bonusYieldType = strategy?.col4.incentives;
  const getIncentives = async () => {
    bonusYield = true;
    switch (bonusYieldType) {
      case 'aaveOptimism':
        aaveReserve = getAaveReserveOpt(strategy?.col3.token.address);
        bonusYieldValue = await getTokenPriceInEth('optimism', '0x4200000000000000000000000000000000000042');
        bonusYieldToken = 'OP';
        tokenPriceInEth = await getTokenPriceInEth('optimism', strategy?.col3.token.address);
        CHAIN_DEC = aaveReserve.decimals;
        bonusYieldRate =
          100 *
          ((aaveReserve.aToken.rewards[0].emissionsPerSecond * SPY * WEI_DEC * bonusYieldValue) /
            (aaveReserve.totalATokenSupply * tokenPriceInEth * WEI_DEC));
        if (CHAIN_DEC === 6) bonusYieldRate = bonusYieldRate / 10 ** 12;
        break;
      default:
        break;
    }
  };
  $: if (bonusYieldType !== '') getIncentives();
  $: bonusYieldRate;

  $: ltv = 100 / parseFloat(utils.formatEther($vaultsStore[strategy?.col5.vault.type]?.ratio));
  $: messages = vaultMessages.filter((item) => item.vault === strategy.limit.yieldTokenAddress);
  $: hasMessage = messages.length > 0;
  $: alToken = VaultConstants[strategy?.limit.vaultType].alToken;

  const getPausedStatus = async () => {
    isPaused = !(await fetchTokenEnabledStatus(
      strategy.limit.vaultType,
      strategy.limit.yieldTokenAddress,
      $signer,
      $networkStore,
    ));
  };

  $: totalYield = ((strategy.col4.yieldRate * 100 + bonusYieldRate * 100) / 100).toFixed(2);

  $: if (alToken !== undefined) getPausedStatus();

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
    class="flex flex-col pr-8 border rounded {$settings.invertColors
      ? 'bg-grey10inverse border-grey3inverse'
      : 'bg-grey10 border-grey3'}  py-4 w-full relative"
    on:mouseenter="{() => (isHovered = true)}"
    on:mouseleave="{() => (isHovered = false)}"
  >
    <div class="absolute -left-2 top-8">
      <div class="flex justify-center items-center w-6">
        <Button
          borderColor="bronze3"
          selected="{isHovered}"
          borderSize="1"
          fontSize="text-md"
          py="py-0"
          label="{isExpanded ? '-' : '+'}"
          on:clicked="{() => toggleExpanded()}"
        />
      </div>
    </div>
    <div
      class="w-full flex flex-col flex-wrap lg:flex-row gap-5 lg:gap-2 justify-between lg:items-center hover:cursor-pointer"
      on:click="{() => toggleExpanded()}"
    >
      <div class="w-full lg:w-1/4 flex-2">
        <FarmNameCell
          farmIcon="{strategy.col2.farmIcon}"
          farmName="{strategy.col2.farmName}"
          farmSubtitle="{strategy.col2.farmSubtitle}"
          isBeta="{strategy.col2.isBeta}"
          tokenIcon="{strategy.col2.tokenIcon}"
          isHalted="{false}"
        />
      </div>
      <div class="lg:hidden flex">
        <div class="w-full lg:w-1/6 flex-2">
          <p class="text-center text-sm text-lightgrey10">Deposit</p>
          <CurrencyCell value="{strategy.deposited.value}" token="{strategy.deposited.token}" />
        </div>
        <div class="w-full lg:w-1/6 flex-2">
          <p class="text-center text-sm text-lightgrey10">TVL</p>
          <CurrencyCell value="{strategy.col3.value}" token="{strategy.col3.token}" />
        </div>
      </div>
      <div class="hidden lg:block w-full lg:w-1/6 flex-2">
        <p class="text-center text-sm text-lightgrey10">Deposit</p>
        <CurrencyCell value="{strategy.deposited.value}" token="{strategy.deposited.token}" />
      </div>
      <div class="hidden lg:block w-full lg:w-1/6 flex-2">
        <p class="text-center text-sm text-lightgrey10">TVL</p>
        <CurrencyCell value="{strategy.col3.value}" token="{strategy.col3.token}" />
      </div>
      <div class="flex flex-col px-8 lg:w-1/4 flex-2">
        <p class="text-center text-sm text-lightgrey10">Utilization</p>
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
      <div class="flex lg:hidden">
        <div class="self-start w-full flex-1">
          <p class="text-center text-sm text-lightgrey10">LTV</p>
          <YieldCell yieldRate="{ltv}" yieldType="" />
        </div>
        <div class="self-start w-full flex-1">
          <p class="text-center text-sm text-lightgrey10">{strategy.col4.yieldType}</p>
          <YieldCell yieldRate="{strategy.col4.yieldRate}" yieldType="" />
        </div>
      </div>
      <div class="self-start hidden lg:block w-full flex-1">
        <p class="text-center text-sm text-lightgrey10">LTV</p>
        <YieldCell yieldRate="{ltv}" yieldType="" />
      </div>
      <div class="self-start hidden lg:block w-full flex-1">
        <p class="text-center text-sm text-lightgrey10">{strategy.col4.yieldType}</p>
        <YieldCell yieldRate="{totalYield}" />
      </div>
    </div>
    {#if isExpanded}
      <div class="w-full flex flex-col ml-4 mt-4 space-y-4 overflow-hidden" transition:slide|local>
        {#if hasMessage}
          {#each messages as message}
            <VaultMessage message="{message.message}" level="{message.level}" />
          {/each}
        {/if}
        <div
          class="flex flex-row border rounded {$settings.invertColors
            ? 'bg-grey3inverse border-grey1inverse'
            : 'bg-black2 border-grey1'}"
        >
          <div class="flex justify-between space-x-2 w-full overflow-x-scroll lg:overflow-x-hidden p-2">
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
            <Button
              label="{$_('actions.info')}"
              solid="{false}"
              width="w-full"
              height="h-8"
              selected="{mode === 3}"
              canToggle="{true}"
              borderSize="0"
              on:clicked="{() => toggleMode(3)}"
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
                isPaused="{isPaused}"
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
            <div
              in:fly|local="{{ x: prevMode < 2 ? 200 : -200 }}"
              out:fly|local="{{ x: mode < 2 ? 200 : -200 }}"
            >
              <Migrate vault="{strategy.col5.vault}" vaultType="{strategy.limit.vaultType}" />
            </div>
          {:else if mode === 3}
            <div in:fly|local="{{ x: 200 }}" out:fly|local="{{ x: 200 }}">
              <Info vault="{strategy.col5.vault}" />
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
