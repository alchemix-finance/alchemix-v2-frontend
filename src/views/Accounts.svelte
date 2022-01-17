<script>
import { _ } from 'svelte-i18n';
import { utils } from 'ethers';
import ViewContainer from '../components/elements/ViewContainer.svelte';
import PageHeader from '../components/elements/PageHeader.svelte';
import ContainerWithHeader from '../components/elements/ContainerWithHeader.svelte';
import Metrics from '../components/composed/Metrics.svelte';
import AccountsPageBarCharts from '../components/composed/AccountsPageBarCharts.svelte';
import { aggregate, alusd } from '../stores/vaults';
import { BarLoader } from 'svelte-loading-spinners';
import Table from '../components/composed/Table/Table.svelte';
import HeaderCell from '../components/composed/Table/HeaderCell.svelte';
import FarmNameCell from '../components/composed/Table/farms/FarmNameCell.svelte';
import CurrencyCell from '../components/composed/Table/CurrencyCell.svelte';

let loading = true;

let rowsUser = [];
let colsUser = [
  {
    columnId: 'col2',
    CellComponent: HeaderCell,
    value: 'Strategy',
    colSize: 3,
  },
  {
    columnId: 'deposit',
    CellComponent: HeaderCell,
    value: 'Deposited',
    colSize: 2,
  },
  {
    columnId: 'col3',
    CellComponent: HeaderCell,
    value: 'TVL',
    colSize: 2,
  },
  {
    columnId: 'col4',
    CellComponent: HeaderCell,
    value: 'APY',
    colSize: 2,
  },
];

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
            value:
              ($alusd.rows[index].balance * $alusd.rows[index].underlyingPerShare) /
              10 ** $alusd.rows[index].underlyingDecimals,
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
};

$: if (!$alusd.loadingRowData && loading) {
  renderAccounts();
}
</script>

<ViewContainer>
  <div slot="head" class="flex justify-between">
    <PageHeader pageIcon="vault_thin.svg" pageTitle="My Accounts" pageSubtitle="Your personal dashboard" />
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
      <ContainerWithHeader canToggle="{true}">
        <p slot="header" class="inline-block self-center">Aggregate</p>
        <div slot="body" class="px-4 pb-4 bg-grey15">
          <AccountsPageBarCharts
            totalDeposit="{$aggregate.totalDeposit.toFixed(2)}"
            totalDebtLimit="{($aggregate.totalDeposit / 2).toFixed(2)}"
            aggregatedApy="0"
            totalDebt="{$aggregate.totalDebt.toFixed(2)}"
            totalInterest="0"
          />
        </div>
      </ContainerWithHeader>
    </div>

    <div class="w-full mb-8">
      <ContainerWithHeader>
        <div slot="header" class="py-4 px-6 text-sm">Vaults</div>
        <div slot="body">
          {#if rowsUser.length > 0}
            <Table rows="{rowsUser}" columns="{colsUser}" />
          {:else}
            <p class="text-center">You have no active strategies at the moment.</p>
          {/if}
        </div>
      </ContainerWithHeader>
    </div>
  {/if}
</ViewContainer>
