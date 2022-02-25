<script>
  import { utils, BigNumber } from 'ethers';
  import { onMount } from 'svelte';
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
  import stakingPools from '../stores/stakingPools';
  import { BarLoader } from 'svelte-loading-spinners';
  import account from '@stores/account';
  import walletBalance from '../stores/walletBalance';
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

  const toggleButtons = {
    farmSelect: {
      active: true,
      retired: false,
      external: false,
    },
  };

  const buttonToggler = (selector, key) => {
    Object.keys(toggleButtons[selector]).forEach((entry) => {
      if (toggleButtons[selector][entry] !== key) {
        toggleButtons[selector][entry] = false;
      }
    });
    toggleButtons[selector][key] = true;
  };

  // @dev logic for controlling the filtered views
  const vaultFilter = (filter) => {
    const selector = ['farmSelect', 'modeSelect', 'stratSelect'];
    buttonToggler(selector[filter.id], filter.filter);
  };
  /*
   * @param token the address of the token
   * @returns the token price from zapper's price api
   * */
  const getPrice = (token) => {
    return $global.tokenPrices.find((entry) => entry.address.toUpperCase() === token.toUpperCase())?.price;
  };

  // let loading = true;
  // const renderFarms = async () => {
  //   if (loading) {
  //     $stakingPools.allPools.forEach((pool) => {
  //       const userToken = $walletBalance.tokens.find((item) => item.address === pool.token);
  //       if (pool.poolConfig && pool.reward !== '0.0') {
  //         let expandedProps;
  //         let rewards;
  //         let component;
  //         let tvl;
  //         switch (pool.type) {
  //           case 'sushi':
  //             expandedProps = {
  //               token: {
  //                 balance: pool.slpBalance,
  //                 symbol: 'SLP',
  //               },
  //               stakedBalance: pool.userDeposit,
  //               unclaimedAlcx: pool.rewardsAlcx,
  //               unclaimedSushi: pool.rewardsSushi,
  //               slpBalance: pool.slpBalance,
  //             };
  //             rewards = [
  //               {
  //                 iconName: 'alchemix',
  //                 tokenName: 'ALCX',
  //               },
  //               {
  //                 iconName: 'sushi',
  //                 tokenName: 'SUSHI',
  //               },
  //             ];
  //             component = ExpandedSushiFarm;
  //             const price0 = getPrice(pool.underlying0);
  //             const price1 = getPrice(pool.underlying1);
  //             const value0 = parseFloat(utils.formatEther(pool.reserve._reserve0)) * price0;
  //             const value1 = parseFloat(utils.formatEther(pool.reserve._reserve1)) * price1;
  //             tvl = value0 + value1;
  //             break;
  //           case 'crv':
  //             expandedProps = {
  //               token: {
  //                 balance: pool.slpBalance,
  //                 symbol: pool.poolConfig.title,
  //               },
  //               stakedBalance: pool.userDeposit,
  //               unclaimedAlcx: pool.rewardsAlcx,
  //               unclaimedCrv: pool.rewardsCrv,
  //               slpBalance: pool.slpSupply,
  //             };
  //             rewards = [
  //               {
  //                 iconName: 'alchemix',
  //                 tokenName: 'ALCX',
  //               },
  //               {
  //                 iconName: 'crv',
  //                 tokenName: 'CRV',
  //               },
  //             ];
  //             component = ExpandedCrvFarm;
  //             tvl = utils.formatEther(
  //               pool.totalSupply.mul(pool.virtualPrice).div(BigNumber.from(10).pow(18)),
  //             );
  //             break;
  //           case 'internal':
  //           default:
  //             expandedProps = {
  //               poolId: pool.poolId,
  //               token: userToken,
  //               stakedBalance: pool.userDeposit,
  //               unclaimedRewards: pool.userUnclaimed,
  //               reward: pool.rewardToken,
  //             };
  //             rewards = [
  //               {
  //                 iconName: 'alchemix',
  //                 tokenName: 'ALCX',
  //               },
  //             ];
  //             component = ExpandedFarm;
  //             // @lord forgive me for I'm about to sin
  //             const price = getPrice(
  //               pool.poolConfig.tokenIcon === 'saddle'
  //                 ? '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
  //                 : pool.token,
  //             );
  //             tvl = parseFloat(utils.formatEther(pool.tvl)) * price;
  //             break;
  //         }
  //         const payload = {
  //           col0: {
  //             CellComponent: ExpandRowCell,
  //             expandedRow: {
  //               ExpandedRowComponent: component,
  //             },
  //             ...expandedProps,
  //             colSize: 1,
  //           },
  //           col1: {
  //             CellComponent: FarmNameCell,
  //             farmName: pool.poolConfig.title,
  //             farmSubtitle: pool.poolConfig.subtitle,
  //             farmIcon: pool.poolConfig.farmIcon,
  //             tokenIcon: pool.poolConfig.tokenIcon,
  //             colSize: 3,
  //             alignment: 'justify-self-start',
  //           },
  //           col2: {
  //             CellComponent: CurrencyCell,
  //             value: tvl,
  //             colSize: 2,
  //           },
  //           col3: {
  //             CellComponent: RewardCell,
  //             rewards: rewards,
  //             colSize: 3,
  //           },
  //           col4: {
  //             value: 'N/A',
  //             colSize: 1,
  //           },
  //           col5: {
  //             CellComponent: ActionsCell,
  //             label: $_('table.manage'),
  //             expandedRow: {
  //               ExpandedRowComponent: component,
  //             },
  //             ...expandedProps,
  //             colSize: 3,
  //           },
  //         };
  //         rowsActive.push(payload);
  //       } else if (pool.poolConfig && pool.reward === '0.0') {
  //         const payload = {
  //           col1: {
  //             CellComponent: FarmNameCell,
  //             tokenIcon: pool.poolConfig.tokenIcon,
  //             farmIcon: pool.poolConfig.farmIcon,
  //             farmName: pool.poolConfig.title,
  //             farmSubtitle: pool.poolConfig.subtitle,
  //             colSize: 7,
  //             alignment: 'justify-self-start',
  //           },
  //           col2: {
  //             CellComponent: StakedCell,
  //             amount: pool.userDeposit,
  //             tokenSymbol: pool.tokenSymbol,
  //             colSize: 4,
  //           },
  //           col3: {
  //             CellComponent: ClaimableCell,
  //             rewardAmount: pool.userUnclaimed,
  //             rewardToken: pool.rewardToken,
  //             colSize: 4,
  //           },
  //           col4: {
  //             CellComponent: ExitCell,
  //             poolId: pool.poolId,
  //             colSize: 5,
  //           },
  //         };
  //         rowsRetired.push(payload);
  //       }
  //       if (pool.poolId + 1 === parseInt($stakingPools.pools, 10)) {
  //         loading = false;
  //       }
  //     });
  //   }
  // };
  //
  // $: if (!$account.loadingFarmsConfigurations && !$account.loadingWalletBalance) renderFarms();

  const filterFuncs = {
    [filterTypes.ACTIVE]: (value) => value.body.isActive,
    [filterTypes.RETIRED]: (value) => !value.body.isActive,
    [filterTypes.EXTERNAL]: (value) => false,
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

            const price0 = getPrice(sushiFarm.underlyingAddresses[0]);
            const price1 = getPrice(sushiFarm.underlyingAddresses[1]);
            const value0 = parseFloat(utils.formatEther(sushiFarm.tvl[0])) * price0;
            const value1 = parseFloat(utils.formatEther(sushiFarm.tvl[1])) * price1;
            return value0 + value1;
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
            value: 'N/A',
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

  $: console.log($farmsStore);

  $: if ($addressStore) {
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
