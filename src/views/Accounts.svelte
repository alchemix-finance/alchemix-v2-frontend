<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import ViewContainer from '@components/elements/ViewContainer.svelte';
  import PageHeader from '@components/elements/PageHeader.svelte';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';
  import Metrics from '@components/composed/Metrics.svelte';
  import AccountsPageBarCharts from '@components/composed/AccountsPageBarCharts.svelte';
  import { aggregate, alusd } from '@stores/vaults';
  import { BarLoader } from 'svelte-loading-spinners';
  import Table from '@components/composed/Table/Table.svelte';
  import HeaderCell from '@components/composed/Table/HeaderCell.svelte';
  import FarmNameCell from '@components/composed/Table/farms/FarmNameCell.svelte';
  import CurrencyCell from '@components/composed/Table/CurrencyCell.svelte';
  import BorderContainer from '@components/elements/BorderContainer.svelte';
  import Button from '@components/elements/Button.svelte';
  import { routerGuard } from '@helpers/routerGuard';

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
      value: $_('table.apy'),
      colSize: 2,
    },
  ];

  let hasStrategies = false;

  const renderAccounts = async () => {
    // alUSD Alchemist only atm
    for (const token of $alusd.yieldTokens) {
      const index = $alusd.rows.findIndex((row) => row.token === token);
      if ($alusd.rows[index].stratIsUsed) {
        const payload = {
          alchemist: 'alusd',
          row: {
            col2: {
              CellComponent: FarmNameCell,
              farmName: $alusd.rows[index].yieldSymbol,
              farmSubtitle: 'Yearn ' + $alusd.rows[index].underlyingSymbol,
              farmIcon: 'alusd_med.svg',
              tokenIcon: $alusd.rows[index].underlyingSymbol.toLowerCase(),
              colSize: 3,
              alignment: 'justify-self-start',
            },
            deposited: {
              CellComponent: CurrencyCell,
              value: utils.formatUnits(
                $alusd.rows[index].balance
                  .mul($alusd.rows[index].underlyingPerShare)
                  .div(BigNumber.from(10).pow($alusd.rows[index].underlyingDecimals)),
                $alusd.rows[index].underlyingDecimals,
              ),
              colSize: 2,
            },
            col3: {
              CellComponent: CurrencyCell,
              value: utils.formatUnits(
                utils.parseUnits($alusd.rows[index].tvl, $alusd.rows[index].underlyingDecimals).toString(),
                $alusd.rows[index].underlyingDecimals,
              ),
              colSize: 2,
            },
            col4: {
              value: 'N/A',
              colSize: 2,
            },
          },
        };
        rowsUser.push(payload.row);
      }
    }
    loading = false;
    hasStrategies = rowsUser.length > 0;
  };

  $: if (!$alusd.loadingRowData && loading) {
    renderAccounts();
  }
</script>

<ViewContainer>
  <div slot="head" class="flex justify-between">
    <PageHeader
      pageIcon="vault_thin.svg"
      pageTitle="{$_('accounts_page.title')}"
      pageSubtitle="{$_('accounts_page.subtitle')}"
    />
  </div>
  {#if loading}
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
    <!--    <div class="w-full mb-8">-->
    <!--      <ContainerWithHeader>-->
    <!--        <div slot="header" class="py-4 px-6">-->
    <!--          <Metrics />-->
    <!--        </div>-->
    <!--      </ContainerWithHeader>-->
    <!--    </div>-->

    <div class="w-full mb-8">
      <ContainerWithHeader canToggle="{true}" isVisible="{hasStrategies}">
        <p slot="header" class="inline-block self-center">{$_('chart.aggregate')}</p>
        <div slot="body" class="px-4 pb-4 bg-grey15">
          <AccountsPageBarCharts
            totalDeposit="{$aggregate.balance}"
            totalDebtLimit="{$aggregate.debtLimit}"
            aggregatedApy="0"
            totalDebt="{utils.parseUnits($aggregate.totalDebt.toString(), 18)}"
            totalInterest="0"
            totalWithdrawable="{$aggregate.withdrawable}"
          />
        </div>
      </ContainerWithHeader>
    </div>

    <div class="w-full mb-8">
      <ContainerWithHeader>
        <div slot="header" class="py-4 px-6 text-sm">{$_('vaults_page.title')}</div>
        <div slot="body">
          {#if rowsUser.length > 0}
            <Table rows="{rowsUser}" columns="{colsUser}" />
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
