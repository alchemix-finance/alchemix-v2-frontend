<script>
  import { _ } from 'svelte-i18n';
  import { utils } from 'ethers';
  import { BarLoader } from 'svelte-loading-spinners';

  import ViewContainer from '@components/elements/ViewContainer.svelte';
  import PageHeader from '@components/elements/PageHeader.svelte';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';
  import Button from '@components/elements/Button.svelte';
  import ExternalFarms from '@components/composed/Table/farms/ExternalFarms.svelte';
  import GAlcxWrapper from '@components/composed/GAlcxWrapper.svelte';
  import FarmEntry from '@components/composed/FarmEntry.svelte';
  import LiquidityMigration from '@components/composed/LiquidityMigration.svelte';

  import { addressStore, farmsStore, networkStore, tokenPriceStore } from '@stores/v2/alcxStore';
  import { signer } from '@stores/v2/derived';
  import { fetchCrvFarm, fetchInternalFarms, fetchSushiFarm } from '@stores/v2/asyncMethods';
  import { ExternalFarmsMetadata, InternalFarmsMetadata } from '@stores/v2/farmsConstants';
  import { FarmTypes } from '@stores/v2/types';
  import { InternalFarmAdapter } from '@stores/v2/adapters/InternalFarmAdapter';
  import { SushiFarmAdapter } from '@stores/v2/adapters/SushiFarmAdapter';
  import { CRVFarmAdapter } from '@stores/v2/adapters/CRVFarmAdapter';
  import settings from '@stores/settings';

  const filterTypes = Object.freeze({
    ACTIVE: 0,
    RETIRED: 1,
    EXTERNAL: 2,
  });

  let currentFilter = filterTypes.ACTIVE;

  const filterFuncs = {
    [filterTypes.ACTIVE]: (value) => value.body.isActive,
    [filterTypes.RETIRED]: (value) => !value.body.isActive,
    [filterTypes.EXTERNAL]: () => false,
  };

  const registeredFarmAdapters = {
    [FarmTypes.INTERNAL]: InternalFarmAdapter,
    [FarmTypes.SUSHI]: SushiFarmAdapter,
    [FarmTypes.CRV]: CRVFarmAdapter,
  };

  $: filteredRows = $farmsStore
    .filter(
      (val) =>
        InternalFarmsMetadata[`${val.body.tokenAddress}`.toLowerCase()] !== undefined ||
        ExternalFarmsMetadata[`${val.body.tokenAddress}`.toLowerCase()] !== undefined,
    )
    .filter(filterFuncs[currentFilter])
    .map((farm) => {
      const farmMetadata =
        farm.type === FarmTypes.INTERNAL
          ? InternalFarmsMetadata[`${farm.body.tokenAddress}`.toLowerCase()]
          : ExternalFarmsMetadata[`${farm.body.tokenAddress}`.toLowerCase()];

      let adapter = {};
      if (farm.body.isActive) adapter = new registeredFarmAdapters[farm.type](farm.body, $tokenPriceStore);

      return {
        body: farm.body,
        metadata: {
          tokenIcon: farmMetadata.tokenIcon,
          farmIcon: farmMetadata.farmIcon,
          farmName: farmMetadata.title,
          farmSubtitle: farmMetadata.subtitle,
          poolId: farm.body.isActive ? adapter.getFarm().poolId : null,
          type: farm.type,
        },
        staked: {
          amount: farm.body.userDeposit,
          tokenSymbol: farm.body.tokenSymbol,
        },
        tvl: farm.body.isActive ? adapter.getTvl() : null,
        rewards: farm.body.rewards,
        yield: {
          rate: farm.body.isActive ? (adapter.getApy() > 0 ? adapter.getApy() : 'N/A') : null,
          type: 'APY',
        },
        adapter: farm.body.isActive ? adapter.getFarm() : null,
        retired: {
          rewardToken: '',
          rewardAmount: `${farm.body.rewards
            .map((reward, index) => {
              return `${utils.formatEther(farm.body.userUnclaimed[index])} ${reward.tokenName} ${
                index !== farm.body.rewards.length - 1 ? '+' : ''
              }`;
            })
            .join(' ')}`,
        },
      };
    });

  const staticExternalFarms = [
    {
      icon: 'saddle.svg',
      name: 'Saddle d4',
      subtitle: $_('farm_page.saddle_text'),
      actions: [
        {
          label: $_('actions.deposit'),
          url: 'https://saddle.exchange/#/pools/d4/deposit',
        },
        {
          label: $_('actions.stake'),
          url: 'https://app.frax.finance/staking#Saddle_alUSD_FEI_FRAX_LUSD',
        },
        {
          label: $_('actions.swap'),
          url: 'https://saddle.exchange/#/',
        },
      ],
    },
    {
      icon: 'sushi.svg',
      name: 'alUSD/ETH Onsen',
      subtitle: $_('farm_page.sushi_text'),
      actions: [
        {
          label: $_('actions.deposit'),
          url: 'https://app.sushi.com/add/ETH/0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9',
        },
        {
          label: $_('actions.stake'),
          url: 'https://app.sushi.com/farm',
        },
        {
          label: $_('actions.swap'),
          url: 'https://app.sushi.com/swap#/swap?inputCurrency=0xbc6da0fe9ad5f3b0d58160288917aa56653660e9&outputCurrency=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        },
      ],
    },
    {
      icon: 'mstable.svg',
      name: 'mStable alUSD Feeder',
      subtitle: $_('farm_page.mstable_text'),
      actions: [
        {
          label: `${$_('actions.deposit')} & ${$_('actions.stake')}`,
          url: 'https://mstable.app/#/musd/pools/0x4eaa01974b6594c0ee62ffd7fee56cf11e6af936',
        },
        {
          label: $_('actions.swap'),
          url: 'https://mstable.app/#/musd/swap',
        },
      ],
    },
  ];

  let loadingVaults = true;

  const onInitialize = async () => {
    loadingVaults = true;

    await fetchInternalFarms([$signer], $networkStore);
    await fetchSushiFarm([$signer]);
    await fetchCrvFarm([$signer]);

    loadingVaults = false;
  };

  $: if ($addressStore && $tokenPriceStore) {
    onInitialize();
  }
</script>

<ViewContainer>
  <div class="flex justify-between" slot="head">
    <PageHeader
      pageIcon="farm_thin.svg"
      pageTitle="{$_('farm_page.title')}"
      pageSubtitle="{$_('farm_page.subtitle')}"
    />
  </div>

  <div class="w-full mb-8">
    <GAlcxWrapper />
  </div>

  <div class="w-full mb-8">
    <LiquidityMigration />
  </div>

  <div class="w-full mb-8">
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 flex space-x-4">
        <Button
          label="{$_('table.active_select')}"
          width="w-max"
          canToggle="{true}"
          selected="{currentFilter === filterTypes.ACTIVE}"
          solid="{false}"
          borderSize="0"
          on:clicked="{() => (currentFilter = filterTypes.ACTIVE)}"
        />

        <Button
          label="{$_('table.retired_select')}"
          width="w-max"
          canToggle="{true}"
          selected="{currentFilter === filterTypes.RETIRED}"
          solid="{false}"
          borderSize="0"
          on:clicked="{() => (currentFilter = filterTypes.RETIRED)}"
        />

        <Button
          label="{$_('table.external_select')}"
          width="w-max"
          canToggle="{true}"
          selected="{currentFilter === filterTypes.EXTERNAL}"
          solid="{false}"
          borderSize="0"
          on:clicked="{() => (currentFilter = filterTypes.EXTERNAL)}"
        />
      </div>
      <div slot="body">
        {#if currentFilter === filterTypes.ACTIVE}
          {#if loadingVaults}
            <div class="flex justify-center my-4">
              <BarLoader color="{$settings.invertColors ? '#6C93C7' : '#F5C59F'}" />
            </div>
          {:else}
            <div class="flex flex-col space-y-4 py-4">
              {#each filteredRows as row}
                <FarmEntry farm="{row}" filter="ACTIVE" />
              {/each}
            </div>
          {/if}
        {:else if currentFilter === filterTypes.RETIRED}
          {#if loadingVaults}
            <div class="flex justify-center my-4">
              <BarLoader color="{$settings.invertColors ? '#6C93C7' : '#F5C59F'}" />
            </div>
          {:else}
            <div class="flex flex-col space-y-4 py-4">
              {#each filteredRows as row}
                <FarmEntry farm="{row}" filter="RETIRED" />
              {/each}
            </div>
          {/if}
        {:else}
          <div class="flex flex-col space-y-4 py-4">
            {#each staticExternalFarms as externalFarm}
              <ExternalFarms externalFarm="{externalFarm}" />
            {/each}
          </div>
        {/if}
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
