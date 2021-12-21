<script>
import { onMount } from 'svelte';
import { _ } from 'svelte-i18n';
import { utils } from 'ethers';
import ViewContainer from '../components/elements/ViewContainer.svelte';
import PageHeader from '../components/elements/PageHeader.svelte';
import ContainerWithHeader from '../components/elements/ContainerWithHeader.svelte';
import Button from '../components/elements/Button.svelte';
import AccountsPageBarCharts from '../components/composed/AccountsPageBarCharts.svelte';
import { BarLoader } from 'svelte-loading-spinners';
import account from '../stores/account';
import vaults from '../stores/vaults';
import { aggregate } from '../stores/vaults';
import getContract from '../helpers/getContract';
import { getTokenSymbol } from '../helpers/getTokenData';
import HeaderCell from '../components/composed/Table/HeaderCell.svelte';
import Table from '../components/composed/Table/Table.svelte';
import FarmNameCell from '../components/composed/Table/farms/FarmNameCell.svelte';
import ExpandRowCell from '../components/composed/Table/ExpandRowCell.svelte';
import ExpandedVault from '../components/composed/Table/vaults/ExpandedVault.svelte';

let counterAllStrategies = 0;
let counterUserStrategies = 0;
let counterUnusedStrategies = 0;

let rowsAll = [];
let rowsUser = [];
let rowsUnused = [];
let colsStrats = [
  {
    columnId: 'col1',
    CellComponent: HeaderCell,
    value: '',
    colSize: 1,
  },
  {
    columnId: 'col2',
    CellComponent: HeaderCell,
    value: 'Strategy',
    colSize: 3,
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
  {
    columnId: 'col5',
    CellComponent: HeaderCell,
    value: 'Actions',
    colSize: 3,
  },
];

const toggleButtons = {
  vaultSelect: {
    all: true,
    aleth: false,
    alusd: false,
  },
  modeSelect: {
    deposit: true,
    borrow: false,
    repay: false,
    liquidate: false,
  },
  stratSelect: {
    used: false,
    all: true,
    unused: false,
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
  const selector = ['vaultSelect', 'modeSelect', 'stratSelect'];
  buttonToggler(selector[filter.id], filter.filter);
};

onMount(async () => {
  let deposited = [];
  if ($vaults.fetching) {
    // alUSD Alchemist only atm
    const contract = await getContract('AlchemistV2');
    const yieldTokens = await contract.getSupportedYieldTokens();
    for (const token of yieldTokens) {
      const params = await contract.getYieldTokenParameters(token);
      const yieldSymbol = await getTokenSymbol(token);
      const underlyingSymbol = await getTokenSymbol(params.underlyingToken);
      const tvl = utils.formatEther(params.balance.toString());
      const position = await contract.positions($account.address, token);
      const fake = Math.floor(Math.random() * 100000);
      const depositPayload = {
        token: token,
        symbol: yieldSymbol,
        balance: utils.formatEther(position.balance.toString()),
        //balance: fake,
      };
      deposited.push(depositPayload);
      const stratIsUsed = utils.formatEther(position.balance.toString()) !== '0.0';
      const expandedProps = {
        type: stratIsUsed ? 'used' : 'unused',
        depositAmount: 0,
        depositAsset: yieldSymbol,
        creditLimit: 0,
        borrowAmount: 0,
        borrowAsset: 'alUSD',
      };
      let payload = {
        type: stratIsUsed ? 'used' : 'unused',
        alchemist: 'alusd',
        row: {
          col1: {
            CellComponent: ExpandRowCell,
            expandedRow: {
              ExpandedRowComponent: ExpandedVault,
            },
            ...expandedProps,
            colSize: 1,
          },
          col2: {
            CellComponent: FarmNameCell,
            farmName: yieldSymbol,
            farmSubtitle: 'Yearn ' + underlyingSymbol,
            farmIcon: 'alusd_med.svg',
            tokenIcon: underlyingSymbol.toLowerCase(),
            colSize: 3,
            alignment: 'justify-self-start',
          },
          col3: {
            value: tvl + ' ' + yieldSymbol,
            colSize: 2,
          },
          col4: {
            value: 'N/A',
            colSize: 2,
          },
          col5: {
            value: 'foo',
            colSize: 3,
          },
        },
      };
      $vaults.alusd.push(payload);
    }
    deposited.forEach((deposit) => {
      $aggregate.totalDeposit += deposit.balance;
    });
    $aggregate.deposited = deposited;
    $vaults.fetching = false;
  }
});

$: if ($vaults.alusd.length > 0) {
  $vaults.alusd.forEach((vault) => {
    if (vault.type === 'used') {
      rowsUser.push(vault.row);
      counterUserStrategies += 1;
    } else {
      rowsUnused.push(vault.row);
      counterUnusedStrategies += 1;
    }
    rowsAll.push(vault.row);
    counterAllStrategies += 1;
  });
}
</script>

<ViewContainer>
  <div class="flex justify-between" slot="head">
    <PageHeader
      pageIcon="yield_thin.svg"
      pageTitle="{$_('vaults_page.title')}"
      pageSubtitle="{$_('vaults_page.subtitle')}"
    />
  </div>

  {#if $vaults.fetching}
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
    <div class="w-full mb-8 grid grid-cols-3 gap-8">
      <div class="col-span-1">
        <ContainerWithHeader>
          <div slot="body">
            <Button
              label="All Vaults"
              width="w-max"
              canToggle="{true}"
              selected="{toggleButtons.vaultSelect.all}"
              solid="{false}"
              borderSize="0"
              on:clicked="{() => vaultFilter({ id: 0, filter: 'all' })}"
            >
              <p slot="leftSlot">
                <img src="images/icons/alcx_med.svg" alt="all vaults" class="w-5 h-5" />
              </p>
            </Button>
            <Button
              label="alETH"
              width="w-max"
              canToggle="{true}"
              selected="{toggleButtons.vaultSelect.aleth}"
              solid="{false}"
              borderSize="0"
              on:clicked="{() => vaultFilter({ id: 0, filter: 'aleth' })}"
            >
              <p slot="leftSlot">
                <img src="images/icons/aleth_med.svg" alt="aleth vaults" class="w-5 h-5" />
              </p>
            </Button>
            <Button
              label="alUSD"
              width="w-max"
              canToggle="{true}"
              selected="{toggleButtons.vaultSelect.alusd}"
              solid="{false}"
              borderSize="0"
              on:clicked="{() => vaultFilter({ id: 0, filter: 'alusd' })}"
            >
              <p slot="leftSlot">
                <img src="images/icons/alusd_med.svg" alt="alusd vaults" class="w-5 h-5" />
              </p>
            </Button>
          </div>
        </ContainerWithHeader>
      </div>
      <div class="col-span-2">
        <ContainerWithHeader>
          <div slot="body" class="flex space-x-4">
            <Button
              label="Deposit & Withdraw"
              width="w-full"
              py="py-2"
              canToggle="{true}"
              selected="{toggleButtons.modeSelect.deposit}"
              solid="{false}"
              borderSize="0"
              on:clicked="{() => vaultFilter({ id: 1, filter: 'deposit' })}"
            />
            <Button
              label="Borrow"
              width="w-full"
              canToggle="{true}"
              selected="{toggleButtons.modeSelect.borrow}"
              solid="{false}"
              borderSize="0"
              on:clicked="{() => vaultFilter({ id: 1, filter: 'borrow' })}"
            />
            <Button
              label="Repay"
              width="w-full"
              canToggle="{true}"
              selected="{toggleButtons.modeSelect.repay}"
              solid="{false}"
              borderSize="0"
              on:clicked="{() => vaultFilter({ id: 1, filter: 'repay' })}"
            />
            <Button
              label="Liquidate"
              width="w-full"
              canToggle="{true}"
              selected="{toggleButtons.modeSelect.liquidate}"
              solid="{false}"
              borderSize="0"
              on:clicked="{() => vaultFilter({ id: 1, filter: 'liquidate' })}"
            />
          </div>
        </ContainerWithHeader>
      </div>
    </div>

    <div class="w-full mb-8">
      <ContainerWithHeader canToggle="{true}" isVisible="{$aggregate.totalDeposit > 0}">
        <p slot="header" class="inline-block self-center">Aggregate</p>
        <div slot="body" class="bg-grey15">
          <AccountsPageBarCharts
            totalDeposit="{$aggregate.totalDeposit}"
            totalDebtLimit="{Math.floor($aggregate.totalDeposit / 2)}"
            aggregatedApy="0"
            totalDebt="{Math.floor($aggregate.totalDeposit / 4)}"
            totalInterest="0"
          />
        </div>
      </ContainerWithHeader>
    </div>

    <div class="w-full mb-8">
      <ContainerWithHeader>
        <div slot="header" class="py-4 px-6 flex space-x-4">
          <Button
            label="Your Strategies ({counterUserStrategies})"
            width="w-max"
            canToggle="{true}"
            selected="{toggleButtons.stratSelect.used}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => vaultFilter({ id: 2, filter: 'used' })}"
          />

          <Button
            label="All Strategies ({counterAllStrategies})"
            width="w-max"
            canToggle="{true}"
            selected="{toggleButtons.stratSelect.all}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => vaultFilter({ id: 2, filter: 'all' })}"
          />

          <Button
            label="Unused Strategies ({counterUnusedStrategies})"
            width="w-max"
            canToggle="{true}"
            selected="{toggleButtons.stratSelect.unused}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => vaultFilter({ id: 2, filter: 'unused' })}"
          />
        </div>
        <div slot="body">
          {#if toggleButtons.stratSelect.used}
            {#if rowsUser.length > 0}
              <Table rows="{rowsUser}" columns="{colsStrats}" />
            {:else}
              <div class="flex justify-center my-4">
                <p>You don't have any active strategies.</p>
              </div>
            {/if}
          {:else if toggleButtons.stratSelect.all}
            <Table rows="{rowsAll}" columns="{colsStrats}" />
          {:else if toggleButtons.stratSelect.unused}
            {#if rowsUnused.length > 0}
              <Table rows="{rowsUnused}" columns="{colsStrats}" />
            {:else}
              <div class="flex justify-center my-4">
                <p>You are using all available strategies.</p>
              </div>
            {/if}
          {/if}
        </div>
      </ContainerWithHeader>
    </div>
  {/if}
</ViewContainer>
