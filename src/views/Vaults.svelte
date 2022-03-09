<script>
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import ViewContainer from '../components/elements/ViewContainer.svelte';
  import PageHeader from '../components/elements/PageHeader.svelte';
  import ContainerWithHeader from '../components/elements/ContainerWithHeader.svelte';
  import Button from '../components/elements/Button.svelte';
  import AccountsPageBarCharts from '../components/composed/AccountsPageBarCharts.svelte';
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
  import global from '@stores/global';

  import { balancesStore, vaultsStore } from '@stores/v2/alcxStore';
  import { VaultTypes } from 'src/stores/v2/types';
  import { AllowedVaultTypes, VaultTypesInfos } from 'src/stores/v2/constants';
  import makeSelectorStore from 'src/stores/v2/selectorStore';
  import { calculateVaultDebt, getTokenDataFromBalances } from 'src/stores/v2/helpers';
  import { vaultsLoading } from 'src/stores/v2/loadingStores';

  const vaultsSelector = makeSelectorStore([VaultTypes.alUSD, VaultTypes.alETH]);

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
      columnId: 'limit',
      CellComponent: HeaderCell,
      value: $_('table.debt_limit'),
      colSize: 2,
    },
    {
      columnId: 'col3',
      CellComponent: HeaderCell,
      value: $_('table.tvl'),
      colSize: 2,
    },
    {
      columnId: 'col4',
      CellComponent: HeaderCell,
      value: $_('table.apy'),
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

  $: currentVaultsBasedOnStrategyType =
    currentVaultsBasedOnType.filter(strategyFilterFunc[currentStrategy]) ?? [];

  $: currentRowsOnCurrentStrategyType = currentVaultsBasedOnStrategyType.map((vault, index) => {
    const vaultTokenData = getTokenDataFromBalances(vault.address, [$balancesStore]);
    const debtTokenData = getTokenDataFromBalances(vault.debtToken, [$balancesStore]);
    const underlyingTokenData = getTokenDataFromBalances(vault.underlyingAddress, [$balancesStore]);
    const tokenPrice = $global.tokenPrices.find(
      (token) => token.address.toLowerCase() === underlyingTokenData.address.toLowerCase(),
    )?.price;
    const depositValue = calculateBalanceValue(
      vault.balance,
      vault.underlyingPerShare,
      underlyingTokenData.decimals,
      tokenPrice,
    );
    const debtValue = depositValue / parseFloat(utils.formatEther($vaultsStore[vault.type].ratio));
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

    const vaultApy = Math.round(vault.apy * 10000) / 100;
    const vaultDebtDisplay = vaultDebt.div(BigNumber.from(10).pow(16));

    return {
      type: vault.balance.gt(BigNumber.from(0)) ? 'used' : 'unused',
      row: {
        col2: {
          CellComponent: FarmNameCell,
          farmName: 'Yearn ' + underlyingTokenData.symbol,
          farmSubtitle: underlyingTokenData.symbol + ' + ' + vaultTokenData.symbol,
          farmIcon: `${VaultTypes[vault.type].toLowerCase()}_med.svg`,
          tokenIcon: `${underlyingTokenData.symbol}`.toLowerCase(),
          colSize: 3,
          alignment: 'justify-self-start',
        },
        deposited: {
          CellComponent: CurrencyCell,
          value: depositValue,
          token: {
            balance: vault.balance,
            perShare: vault.underlyingPerShare,
            decimals: underlyingTokenData.decimals,
            symbol: underlyingTokenData.symbol,
          },
          colSize: 2,
        },
        limit: {
          CellComponent: CurrencyCell,
          value: debtValue,
          token: {
            balance: vaultDebtDisplay,
            perShare: 1,
            decimals: 1,
            symbol: debtTokenData.symbol || '',
          },
          prefix: '+',
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
          },
          colSize: 2,
        },
        col4: {
          value: vaultApy + '%',
          colSize: 2,
        },
        col5: {
          CellComponent: ActionsCell,
          colSize: 3,
          vault: vault,
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
</script>

<ViewContainer>
  <div class="flex justify-between" slot="head">
    <PageHeader
      pageIcon="yield_thin.svg"
      pageTitle="{$_('vaults_page.title')}"
      pageSubtitle="{$_('vaults_page.subtitle')}"
    />
  </div>
  {#if $vaultsLoading}
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 flex space-x-4">
        <p class="inline-block self-center">{$_('fetching_data')}</p>
      </div>
      <div slot="body">
        <div class="flex justify-center my-4">
          <BarLoader color="#F5C59F" />
        </div>
      </div>
    </ContainerWithHeader>
  {:else}
    <div class="w-full mb-8 grid grid-cols-2 gap-8">
      <div class="col-span-1">
        <ContainerWithHeader>
          <div slot="body">
            <div class=" items-center flex gap-1">
              {#if AllowedVaultTypes.length > 1}
                <Button
                  label="All Vaults"
                  width="w-max"
                  canToggle="{true}"
                  selected="{vaultsSelector.isSelectedAll($vaultsSelector, AllowedVaultTypes)}"
                  solid="{false}"
                  borderSize="0"
                  on:clicked="{() => vaultsSelector.select(AllowedVaultTypes)}"
                >
                  <p slot="leftSlot">
                    <img src="images/icons/alcx_med.svg" alt="all vaults" class="w-5 h-5" />
                  </p>
                </Button>
              {/if}
              {#each AllowedVaultTypes as vaultType}
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
        <Button label="{$_('vaults_page.borrow')}" width="w-full" on:clicked="{openBorrowModal}" />
        <Button label="{$_('vaults_page.repay')}" width="w-full" on:clicked="{openRepayModal}" />
        <Button label="{$_('vaults_page.liquidate')}" width="w-full" on:clicked="{openLiquidateModal}" />
      </div>
    </div>

    <div class="w-full mb-8">
      {#if showMetrics}
        <ContainerWithHeader>
          <div slot="header" class="py-4 px-6">
            <Metrics vaults="{currentVaultsBasedOnType}" />
          </div>
        </ContainerWithHeader>
      {:else}
        <ContainerWithHeader canToggle="{true}" isVisible="{Math.floor($aggregate.totalDeposit) > 0}">
          <p slot="header" class="inline-block self-center">{$_('chart.aggregate')}</p>
          <div slot="body" class="bg-grey15">
            <AccountsPageBarCharts
              totalDeposit="{$aggregate.totalDeposit.toFixed(2)}"
              totalDebtLimit="{($aggregate.totalDeposit / 2).toFixed(2)}"
              aggregatedApy="0"
              totalDebt="{$aggregate.totalDebt.toFixed(2)}"
              totalInterest="0"
            />
          </div>
        </ContainerWithHeader>
      {/if}
    </div>

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
            <Table
              rows="{[...currentRowsOnCurrentStrategyType.map((obj) => obj.row)]}"
              columns="{colsStrats}"
            />
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
