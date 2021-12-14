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
    value: 'APY',
    colSize: 2,
  },
];
const rows = [
  {
    col1: {
      CellComponent: ExpandRowCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedTransmuter,
      },
      colSize: 1,
    },
    col2: {
      value: 'alUSD-DAI',
      colSize: 2,
      alignment: 'justify-self-start',
    },
    col3: {
      value: '350 alUSD',
      colSize: 2,
    },
    col4: {
      value: '150 alUSD',
      colSize: 2,
    },
    col6: {
      value: '200 DAI',
      colSize: 2,
    },
    col5: {
      value: '1234%',
      colSize: 2,
    },
  },
  {
    col1: {
      CellComponent: ExpandRowCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedTransmuter,
      },
      colSize: 1,
    },
    col2: {
      value: 'alUSD-USDT',
      colSize: 2,
      alignment: 'justify-self-start',
    },
    col3: {
      value: '350 alUSD',
      colSize: 2,
    },
    col4: {
      value: '150 alUSD',
      colSize: 2,
    },
    col6: {
      value: '200 DAI',
      colSize: 2,
    },
    col5: {
      value: '1234%',
      colSize: 2,
    },
  },
  {
    col1: {
      CellComponent: ExpandRowCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedTransmuter,
      },
      colSize: 1,
    },
    col2: {
      value: 'alUSD-USDC',
      colSize: 2,
      alignment: 'justify-self-start',
    },
    col3: {
      value: '350 alUSD',
      colSize: 2,
    },
    col4: {
      value: '150 alUSD',
      colSize: 2,
    },
    col6: {
      value: '200 DAI',
      colSize: 2,
    },
    col5: {
      value: '1234%',
      colSize: 2,
    },
  },
];
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
        <Button label="Curve" width="w-max" py="py-2">
          <img src="images/icons/crv.png" class="w-5 h-5" slot="leftSlot" />
        </Button>
        <Button label="Zapper" width="w-max" py="py-2">
          <img src="images/icons/zapper.png" class="w-5 h-5" slot="leftSlot" />
        </Button>
        <Button label="Paraswap" width="w-max" py="py-2">
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
            <img src="images/icons/alcx_med.svg" alt="all vaults" class="w-5 h-5" />
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
            <img src="images/icons/aleth_med.svg" alt="aleth vaults" class="w-5 h-5" />
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
            <img src="images/icons/alusd_med.svg" alt="alusd vaults" class="w-5 h-5" />
          </p>
        </Button>
      </div>
      <div slot="body">
        <Table rows="{rows}" columns="{columns}" />
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
