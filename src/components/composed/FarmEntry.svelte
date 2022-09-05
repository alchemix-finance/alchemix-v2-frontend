<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { slide } from 'svelte/transition';
  import settings from '@stores/settings';
  import { FarmTypes } from '@stores/v2/types';

  import Button from '@components/elements/Button.svelte';
  import ExpandedFarm from '@components/composed/Table/farms/ExpandedFarm.svelte';
  import ExpandedSushiFarm from '@components/composed/Table/farms/ExpandedSushiFarm.svelte';
  import ExpandedCrvFarm from '@components/composed/Table/farms/ExpandedCrvFarm.svelte';
  import FarmNameCell from '@components/composed/Table/farms/FarmNameCell.svelte';
  import StakedCell from '@components/composed/Table/farms/StakedCell.svelte';
  import TvlCell from '@components/composed/Table/farms/TvlCell.svelte';
  import RewardCell from '@components/composed/Table/farms/RewardCell.svelte';
  import YieldCell from '@components/composed/Table/YieldCell.svelte';
  import ActionsCell from '@components/composed/Table/farms/ActionsCell.svelte';
  import ClaimableCell from '@components/composed/Table/farms/ClaimableCell.svelte';
  import ExitCell from '@components/composed/Table/farms/ExitCell.svelte';

  export let farm;
  export let filter;

  enum RenderType {
    'ACTIVE' = 'grid-cols-7',
    'RETIRED' = 'grid-cols-5',
  }

  const RegisteredFarms = {
    [FarmTypes.INTERNAL]: ExpandedFarm,
    [FarmTypes.SUSHI]: ExpandedSushiFarm,
    [FarmTypes.CRV]: ExpandedCrvFarm,
  };

  let isExpanded = false;
  let isHovered = false;

  const toggleExpanded = () => {
    if (filter === 'ACTIVE') isExpanded = !isExpanded;
  };
</script>

<div class="flex flex-row relative items-center px-4">
  <div
    class="flex flex-col border rounded w-full relative {$settings.invertColors
      ? 'bg-grey10inverse border-grey3inverse'
      : 'bg-grey10 border-grey3'}"
    on:mouseenter="{() => {
      isHovered = true;
    }}"
    on:mouseleave="{() => {
      isHovered = false;
    }}"
  >
    {#if filter === 'ACTIVE'}
      <div class="absolute -left-2 top-8">
        <div class="flex justify-center items-center w-6">
          <Button
            borderColor="bronze3"
            selected="{isHovered}"
            fontSize="text-md"
            py="py-0"
            label="{isExpanded ? '-' : '+'}"
            on:clicked="{() => toggleExpanded()}"
          />
        </div>
      </div>
    {/if}

    <div
      class="w-full px-8 py-4 flex flex-row flex-wrap space-y-5 lg:space-y-0 lg:flex-nowrap {RenderType[
        filter
      ]} justify-between {filter === 'ACTIVE' ? 'hover:cursor-pointer' : 'hover:cursor-default'}"
      on:click="{() => toggleExpanded()}"
    >
      <div class="w-full flex-2">
        <FarmNameCell
          tokenIcon="{farm.metadata.tokenIcon}"
          farmIcon="{farm.metadata.farmIcon}"
          farmName="{farm.metadata.farmName}"
          farmSubtitle="{farm.metadata.farmSubtitle}"
          alignment="justify-self-start"
          pl="pl-0"
        />
      </div>
      <div class="w-1/2 flex-2">
        <p class="text-center text-sm text-lightgrey10">{$_('table.staked_token')}</p>
        <StakedCell amount="{farm.staked.amount}" tokenSymbol="{farm.staked.tokenSymbol}" />
      </div>
      {#if filter === 'ACTIVE'}
        <div class="w-1/2 flex-2">
          <p class="text-center text-sm text-lightgrey10">{$_('table.tvl')}</p>
          <TvlCell tvl="{farm.tvl}" />
        </div>
        <div class="w-1/2 flex-2">
          <p class="text-center text-sm text-lightgrey10">{$_('table.rewards')}</p>
          <RewardCell rewards="{farm.rewards}" />
        </div>
        <div class="w-1/2 flex-2">
          <p class="text-center text-sm text-lightgrey10">{$_('table.yield')}</p>
          <YieldCell yieldRate="{farm.yield.rate}" yieldType="{farm.yield.type}" />
        </div>
        <div class="w-full lg:w-1/2 flex-2">
          <p class="text-center text-sm text-lightgrey10">{$_('table.action')}</p>
          <ActionsCell
            label="{$_('table.manage')}"
            poolId="{farm.metadata.poolId}"
            farmType="{farm.metadata.type}"
            farm="{farm.adapter}"
          />
        </div>
      {:else}
        <div class="w-1/2 flex-2">
          <p class="text-center text-sm text-lightgrey10">{$_('table.claimable_rewards')}</p>
          <ClaimableCell
            rewardAmount="{farm.retired.rewardAmount}"
            rewardToken="{farm.retired.rewardToken}"
          />
        </div>
        <div class="w-1/2 flex-2">
          <p class="text-center text-sm text-lightgrey10">{$_('table.action')}</p>
          <ExitCell farmType="{farm.metadata.type}" farm="{farm.body}" />
        </div>
      {/if}
    </div>
    {#if isExpanded}
      <div
        class="w-full flex flex-col p-4 space-y-4 overflow-hidden border {$settings.invertColors
          ? 'border-grey10inverse bg-grey15inverse'
          : 'border-grey10 bg-grey15'}"
        transition:slide|local
      >
        <svelte:component
          this="{RegisteredFarms[farm.metadata.type]}"
          farm="{farm.adapter}"
          type="{farm.metadata.type}"
        />
      </div>
    {/if}
  </div>
</div>
