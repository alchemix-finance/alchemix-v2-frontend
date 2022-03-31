<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { BigNumber, utils } from 'ethers';
  import ViewContainer from '@components/elements/ViewContainer.svelte';
  import PageHeader from '@components/elements/PageHeader.svelte';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';
  import AccountsPageBarCharts from '@components/composed/AccountsPageBarCharts.svelte';
  import { BarLoader } from 'svelte-loading-spinners';
  import Table from '@components/composed/Table/Table.svelte';
  import HeaderCell from '@components/composed/Table/HeaderCell.svelte';
  import BorderContainer from '@components/elements/BorderContainer.svelte';
  import Button from '@components/elements/Button.svelte';
  import { routerGuard } from '@helpers/routerGuard';
  import { VaultTypes } from '@stores/v2/types';
  import makeSelectorStore from '@stores/v2/selectorStore';
  import { balancesStore, vaultsStore } from '@stores/v2/alcxStore';
  import { calculateVaultDebt, getTokenDataFromBalances } from '@stores/v2/helpers';
  import global from '@stores/global';
  import settings from '@stores/settings';
  import FarmNameCell from '@components/composed/Table/farms/FarmNameCell.svelte';
  import CurrencyCell from '@components/composed/Table/CurrencyCell.svelte';
  import { vaultsLoading } from '@stores/v2/loadingStores';
  import YieldCell from '@components/composed/Table/YieldCell.svelte';
  import LegacyHelper from '@components/composed/LegacyHelper.svelte';
  import { VaultTypesInfos } from '@stores/v2/constants';

  let loading = true;

  let rowsUser = [];
  let colsUser = [
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
      columnId: 'col4',
      CellComponent: HeaderCell,
      value: $_('table.yield'),
      colSize: 2,
    },
  ];

  const vaultsSelector = makeSelectorStore([VaultTypes.alUSD, VaultTypes.alETH]);

  const TypeOfStrategies = Object.freeze({
    USED: 0,
    UNUSED: 1,
    ALL: 2,
  });

  const strategyFilter = {
    [TypeOfStrategies.USED]: (_vault) => _vault.balance.gt(BigNumber.from(0)),
    [TypeOfStrategies.UNUSED]: (_vault) => _vault.balance.lte(BigNumber.from(0)),
    [TypeOfStrategies.ALL]: (_vault) => true,
  };

  const strategy = TypeOfStrategies.ALL;

  function calculateBalanceValue(_tokenAmount, _perShare, _decimals, _price) {
    return (
      parseFloat(
        utils.formatUnits(_tokenAmount.mul(_perShare).div(BigNumber.from(10).pow(_decimals)), _decimals),
      ) * _price
    );
  }

  // let hasStrategies = false;

  $: hasStrategies = currentVaultsBasedOnStrategyType.some((vault) => vault.balance.gt(BigNumber.from(0)));

  $: currentVaultsBasedOnType =
    Object.keys($vaultsStore)
      .map((vTypeId) => {
        if ($vaultsSelector.includes(parseInt(vTypeId))) {
          return $vaultsStore[parseInt(vTypeId)].vaultBody;
        }
      })
      .filter((elm) => elm !== undefined)
      .reduce((accumulator, value) => accumulator.concat(value), []) ?? [];

  $: currentVaultsBasedOnStrategyType = currentVaultsBasedOnType.filter(strategyFilter[strategy]) ?? [];

  $: currentRowsOnCurrentStrategyType = currentVaultsBasedOnStrategyType.map((vault) => {
    const vaultTokenData = getTokenDataFromBalances(vault.address, [$balancesStore]);
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
            balance: vault.balance,
            perShare: acceptWETH() ? vault.underlyingPerShare : vault.yieldPerShare,
            decimals: acceptWETH() ? underlyingTokenData.decimals : vaultTokenData.decimals,
            symbol: acceptWETH() ? underlyingTokenData.symbol : vaultTokenData.symbol,
          },
          colSize: 2,
        },
        col3: {
          CellComponent: CurrencyCell,
          value: tvlValue,
          token: {
            balance: vault.tvl,
            perShare: acceptWETH() ? vault.underlyingPerShare : vault.yieldPerShare,
            decimals: acceptWETH() ? underlyingTokenData.decimals : vaultTokenData.decimals,
            symbol: acceptWETH() ? underlyingTokenData.symbol : vaultTokenData.symbol,
          },
          colSize: 2,
        },
        col4: {
          CellComponent: YieldCell,
          yieldRate: vaultApy,
          yieldType: rewardType(),
          colSize: 2,
        },
      },
    };
  });
</script>

<ViewContainer>
  <div slot="head" class="flex justify-between">
    <PageHeader
      pageIcon="vault_thin.svg"
      pageTitle="{$_('accounts_page.title')}"
      pageSubtitle="{$_('accounts_page.subtitle')}"
    />
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
    <div class="w-full mb-8">
      <LegacyHelper />
    </div>

    <div class="w-full mb-8">
      <ContainerWithHeader canToggle="{true}" isVisible="{hasStrategies}" disableButton="{!hasStrategies}">
        <p slot="header" class="inline-block self-center">{$_('chart.aggregate')}</p>
        <div slot="body" class="px-4 pb-4 {$settings.invertColors ? 'bg-grey15inverse' : 'bg-grey15'}">
          <AccountsPageBarCharts vaults="{currentVaultsBasedOnStrategyType}" />
        </div>
      </ContainerWithHeader>
    </div>

    <div class="w-full mb-8 ">
      <ContainerWithHeader>
        <div slot="header" class="py-4 px-6 text-sm">{$_('vaults_page.title')}</div>
        <div slot="body">
          {#if currentRowsOnCurrentStrategyType.filter((rows) => rows.type === 'used').length > 0}
            <Table
              rows="{[
                ...currentRowsOnCurrentStrategyType
                  .filter((rows) => rows.type === 'used')
                  .map((obj) => obj.row),
              ]}"
              columns="{colsUser}"
            />
          {:else}
            <div class="flex flex-col my-4">
              <p class="text-center w-full mt-8">{$_('table.no_strategies')}</p>
              <div class="flex justify-center mt-8 mb-4">
                <BorderContainer width="w-80">
                  <Button
                    label="{$_('accounts_page.select_strategies')}"
                    fontSize="text-md"
                    borderSize="1"
                    on:clicked="{() => routerGuard('vaults')}"
                  >
                    <img
                      src="images/token-icons/ALCX.png"
                      slot="leftSlot"
                      class="w-6 h-6"
                      alt="The Alchemix Logo"
                    />
                    <svg
                      slot="rightSlot"
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </Button>
                </BorderContainer>
              </div>
            </div>
          {/if}
        </div>
      </ContainerWithHeader>
    </div>
  {/if}
</ViewContainer>
