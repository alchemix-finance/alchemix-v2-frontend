<script>
  import { utils } from 'ethers';
  import { _ } from 'svelte-i18n';
  import ViewContainer from '../components/elements/ViewContainer.svelte';
  import PageHeader from '../components/elements/PageHeader.svelte';
  import ContainerWithHeader from '../components/elements/ContainerWithHeader.svelte';
  import Button from '../components/elements/Button.svelte';
  import Table from '../components/composed/Table/Table.svelte';
  import HeaderCell from '../components/composed/Table/HeaderCell.svelte';
  import ExpandRowCell from '../components/composed/Table/ExpandRowCell.svelte';
  import FarmNameCell from '../components/composed/Table/farms/FarmNameCell.svelte';
  import RewardCell from '../components/composed/Table/farms/RewardCell.svelte';
  import ActionsCell from '../components/composed/Table/farms/ActionsCell.svelte';
  import ExternalFarms from '../components/composed/Table/farms/ExternalFarms.svelte';
  import ExitCell from '../components/composed/Table/farms/ExitCell.svelte';
  import ExpandedFarm from '../components/composed/Table/farms/ExpandedFarm.svelte';
  import ExpandedSushiFarm from '@components/composed/Table/farms/ExpandedSushiFarm.svelte';
  import ExpandedCrvFarm from '@components/composed/Table/farms/ExpandedCrvFarm.svelte';
  import CurrencyCell from '@components/composed/Table/CurrencyCell.svelte';
  import StakedCell from '@components/composed/Table/farms/StakedCell';
  import ClaimableCell from '@components/composed/Table/farms/ClaimableCell';
  import { BarLoader } from 'svelte-loading-spinners';
  import global from '../stores/global';
  import { addressStore, farmsStore } from '@stores/v2/alcxStore';
  import { signer } from '@stores/v2/derived';
  import { fetchCrvFarm, fetchInternalFarms, fetchSushiFarm } from '@stores/v2/asyncMethods';
  import { ExternalFarmsMetadata, InternalFarmsMetadata } from '@stores/v2/farmsConstants';
  import {
    castToCrvFarmType,
    castToInternalFarmType,
    castToSushiFarmType,
    FarmTypes,
  } from '@stores/v2/types';

  const filterTypes = Object.freeze({
    ACTIVE: 0,
    RETIRED: 1,
    EXTERNAL: 2,
  });

  let currentFilter = filterTypes.ACTIVE;

  const colsDefinition = {
    [filterTypes.ACTIVE]: [
      {
        columnId: 'col0',
        value: '',
        colSize: 1,
      },
      {
        columnId: 'col1',
        CellComponent: HeaderCell,
        value: $_('table.pool'),
        colSize: '3',
      },
      {
        columnId: 'col2',
        CellComponent: HeaderCell,
        value: $_('table.tvl'),
        colSize: 2,
      },
      {
        columnId: 'col3',
        CellComponent: HeaderCell,
        value: $_('table.rewards'),
        colSize: 3,
      },
      {
        columnId: 'col4',
        CellComponent: HeaderCell,
        value: $_('table.apr'),
        colSize: 1,
      },
      {
        columnId: 'col5',
        CellComponent: HeaderCell,
        value: $_('table.action'),
        colSize: 3,
      },
    ],
    [filterTypes.RETIRED]: [
      {
        columnId: 'col1',
        CellComponent: HeaderCell,
        value: $_('table.pool'),
        colSize: 7,
      },
      {
        columnId: 'col2',
        CellComponent: HeaderCell,
        value: $_('table.staked_token'),
        colSize: 4,
      },
      {
        columnId: 'col3',
        CellComponent: HeaderCell,
        value: $_('table.claimable_rewards'),
        colSize: 4,
      },
      {
        columnId: 'col4',
        CellComponent: HeaderCell,
        value: $_('table.action'),
        colSize: 5,
      },
    ],
    [filterTypes.EXTERNAL]: [
      {
        columnId: 'col1',
        CellComponent: HeaderCell,
        value: $_('table.pool'),
        colSize: 7,
      },
      {
        columnId: 'col2',
        CellComponent: HeaderCell,
        value: $_('table.staked_token'),
        colSize: 4,
      },
      {
        columnId: 'col3',
        CellComponent: HeaderCell,
        value: $_('table.claimable_rewards'),
        colSize: 4,
      },
      {
        columnId: 'col4',
        CellComponent: HeaderCell,
        value: $_('table.action'),
        colSize: 5,
      },
    ],
  };

  const goTo = (url) => {
    window.open(url, '_blank');
  };

  /*
   * @param token the address of the token
   * @returns the token price from zapper's price api
   * */
  const getPrice = (token) => {
    return $global.tokenPrices.find((entry) => entry.address.toUpperCase() === token.toUpperCase())?.price;
  };

  const filterFuncs = {
    [filterTypes.ACTIVE]: (value) => value.body.isActive,
    [filterTypes.RETIRED]: (value) => !value.body.isActive,
    [filterTypes.EXTERNAL]: (value) => false,
  };

  function calculateSushiTVL(farm) {
    const price0 = getPrice(farm.underlyingAddresses[0]);
    const price1 = getPrice(farm.underlyingAddresses[1]);
    const value0 = parseFloat(utils.formatEther(farm.tvl[0])) * price0;
    const value1 = parseFloat(utils.formatEther(farm.tvl[1])) * price1;
    return value0 + value1;
  }

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

      if (farm.body.isActive) {
        //TODO: Wait for the price to be fetched

        const price = (() => {
          if (farm.type === FarmTypes.INTERNAL) {
            return getPrice(
              InternalFarmsMetadata[`${farm.body.tokenAddress}`.toLowerCase()].tokenIcon === 'saddle'
                ? '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
                : farm.body.tokenAddress,
            );
          }

          return 0;
        })();

        const tvl = (() => {
          if (farm.type === FarmTypes.INTERNAL) {
            return parseFloat(utils.formatEther(farm.body.tvl)) * price;
          } else if (farm.type === FarmTypes.SUSHI) {
            const sushiFarm = castToSushiFarmType(farm.body);

            return calculateSushiTVL(sushiFarm);
          } else if (farm.type === FarmTypes.CRV) {
            return utils.formatEther(farm.body.tvl);
          }

          return 0;
        })();

        const expandedComponent = (() => {
          if (farm.type === FarmTypes.INTERNAL) {
            return ExpandedFarm;
          } else if (farm.type === FarmTypes.SUSHI) {
            return ExpandedSushiFarm;
          } else if (farm.type === FarmTypes.CRV) {
            return ExpandedCrvFarm;
          }
        })();

        const farmData = (() => {
          if (farm.type === FarmTypes.INTERNAL) {
            return castToInternalFarmType(farm.body);
          } else if (farm.type === FarmTypes.SUSHI) {
            return castToSushiFarmType(farm.body);
          } else if (farm.type === FarmTypes.CRV) {
            return castToCrvFarmType(farm.body);
          }
        })();

        const apy = (() => {
          if (
            farm.type === FarmTypes.INTERNAL &&
            InternalFarmsMetadata[`${farm.body.tokenAddress}`.toLowerCase()].tokenIcon !== 'saddle'
          ) {
            const internalFarm = castToInternalFarmType(farm.body);

            const _fRewardRate = parseFloat(utils.formatEther(internalFarm.rewardRate));
            const _fTotalPoolDeposits = parseFloat(utils.formatEther(internalFarm.tvl));
            const _fRewardsPerWeek = _fRewardRate * 45000;

            const _fApr = ((_fRewardsPerWeek * 52) / _fTotalPoolDeposits) * 100;

            return (((1 + _fApr / 100 / 100) ** 100 - 1) * 100).toFixed(3);
          } else if (
            farm.type === FarmTypes.INTERNAL &&
            InternalFarmsMetadata[`${farm.body.tokenAddress}`.toLowerCase()].tokenIcon === 'saddle'
          ) {
            const internalFarm = castToInternalFarmType(farm.body);

            const _fRewardRate = parseFloat(utils.formatEther(internalFarm.rewardRate));
            const _fTotalPoolDeposits = parseFloat(utils.formatEther(internalFarm.tvl));

            const _fWethPrice = getPrice('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2');
            const _fTokenprice = getPrice('0xdbdb4d16eda451d0503b854cf79d55697f90c8df');

            const _fApr =
              ((_fRewardRate * 45000 * 52 * _fTokenprice) /
                (parseFloat(_fTotalPoolDeposits) * parseFloat(_fWethPrice))) *
              100;

            return _fApr.toFixed(3);
          } else if (farm.type === FarmTypes.SUSHI) {
            const _farm = castToSushiFarmType(farm.body);

            const [alcxRewards, sushiRewards] = _farm.rewardRates;
            const [wethReserves, alcxReserves] = _farm.tvl;

            const price0 = getPrice(_farm.underlyingAddresses[0]);
            const price1 = getPrice(_farm.underlyingAddresses[1]);

            const alcxRewardsPerWeek = parseFloat(utils.formatEther(alcxRewards)) * 45000;
            const sushiRewardsPerWeek = parseFloat(utils.formatEther(sushiRewards)) * 45000;

            const slpTVL = calculateSushiTVL(_farm);

            const slpPrice = slpTVL / parseFloat(utils.formatEther(_farm.slpTotalSupply));

            return 0;
          }
          return 'N/A';
        })();

        return {
          col0: {
            CellComponent: ExpandRowCell,
            expandedRow: {
              ExpandedRowComponent: expandedComponent,
            },
            farm: farmData,
            farmType: farm.type,
            colSize: 1,
          },
          col1: {
            CellComponent: FarmNameCell,
            farmName: farmMetadata.title,
            farmSubtitle: farmMetadata.subtitle,
            farmIcon: farmMetadata.farmIcon,
            tokenIcon: farmMetadata.tokenIcon,
            colSize: 3,
            alignment: 'justify-self-start',
          },
          col2: {
            CellComponent: CurrencyCell,
            value: tvl,
            colSize: 2,
          },
          col3: {
            CellComponent: RewardCell,
            rewards: farm.body.rewards,
            colSize: 3,
          },
          col4: {
            value: apy > 0 ? apy + '%' : 'NaN',
            colSize: 1,
          },
          col5: {
            CellComponent: ActionsCell,
            label: $_('table.manage'),
            expandedRow: {
              ExpandedRowComponent: expandedComponent,
            },
            poolId: farmData.poolId,
            farmType: farm.type,
            farm: farmData,
            colSize: 3,
          },
        };
      } else {
        return {
          col1: {
            CellComponent: FarmNameCell,
            tokenIcon: farmMetadata.tokenIcon,
            farmIcon: farmMetadata.farmIcon,
            farmName: farmMetadata.title,
            farmSubtitle: farmMetadata.subtitle,
            colSize: 7,
            alignment: 'justify-self-start',
          },
          col2: {
            CellComponent: StakedCell,
            amount: farm.body.userDeposit,
            tokenSymbol: farm.body.tokenSymbol,
            colSize: 4,
          },
          col3: {
            CellComponent: ClaimableCell,
            rewardAmount: `${farm.body.rewards
              .map((reward, index) => {
                return `${farm.body.userUnclaimed} ${reward.tokenName} ${
                  index !== farm.body.rewards.length - 1 ? '+' : ''
                }`;
              })
              .join(' ')}`,
            rewardToken: '',
            colSize: 4,
          },
          col4: {
            CellComponent: ExitCell,
            farmType: farm.type,
            farm: farm.body,
            colSize: 5,
          },
        };
      }
    });

  let loadingVaults = true;

  const onInitialize = async () => {
    loadingVaults = true;

    await fetchInternalFarms([$signer]);
    await fetchSushiFarm([$signer]);
    await fetchCrvFarm([$signer]);

    loadingVaults = false;
  };

  $: if ($addressStore && $global.tokenPrices) {
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
              <BarLoader color="#F5C59F" />
            </div>
          {:else}
            <Table columns="{colsDefinition[filterTypes.ACTIVE]}" rows="{filteredRows}" />
          {/if}
        {:else if currentFilter === filterTypes.RETIRED}
          {#if loadingVaults}
            <div class="flex justify-center my-4">
              <BarLoader color="#F5C59F" />
            </div>
          {:else}
            <Table columns="{colsDefinition[filterTypes.RETIRED]}" rows="{filteredRows}" />
          {/if}
        {:else}
          <ExternalFarms />
        {/if}
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
