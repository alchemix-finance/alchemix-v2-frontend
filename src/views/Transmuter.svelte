<script>
import { _ } from 'svelte-i18n';
import ViewContainer from '../components/elements/ViewContainer.svelte';
import PageHeader from '../components/elements/PageHeader.svelte';
import ContainerWithHeader from '../components/elements/ContainerWithHeader.svelte';
import Button from '../components/elements/Button.svelte';
import Table from '../components/composed/Table/Table.svelte';
import HeaderCell from '../components/composed/Table/HeaderCell.svelte';
import ExpandRowCell from '../components/composed/Table/ExpandRowCell.svelte';
import ExpandedTransmuter from '../components/composed/Table/transmuter/ExpandedTransmuter.svelte';
import getContract from '../helpers/getContract';
import { getProvider } from '../helpers/walletManager';
import { getTokenSymbol, getTokenAllowance } from '../helpers/getTokenSymbol';
import getUserGas from '../helpers/getUserGas';
import { genericAbi } from '../stores/externalContracts';
import transmuters from '../stores/transmuters';
import account from '../stores/account';
import walletBalance from '../stores/walletBalance';
import { BigNumber, ethers } from 'ethers';
import { onMount } from 'svelte';
import { BarLoader } from 'svelte-loading-spinners';

const toggleButtons = {
  transmuterSelect: {
    all: true,
    aleth: false,
    alusd: false,
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
  const selector = ['transmuterSelect', 'modeSelect', 'stratSelect'];
  buttonToggler(selector[filter.id], filter.filter);
};
const userGas = getUserGas();
console.log('USER GAS', userGas);
const columns = [
  {
    columnId: 'col1',
    CellComponent: HeaderCell,
    value: '',
    colSize: 1,
  },
  {
    columnId: 'col2',
    CellComponent: HeaderCell,
    value: 'Transmuter',
    colSize: 2,
  },
  {
    columnId: 'col3',
    CellComponent: HeaderCell,
    value: 'Deposited',
    colSize: 2,
  },
  {
    columnId: 'col4',
    CellComponent: HeaderCell,
    value: 'Withdrawable',
    colSize: 2,
  },
  {
    columnId: 'col6',
    CellComponent: HeaderCell,
    value: 'Claimable',
    colSize: 2,
  },
  {
    columnId: 'col5',
    CellComponent: HeaderCell,
    //Don't like this but better than APY for now.
    //I think this needs a tool tip
    value: 'Maturation Rate',
    colSize: 2,
  },
];

let rows = [];

// the core transmuter contracts
const transmuterContracts = [getContract('TransmuterV2_DAI')];

// the alUSD contract
const alUSD = getContract('AlToken');

const format = ethers.utils.formatUnits;

const goTo = (url) => {
  window.open(url, '_blank');
};

onMount(async () => {
  console.log($transmuters.fetching);
  if ($account.address && $transmuters.fetching) {
    for (const contract of transmuterContracts) {
      const getAlToken = await contract.syntheticToken();
      const alToken = getAlToken.toLowerCase();
      const alTokenContract = new ethers.Contract(alToken, genericAbi, $account.signer);
      const alTokenAllowance = await alTokenContract.allowance($account.address, alToken);
      const alTokenSymbol = await getTokenSymbol(getAlToken)
      console.log("alusd symbol", alTokenSymbol)
      const getUnderlyingToken = await contract.underlyingToken();
      const underlyingTokenSymbol = await getTokenSymbol(getUnderlyingToken);
      const getBuffered = await contract.totalBuffered();
      const buffered = format(getBuffered.toString(), 'ether');
      const getTotalUnexchanged = await contract.totalUnexchanged();
      const totalUnexchanged = format(getTotalUnexchanged.toString(), 'ether');
      const getExchangedBalance = await contract.getExchangedBalance($account.address);
      const exchangedBalance = format(getExchangedBalance.toString(), 'ether');
      const getUnexchangedBalance = await contract.getUnexchangedBalance($account.address);
      const unexchangedBalance = format(getUnexchangedBalance.toString(), 'ether');
      console.log($walletBalance)
      const userAlToken =  $walletBalance.tokens.find((userToken) => userToken.symbol === alTokenSymbol);
      const userUnderlyingToken =   $walletBalance.tokens.find(
        (userToken) => userToken.address === getUnderlyingToken,
      );
      console.log("useraltoken", $walletBalance, userAlToken)
      const exchangedBN = ethers.BigNumber.from(getExchangedBalance);
      const unexchangedBN = ethers.BigNumber.from(getUnexchangedBalance);
      const totalDeposited = exchangedBN.add(unexchangedBN);

      console.log('scoopy dai balance', userUnderlyingToken);
      console.log('scoopy - transmuter.svelte - mybal', exchangedBalance, unexchangedBalance);
      const expandedProps = {

        transmuterContract: contract,
        alTokenContract: alUSD,
        allowance: alTokenAllowance,
        exchangedBalance: exchangedBalance,
        unexchangedBalance: unexchangedBalance,
        alTokenSymbol: alTokenSymbol,
        underlyingTokenSymbol: underlyingTokenSymbol,
      };

      const payload = {
        col1: {
          CellComponent: ExpandRowCell,
          expandedRow: {
            ExpandedRowComponent: ExpandedTransmuter,
          },
          ...expandedProps,
          colSize: 1,
        },
        col2: {
          value: alTokenSymbol + "-" + underlyingTokenSymbol,
          colSize: 2,
          alignment: 'justify-self-start',
        },
        col3: {
          value: totalDeposited,
          colSize: 2,
        },
        col4: {
          value: unexchangedBalance,
          colSize: 2,
        },
        col6: {
          value: exchangedBalance,
          colSize: 2,
        },
        col5: {
          value: '455%',
          colSize: 2,
        },
      };

      $transmuters.state.push(payload);

      $transmuters.fetching = false;
      console.log($transmuters.fetching);
    }
  }
});
$: if ($transmuters.state.length > 0) {
  $transmuters.state.forEach((entry) => {
    rows.push(entry);
  });
  console.log('ROWS', rows);
}
</script>

<ViewContainer>
  <div class="flex justify-between" slot="head">
    <PageHeader
      pageIcon="transmuter_thin.svg"
      pageTitle="{$_('transmuter_page.title')}"
      pageSubtitle="{$_('transmuter_page.subtitle')}"
    />
  </div>

  <div class="w-full mb-8">
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 text-sm flex justify-between">
        <p class="inline-block self-center">External Swap Providers</p>
        <div>
          <Button width="w-max" label="">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              slot="rightSlot"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </Button>
        </div>
      </div>
      <div slot="body" class="py-4 px-6 flex space-x-4">
        <Button on:clicked="{() => goTo('http://curve.fi')}" label="Curve" width="w-max" py="py-2">
          <img src="images/icons/crv.png" class="w-5 h-5" slot="leftSlot" />
        </Button>
        <Button on:clicked="{() => goTo('http://zapper.fi')}" label="Zapper" width="w-max" py="py-2">
          <img src="images/icons/zapper.png" class="w-5 h-5" slot="leftSlot" />
        </Button>
        <Button on:clicked="{() => goTo('http://paraswap.io')}" label="Paraswap" width="w-max" py="py-2">
          <img src="images/icons/paraswap.png" class="w-5 h-5" slot="leftSlot" />
        </Button>
      </div>
    </ContainerWithHeader>
  </div>

  <div class="w-full mb-8">
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 text-sm">
        <Button
          label="All Transmuter"
          width="w-max"
          canToggle="{true}"
          selected="{toggleButtons.transmuterSelect.all}"
          solid="{false}"
          borderSize="0"
          on:clicked="{() => vaultFilter({ id: 0, filter: 'all' })}"
        >
          <p slot="leftSlot">
            <img src="images/icons/alcx_med.svg" alt="all vaultAlUsd" class="w-5 h-5" />
          </p>
        </Button>
        <Button
          label="alETH"
          width="w-max"
          canToggle="{true}"
          selected="{toggleButtons.transmuterSelect.aleth}"
          solid="{false}"
          borderSize="0"
          on:clicked="{() => vaultFilter({ id: 0, filter: 'aleth' })}"
        >
          <p slot="leftSlot">
            <img src="images/icons/aleth_med.svg" alt="aleth vaultAlUsd" class="w-5 h-5" />
          </p>
        </Button>
        <Button
          label="alUSD"
          width="w-max"
          canToggle="{true}"
          selected="{toggleButtons.transmuterSelect.alusd}"
          solid="{false}"
          borderSize="0"
          on:clicked="{() => vaultFilter({ id: 0, filter: 'alusd' })}"
        >
          <p slot="leftSlot">
            <img src="images/icons/alusd_med.svg" alt="alusd vaultAlUsd" class="w-5 h-5" />
          </p>
        </Button>
      </div>
      <div slot="body">
        {#if $transmuters.fetching}
          <div class="flex justify-center my-4">
            <BarLoader color="#F5C59F" />
          </div>
        {:else}
          <Table rows="{rows}" columns="{columns}" />
        {/if}
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
