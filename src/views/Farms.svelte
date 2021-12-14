<script>
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
import ExternalActionsCell from '../components/composed/Table/farms/ExternalActionsCell.svelte';
import ExitCell from '../components/composed/Table/farms/ExitCell.svelte';
import ExpandedFarm from '../components/composed/Table/farms/ExpandedFarm.svelte';

const goTo = (url) => {
  window.open(url, '_blank');
};

const columnsActive = [
  {
    columnId: 'col0',
    value: '',
    colSize: 1,
  },
  {
    columnId: 'col1',
    CellComponent: HeaderCell,
    value: 'Pool',
    colSize: 3,
  },
  {
    columnId: 'col2',
    CellComponent: HeaderCell,
    value: 'TVL',
    colSize: 2,
  },
  {
    columnId: 'col3',
    CellComponent: HeaderCell,
    value: 'Rewards',
    colSize: 3,
  },
  {
    columnId: 'col4',
    CellComponent: HeaderCell,
    value: 'APR',
    colSize: 1,
  },
  {
    columnId: 'col5',
    CellComponent: HeaderCell,
    value: 'Action',
    colSize: 3,
  },
];
const rowsActive = [
  {
    col0: {
      CellComponent: ExpandRowCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedFarm,
      },
      colSize: 1,
    },
    col1: {
      CellComponent: FarmNameCell,
      tokenIcon: 'sushi',
      farmName: 'ALCX/ETH v2',
      farmSubtitle: 'Sushiswap SLP',
      colSize: 3,
      alignment: 'justify-self-start',
    },
    col2: {
      value: 5223239,
      colSize: 2,
    },
    col3: {
      CellComponent: RewardCell,
      rewards: [
        {
          iconName: 'alchemix',
          tokenName: 'ALCX',
        },
        {
          iconName: 'sushi',
          tokenName: 'SUSHI',
        },
      ],
      colSize: 3,
    },
    col4: {
      value: 76,
      colSize: 1,
    },
    col5: {
      CellComponent: ActionsCell,
      label: 'Manage',
      expandedRow: {
        ExpandedRowComponent: ExpandedFarm,
      },
      colSize: 3,
    },
  },
  {
    col0: {
      CellComponent: ExpandRowCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedFarm,
      },
      colSize: 1,
    },
    col1: {
      CellComponent: FarmNameCell,
      farmName: 'ALCX',
      farmSubtitle: 'Alchemix ALCX',
      colSize: 3,
      alignment: 'justify-self-start',
    },
    col2: {
      value: 5223239,
      colSize: 2,
    },
    col3: {
      CellComponent: RewardCell,
      rewards: [
        {
          iconName: 'alchemix',
          tokenName: 'ALCX',
        },
      ],
      colSize: 3,
    },
    col4: {
      value: 76,
      colSize: 1,
    },
    col5: {
      CellComponent: ActionsCell,
      label: 'Manage',
      expandedRow: {
        ExpandedRowComponent: ExpandedFarm,
      },
      colSize: 3,
    },
  },
  {
    col0: {
      CellComponent: ExpandRowCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedFarm,
      },
      colSize: 1,
    },
    col1: {
      CellComponent: FarmNameCell,
      tokenIcon: 'saddle',
      farmName: 'alETH Saddle',
      farmSubtitle: 'Saddle LP',
      colSize: 3,
      alignment: 'justify-self-start',
    },
    col2: {
      value: 5223239,
      colSize: 2,
    },
    col3: {
      CellComponent: RewardCell,
      rewards: [
        {
          iconName: 'alchemix',
          tokenName: 'ALCX',
        },
      ],
      colSize: 3,
    },
    col4: {
      value: 76,
      colSize: 1,
    },
    col5: {
      CellComponent: ActionsCell,
      label: 'Manage',
      expandedRow: {
        ExpandedRowComponent: ExpandedFarm,
      },
      colSize: 3,
    },
  },
  {
    col0: {
      CellComponent: ExpandRowCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedFarm,
      },
      colSize: 1,
    },
    col1: {
      CellComponent: FarmNameCell,
      farmIcon: 'alusd_med.svg',
      tokenIcon: 'crv',
      farmName: 'alUSD3CRV',
      farmSubtitle: 'Convex LP',
      colSize: 3,
      alignment: 'justify-self-start',
    },
    col2: {
      value: 5223239,
      colSize: 2,
    },
    col3: {
      CellComponent: RewardCell,
      rewards: [
        {
          iconName: 'alchemix',
          tokenName: 'ALCX',
        },
        {
          iconName: 'crv',
          tokenName: 'CRV',
        },
      ],
      colSize: 3,
    },
    col4: {
      value: 76,
      colSize: 1,
    },
    col5: {
      CellComponent: ActionsCell,
      label: 'Manage',
      expandedRow: {
        ExpandedRowComponent: ExpandedFarm,
      },
      colSize: 3,
    },
  },
  {
    col0: {
      CellComponent: ExpandRowCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedFarm,
      },
      colSize: 1,
    },
    col1: {
      CellComponent: FarmNameCell,
      tokenIcon: 'tokemak',
      farmName: 'tALCX',
      farmSubtitle: 'Tokemak',
      colSize: 3,
      alignment: 'justify-self-start',
    },
    col2: {
      value: 5223239,
      colSize: 2,
    },
    col3: {
      CellComponent: RewardCell,
      rewards: [
        {
          iconName: 'alchemix',
          tokenName: 'ALCX',
        },
      ],
      colSize: 3,
    },
    col4: {
      value: 76,
      colSize: 1,
    },
    col5: {
      CellComponent: ActionsCell,
      label: 'Manage',
      expandedRow: {
        ExpandedRowComponent: ExpandedFarm,
      },
      colSize: 3,
    },
  },
];

const columnsExternal = [
  {
    columnId: 'col1',
    CellComponent: HeaderCell,
    value: 'Pool',
    colSize: 6,
  },
  {
    columnId: 'col2',
    CellComponent: HeaderCell,
    value: 'Action',
    colSize: 6,
  },
];
const rowsExternal = [
  {
    col1: {
      CellComponent: FarmNameCell,
      farmIcon: 'saddle.png',
      farmName: 'Saddle d4',
      farmSubtitle: 'Deposit alUSD, FEI, FRAX, and/or LUSD to earn ALCX, TRIBE, FXS and LQTY',
      colSize: 7,
      alignment: 'justify-self-start',
    },
    col2: {
      CellComponent: ExternalActionsCell,
      actions: [
        {
          label: 'Deposit',
          url: 'https://saddle.exchange/#/pools/d4/deposit',
        },
        {
          label: 'Stake',
          url: 'https://app.frax.finance/staking#Saddle_alUSD_FEI_FRAX_LUSD',
        },
        {
          label: 'Swap',
          url: 'https://saddle.exchange/#/',
        },
      ],
      colSize: 6,
    },
  },
  {
    col1: {
      CellComponent: FarmNameCell,
      farmIcon: 'sushi.png',
      farmName: 'alUSD/ETH Onsen',
      farmSubtitle: 'Deposit alUSD and ETH on Sushiswap to earn SUSHI',
      colSize: 7,
      alignment: 'justify-self-start',
    },
    col2: {
      CellComponent: ExternalActionsCell,
      actions: [
        {
          label: 'Deposit',
          url: 'https://app.sushi.com/add/ETH/0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9',
        },
        {
          label: 'Stake',
          url: 'https://app.sushi.com/farm',
        },
        {
          label: 'Swap',
          url: 'https://app.sushi.com/swap#/swap?inputCurrency=0xbc6da0fe9ad5f3b0d58160288917aa56653660e9&outputCurrency=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        },
      ],
      colSize: 6,
    },
  },
  {
    col1: {
      CellComponent: FarmNameCell,
      farmIcon: 'mstable.png',
      farmName: 'mStable alUSD Feeder',
      farmSubtitle: 'Deposit alUSD to earn MTA',
      colSize: 7,
      alignment: 'justify-self-start',
    },
    col2: {
      CellComponent: ExternalActionsCell,
      actions: [
        {
          label: 'Deposit & Stake',
          url: 'https://mstable.app/#/musd/pools/0x4eaa01974b6594c0ee62ffd7fee56cf11e6af936',
        },
        {
          label: 'Swap',
          url: 'https://mstable.app/#/musd/swap',
        },
      ],
      colSize: 6,
    },
  },
];

const columnsRetired = [
  {
    columnId: 'col1',
    CellComponent: HeaderCell,
    value: 'Pool',
    colSize: 7,
  },
  {
    columnId: 'col4',
    CellComponent: HeaderCell,
    value: 'Staked Token',
    colSize: 4,
  },
  {
    columnId: 'col2',
    CellComponent: HeaderCell,
    value: 'Claimable Rewards',
    colSize: 4,
  },
  {
    columnId: 'col3',
    CellComponent: HeaderCell,
    value: 'Action',
    colSize: 5,
  },
];
const rowsRetired = [
  {
    col1: {
      CellComponent: FarmNameCell,
      tokenIcon: 'sushi',
      farmName: 'ALCX/ETH v1',
      farmSubtitle: 'Sushiswap SLP',
      colSize: 7,
    },
    col4: {
      value: 12345,
      colSize: 4,
    },
    col2: {
      value: 5223239,
      colSize: 4,
    },
    col5: {
      CellComponent: ExitCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedFarm,
      },
      colSize: 5,
    },
  },
  {
    col1: {
      CellComponent: FarmNameCell,
      farmIcon: 'alusd_med.svg',
      farmName: 'alUSD',
      farmSubtitle: 'Alchemix alUSD',
      colSize: 7,
    },
    col4: {
      value: 12345,
      colSize: 4,
    },
    col2: {
      value: 5223239,
      colSize: 4,
    },
    col5: {
      CellComponent: ExitCell,
      colSize: 5,
    },
  },
  {
    col1: {
      CellComponent: FarmNameCell,
      farmIcon: 'alusd_med.svg',
      tokenIcon: 'crv',
      farmName: 'alUSD3CRV',
      farmSubtitle: 'Convex',
      colSize: 7,
    },
    col4: {
      value: 12345,
      colSize: 4,
    },
    col2: {
      value: 5223239,
      colSize: 4,
    },
    col5: {
      CellComponent: ExitCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedFarm,
      },
      colSize: 5,
    },
  },
  {
    col1: {
      CellComponent: FarmNameCell,
      tokenIcon: 'crv',
      farmName: 'alETH Curve',
      farmSubtitle: 'Convex',
      colSize: 7,
    },
    col4: {
      value: 12345,
      colSize: 4,
    },
    col2: {
      value: 5223239,
      colSize: 4,
    },
    col5: {
      CellComponent: ExitCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedFarm,
      },
      colSize: 5,
    },
  },
];

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
          label="Active"
          width="w-max"
          canToggle="{true}"
          selected="{toggleButtons.farmSelect.active}"
          solid="{false}"
          borderSize="0"
          on:clicked="{() => vaultFilter({ id: 0, filter: 'active' })}"
        />

        <Button
          label="Retired"
          width="w-max"
          canToggle="{true}"
          selected="{toggleButtons.farmSelect.retired}"
          solid="{false}"
          borderSize="0"
          on:clicked="{() => vaultFilter({ id: 0, filter: 'retired' })}"
        />

        <Button
          label="External"
          width="w-max"
          canToggle="{true}"
          selected="{toggleButtons.farmSelect.external}"
          solid="{false}"
          borderSize="0"
          on:clicked="{() => vaultFilter({ id: 0, filter: 'external' })}"
        />
      </div>
      <div slot="body">
        {#if toggleButtons.farmSelect.active}
          <Table rows="{rowsActive}" columns="{columnsActive}" />
        {/if}
        {#if toggleButtons.farmSelect.retired}
          <Table rows="{rowsRetired}" columns="{columnsRetired}" />
        {/if}
        {#if toggleButtons.farmSelect.external}
          <Table rows="{rowsExternal}" columns="{columnsExternal}" />
        {/if}
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
