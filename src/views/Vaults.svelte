<script>
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import ViewContainer from '../components/elements/ViewContainer.svelte';
  import PageHeader from '../components/elements/PageHeader.svelte';
  import ContainerWithHeader from '../components/elements/ContainerWithHeader.svelte';
  import Button from '../components/elements/Button.svelte';
  // import AccountsPageBarCharts from '../components/composed/AccountsPageBarCharts.svelte';
  import { BarLoader } from 'svelte-loading-spinners';
  import { aggregate, alusd } from '@stores/vaults';
  import HeaderCell from '../components/composed/Table/HeaderCell.svelte';
  import Table from '../components/composed/Table/Table.svelte';
  import FarmNameCell from '../components/composed/Table/farms/FarmNameCell.svelte';
  import ActionsCell from '../components/composed/Table/vaults/ActionsCell.svelte';
  import Borrow from '../components/composed/Modals/vaults/Borrow.svelte';
  import Repay from '../components/composed/Modals/vaults/Repay.svelte';
  import Liquidate from '../components/composed/Modals/vaults/Liquidate.svelte';
  import CurrencyCell from '../components/composed/Table/CurrencyCell.svelte';
  import Metrics from '../components/composed/Metrics.svelte';
  import { showModal, modalReset } from '@stores/modal';
  import settings from '@stores/settings';
  import { balancesStore, vaultsStore, networkStore, tokenPriceStore } from '@stores/v2/alcxStore';
  import { VaultTypes } from 'src/stores/v2/types';
  import { VaultTypesInfos, chainIds } from 'src/stores/v2/constants';
  import makeSelectorStore from 'src/stores/v2/selectorStore';
  import { calculateVaultDebt, getTokenDataFromBalances } from 'src/stores/v2/helpers';
  import { vaultsLoading } from 'src/stores/v2/loadingStores';
  import YieldCell from '@components/composed/Table/YieldCell';
  import LegacyHelper from '@components/composed/LegacyHelper';
  import { signer } from '@stores/v2/derived';
  import VaultCapacityCell from '@components/composed/Table/VaultCapacityCell';
  import VaultStrategy from '@components/composed/VaultStrategy.svelte';

  $: vaultTypes = chainIds.filter((entry) => entry.id === $networkStore)[0].vaultTypes;
  $: vaultsSelector = makeSelectorStore([...vaultTypes]);

  const showMetrics = true;

  let rowsAll = [];
  let colsStrats = [
    {
      columnId: 'col2',
      CellComponent: HeaderCell,
      value: $_('table.strategy'),
      colSize: 3,
    },
    {
      columnId: 'deposit',
      CellComponent: HeaderCell,
      value: $_('table.deposited'),
      colSize: 2,
    },

    {
      columnId: 'col3',
      CellComponent: HeaderCell,
      value: $_('table.tvl'),
      colSize: 2,
    },
    {
      columnId: 'limit',
      CellComponent: HeaderCell,
      value: $_('table.deposit_limit'),
      colSize: 2,
    },
    {
      columnId: 'col4',
      CellComponent: HeaderCell,
      value: $_('table.yield'),
      colSize: 2,
    },
    {
      columnId: 'col5',
      CellComponent: HeaderCell,
      value: $_('table.actions'),
      colSize: 3,
    },
  ];

  let underlyingTokenAlusd = [];
  let yieldTokenAlusd = [];

  // @dev logic for controlling the filtered views

  const TypeOfStrategies = Object.freeze({
    USED: 0,
    UNUSED: 1,
    ALL: 2,
  });

  const strategyFilterFunc = {
    [TypeOfStrategies.USED]: (_vault) => _vault.balance.gt(BigNumber.from(0)),
    [TypeOfStrategies.UNUSED]: (_vault) => _vault.balance.lte(BigNumber.from(0)),
    [TypeOfStrategies.ALL]: (_vault) => true,
  };

  let currentStrategy = TypeOfStrategies.ALL;

  function countStrategiesForTypeOfStrategy(streategyFuncFilter, vaults) {
    return vaults.filter(streategyFuncFilter).length ?? 0;
  }

  function calculateBalanceValue(_tokenAmount, _perShare, _decimals, _price) {
    return (
      parseFloat(
        utils.formatUnits(_tokenAmount.mul(_perShare).div(BigNumber.from(10).pow(_decimals)), _decimals),
      ) * _price
    );
  }

  $: currentVaultsBasedOnType =
    Object.keys($vaultsStore)
      .map((vTypeId) => {
        if ($vaultsSelector.includes(parseInt(vTypeId))) {
          return $vaultsStore[parseInt(vTypeId)].vaultBody;
        }
      })
      .filter((elm) => elm !== undefined)
      .reduce((accumulator, value) => accumulator.concat(value), []) ?? [];

  $: aggregated = currentVaultsBasedOnType.map((vault) => {
    const underlyingTokenData = getTokenDataFromBalances(vault.underlyingAddress, [$balancesStore]);
    // const tokenPrice = $global.tokenPrices.find(
    //   (token) => token.address.toLowerCase() === underlyingTokenData.address.toLowerCase(),
    // )?.price;
    const currency = $settings.baseCurrency.symbol;
    const tokenPrice = $tokenPriceStore[vault.underlyingAddress.toLowerCase()][currency.toLowerCase()];
    const ratio = parseFloat(utils.formatEther($vaultsStore[vault.type]?.ratio));
    const depositValue = calculateBalanceValue(
      vault.balance,
      vault.underlyingPerShare,
      underlyingTokenData.decimals,
      tokenPrice,
    );
    const debtLimit = depositValue / ratio;
    const tvlValue = calculateBalanceValue(
      vault.tvl,
      vault.underlyingPerShare,
      underlyingTokenData.decimals,
      tokenPrice,
    );
    const vaultDebt = parseFloat(utils.formatEther($vaultsStore[vault.type].debt.debt)) * tokenPrice;
    const rawWithdraw = depositValue - vaultDebt * ratio;
    const vaultWithdraw = rawWithdraw < 0 ? 0 : rawWithdraw;
    return {
      vaultType: vault.type,
      token: vault.debtToken,
      ratio,
      depositValue,
      debtLimit,
      tvlValue,
      vaultDebt: vaultDebt > 0 ? vaultDebt : 0,
      vaultWithdraw,
    };
  });

  $: currentVaultsBasedOnStrategyType =
    currentVaultsBasedOnType.filter(strategyFilterFunc[currentStrategy]) ?? [];

  $: currentRowsOnCurrentStrategyType = currentVaultsBasedOnStrategyType.map((vault, index) => {
    const vaultTokenData = getTokenDataFromBalances(vault.address, [$balancesStore]);
    const debtTokenData = getTokenDataFromBalances(vault.debtToken, [$balancesStore]);
    const underlyingTokenData = getTokenDataFromBalances(vault.underlyingAddress, [$balancesStore]);
    // const tokenPrice = $global.tokenPrices.find(
    //   (token) => token.address.toLowerCase() === underlyingTokenData.address.toLowerCase(),
    // )?.price;
    const currency = $settings.baseCurrency.symbol;
    const tokenPrice = $tokenPriceStore[vault.underlyingAddress.toLowerCase()][currency.toLowerCase()];
    const depositValue = calculateBalanceValue(
      vault.balance,
      vault.underlyingPerShare,
      underlyingTokenData.decimals,
      tokenPrice,
    );
    // const debtValue = depositValue / parseFloat(utils.formatEther($vaultsStore[vault.type].ratio));
    const tvlValue = calculateBalanceValue(
      vault.tvl,
      vault.underlyingPerShare,
      underlyingTokenData.decimals,
      tokenPrice,
    );

    const vaultDebt = calculateVaultDebt(
      vault.balance,
      vault.underlyingPerShare,
      underlyingTokenData.decimals,
      $vaultsStore[vault.type].ratio,
    );

    // const adapterPrice = $adaptersStore[vault.type].adapters.filter(
    //   (adapter) => adapter.yieldToken === vault.address,
    // )[0].price;
    // const vaultCapacity = getDepositRemainder(vault.address, vault.type, adapterPrice, [$signer]);

    const vaultApy = Math.round(vault.apy * 10000) / 100;
    const vaultDebtDisplay = vault.balance
      .mul(BigNumber.from(10).pow(underlyingTokenData.decimals))
      .div($vaultsStore[vault.type].ratio.div(BigNumber.from(10).pow(18)));

    const metaConfig = VaultTypesInfos[vault.type].metaConfig;
    const vaultName = () => {
      if (metaConfig.hasOwnProperty(vaultTokenData.address)) {
        return metaConfig[vaultTokenData.address].vaultName + ' ' + vaultTokenData.symbol;
      } else {
        return 'Yearn ' + underlyingTokenData.symbol;
      }
    };

    const vaultIcon = () => {
      if (metaConfig.hasOwnProperty(vaultTokenData.address)) {
        return vaultTokenData.symbol;
      } else {
        return underlyingTokenData.symbol;
      }
    };

    const betaStatus = () => {
      if (metaConfig.hasOwnProperty(vaultTokenData.address)) {
        return metaConfig[vaultTokenData.address].beta;
      } else {
        return false;
      }
    };

    const rewardType = () => {
      if (metaConfig.hasOwnProperty(vaultTokenData.address)) {
        return metaConfig[vaultTokenData.address].rewardType;
      } else {
        return 'APY';
      }
    };

    const acceptWETH = () => {
      if (metaConfig.hasOwnProperty(vaultTokenData.address)) {
        return metaConfig[vaultTokenData.address].acceptWETH;
      } else {
        return true;
      }
    };

    const sharesBalance = () => {
      return vault.balance
        .mul(vault.underlyingPerShare)
        .div(BigNumber.from(10).pow(underlyingTokenData.decimals));
    };

    return {
      type: vault.balance.gt(BigNumber.from(0)) ? 'used' : 'unused',
      row: {
        col2: {
          CellComponent: FarmNameCell,
          farmName: vaultName(),
          farmSubtitle: underlyingTokenData.symbol + ' + ' + vaultTokenData.symbol,
          farmIcon: `${VaultTypes[vault.type].toLowerCase()}_med.svg`,
          tokenIcon: `${vaultIcon()}`.toLowerCase(),
          isBeta: betaStatus(),
          colSize: 3,
          alignment: 'justify-self-start',
        },
        deposited: {
          CellComponent: CurrencyCell,
          value: depositValue,
          token: {
            balance: sharesBalance(),
            perShare: vault.underlyingPerShare,
            decimals: underlyingTokenData.decimals,
            symbol: underlyingTokenData.symbol,
            address: underlyingTokenData.address,
          },
          colSize: 2,
        },
        col3: {
          CellComponent: CurrencyCell,
          value: tvlValue,
          token: {
            balance: vault.tvl,
            perShare: vault.underlyingPerShare,
            decimals: underlyingTokenData.decimals,
            symbol: underlyingTokenData.symbol,
            address: underlyingTokenData.address,
          },
          colSize: 2,
        },
        limit: {
          CellComponent: VaultCapacityCell,
          vaultType: vault.type,
          signer: $signer,
          yieldTokenAddress: vaultTokenData.address,
          underlyingPerShare: vault.underlyingPerShare,
          yieldPerShare: vault.yieldPerShare,
          decimals: underlyingTokenData.decimals,
          symbol: underlyingTokenData.symbol,
          colSize: 2,
          fullWidth: true,
        },

        col4: {
          CellComponent: YieldCell,
          yieldRate: vaultApy,
          yieldType: rewardType(),
          colSize: 2,
        },
        col5: {
          CellComponent: ActionsCell,
          colSize: 3,
          vault: { ...vault, acceptWETH: acceptWETH() },
          borrowLimit: vaultDebt,
        },
      },
    };
  });

  $: noVaultsForStrategyText = {
    [TypeOfStrategies.USED]: $_('table.no_strategies'),
    [TypeOfStrategies.UNUSED]: $_('table.all_strategies'),
    [TypeOfStrategies.ALL]: $_('table.no_strategies_avail'),
  };

  const openBorrowModal = () =>
    showModal(Borrow, {
      selectedVaults: $vaultsSelector,
    });

  const openRepayModal = () =>
    showModal(Repay, {
      selectedVaultsType: $vaultsSelector,
      outstandingDebt: $alusd.userDebt,
    });

  const openLiquidateModal = () =>
    showModal(Liquidate, {
      selectedVaultsType: $vaultsSelector,
      outstandingDebt: $alusd.userDebt,
      vaults: currentVaultsBasedOnStrategyType,
    });

  const closeModal = () => modalReset();
  const goToLegacy = () => {
    window.open('https://legacy.alchemix.fi/vault', '_blank');
  };
</script>

<ViewContainer>
  <div class="flex justify-between" slot="head">
    <PageHeader
      pageIcon="yield_thin.svg"
      pageTitle="{$_('vaults_page.title')}"
      pageSubtitle="{$_('vaults_page.subtitle')}"
    />
  </div>
  <div slot="message">
    <div class="flex flex-row space-x-4">
      <p class="self-center">{$_('vaults_page.legacy_redirect')}</p>
      <Button label="Go To Legacy UI" width="w-max" on:clicked="{() => goToLegacy()}" />
    </div>
  </div>
  {#if $vaultsLoading}
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 flex space-x-4">
        <p class="inline-block self-center">{$_('fetching_data')}</p>
      </div>
      <div slot="body">
        <div class="flex justify-center my-4">
          <BarLoader color="{$settings.invertColors ? '#6C93C7' : '#F5C59F'}" />
        </div>
      </div>
    </ContainerWithHeader>
  {:else}
    <div class="w-full mb-8 h-10 grid grid-cols-2 gap-8">
      <div class="col-span-1">
        <ContainerWithHeader>
          <div slot="body">
            <div class=" items-center flex space-x-2 h-10 px-2">
              {#if vaultTypes.length > 1}
                <Button
                  label="All Vaults"
                  width="w-max"
                  canToggle="{true}"
                  selected="{vaultsSelector.isSelectedAll($vaultsSelector, vaultTypes)}"
                  solid="{false}"
                  borderSize="0"
                  on:clicked="{() => vaultsSelector.select(vaultTypes)}"
                >
                  <p slot="leftSlot">
                    <img src="images/icons/alcx_med.svg" alt="all vaults" class="w-5 h-5" />
                  </p>
                </Button>
              {/if}
              {#each vaultTypes as vaultType}
                <Button
                  label="{VaultTypesInfos[vaultType].name}"
                  width="w-max"
                  canToggle="{true}"
                  selected="{vaultsSelector.isSelected($vaultsSelector, vaultType)}"
                  solid="{false}"
                  borderSize="0"
                  on:clicked="{() => vaultsSelector.select([vaultType])}"
                >
                  <p slot="leftSlot">
                    <img
                      src="{VaultTypesInfos[vaultType].icon}"
                      alt="{VaultTypesInfos[vaultType].name} vaults"
                      class="w-5 h-5"
                    />
                  </p>
                </Button>
              {/each}
            </div>
          </div>
        </ContainerWithHeader>
      </div>
      <div class="col-span-1 flex space-x-4">
        <Button
          borderColor="bronze3"
          textColor="{$settings.invertColors ? 'bronze4' : 'white2'}"
          label="{$_('vaults_page.borrow')}"
          width="w-full"
          on:clicked="{openBorrowModal}"
        >
          <img
            slot="leftSlot"
            src="images/icons/Icon_Borrow.svg"
            class="{$settings.invertColors ? 'text-bronze4' : 'text-white2'} fill-current h-5"
          />
        </Button>
        <Button
          borderColor="bronze3"
          textColor="{$settings.invertColors ? 'bronze4' : 'white2'}"
          label="{$_('vaults_page.repay')}"
          width="w-full"
          on:clicked="{openRepayModal}"
          ><img
            slot="leftSlot"
            src="images/icons/Icon_Repay.svg"
            class="{$settings.invertColors ? 'text-bronze4' : 'text-white2'} fill-current h-5"
          />
        </Button>
        <Button
          borderColor="bronze3"
          textColor="{$settings.invertColors ? 'bronze4' : 'white2'}"
          label="{$_('vaults_page.liquidate')}"
          width="w-full"
          on:clicked="{openLiquidateModal}"
          ><img
            slot="leftSlot"
            src="images/icons/Icon_Liquidate.svg"
            class="{$settings.invertColors ? 'text-bronze4' : 'text-white2'} fill-current h-5"
          />
        </Button>
      </div>
    </div>

    <div class="w-full mb-8">
      {#if showMetrics && aggregated.length > 0}
        <Metrics aggregate="{aggregated}" />
        <!--{:else}-->
        <!--  <ContainerWithHeader canToggle="{true}" isVisible="{Math.floor($aggregate.totalDeposit) > 0}">-->
        <!--    <p slot="header" class="inline-block self-center">{$_('chart.aggregate')}</p>-->
        <!--    <div slot="body" class="bg-grey15">-->
        <!--      <AccountsPageBarCharts-->
        <!--        totalDeposit="{$aggregate.totalDeposit.toFixed(2)}"-->
        <!--        totalDebtLimit="{($aggregate.totalDeposit / 2).toFixed(2)}"-->
        <!--        aggregatedApy="0"-->
        <!--        totalDebt="{$aggregate.totalDebt.toFixed(2)}"-->
        <!--        totalInterest="0"-->
        <!--      />-->
        <!--    </div>-->
        <!--  </ContainerWithHeader>-->
      {/if}
    </div>

    {#if $networkStore === '0x1'}
      <div class="w-full mb-8">
        <LegacyHelper />
      </div>
    {/if}

    <div class="w-full mb-8">
      <ContainerWithHeader>
        <div slot="header" class="py-4 px-6 flex space-x-4">
          <Button
            label="{$_('table.your_strategies_select')} ({countStrategiesForTypeOfStrategy(
              strategyFilterFunc[TypeOfStrategies.USED],
              currentVaultsBasedOnType,
            )})"
            width="w-max"
            canToggle="{true}"
            selected="{currentStrategy === TypeOfStrategies.USED}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => {
              currentStrategy = TypeOfStrategies.USED;
            }}"
          />

          <Button
            label="{$_('table.all_strategies_select')} ({countStrategiesForTypeOfStrategy(
              strategyFilterFunc[TypeOfStrategies.ALL],
              currentVaultsBasedOnType,
            )})"
            width="w-max"
            canToggle="{true}"
            selected="{currentStrategy === TypeOfStrategies.ALL}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => {
              currentStrategy = TypeOfStrategies.ALL;
            }}"
          />

          <Button
            label="{$_('table.unused_strategies_select')} ({countStrategiesForTypeOfStrategy(
              strategyFilterFunc[TypeOfStrategies.UNUSED],
              currentVaultsBasedOnType,
            )})"
            width="w-max"
            canToggle="{true}"
            selected="{currentStrategy === TypeOfStrategies.UNUSED}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => {
              currentStrategy = TypeOfStrategies.UNUSED;
            }}"
          />
        </div>
        <div slot="body">
          {#if currentRowsOnCurrentStrategyType.length > 0}
            <div class="flex flex-col space-y-4 px-4 py-4">
              {#each currentRowsOnCurrentStrategyType.map((obj) => obj.row) as strategy}
                <VaultStrategy strategy="{strategy}" />
              {/each}
            </div>
          {:else}
            <div class="flex justify-center my-4">
              <p>{noVaultsForStrategyText[currentStrategy]}</p>
            </div>
          {/if}
        </div>
      </ContainerWithHeader>
    </div>
  {/if}
</ViewContainer>
