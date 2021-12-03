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
</script>

<ViewContainer>
  <div class='flex justify-between' slot='head'>
    <PageHeader
      pageIcon='farm_thin.svg'
      pageTitle={$_('farm_page.title')}
      pageSubtitle={$_('farm_page.subtitle')}
    />
  </div>
  <div class='w-full mb-8'>
    <ContainerWithHeader>
      <div slot='header' class='py-4 px-6'>Delta Values</div>
    </ContainerWithHeader>
  </div>

  <div class='w-full mb-8'>
    <ContainerWithHeader>
      <div slot='header' class='py-4 px-6 text-sm'>
        <strong>Active Farms</strong> - Earn ALCX tokens via staking
      </div>
      <div slot='body'>
        <Table rows='{rowsActive}' columns='{columnsActive}' />
      </div>
    </ContainerWithHeader>
  </div>

  <div class='w-full mb-8'>
    <ContainerWithHeader>
      <div slot='header' class='py-4 px-6 text-sm flex justify-between'>
        <p class='inline-block self-center'>
          <strong>External Farms</strong> - Other opportunities to earn with Alchemix
        </p>
        <div>
          <Button label=''>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              slot='rightSlot'
              class='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
              ></path>
            </svg>
          </Button>
        </div>
      </div>
      <div slot='body'>
        <Table rows='{rowsExternal}' columns='{columnsExternal}' />
      </div>
    </ContainerWithHeader>
  </div>

  <div class='w-full mb-8'>
    <ContainerWithHeader>
      <div slot='header' class='py-4 px-6 text-sm flex justify-between'>
        <p class='inline-block self-center'>
          <strong>Retired Farms</strong> - Migrate your liquidity
        </p>
        <div>
          <Button
            width='w-max'
            label=''
            on:clicked="{() => goTo('https://alchemixfi.medium.com/farm-migrations-how-to-fb4754fa10b2')}"
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              slot='rightSlot'
              class='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              ></path>
            </svg>
          </Button>

          <Button width='w-max' label=''>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              slot='rightSlot'
              class='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
              ></path>
            </svg>
          </Button>
        </div>
      </div>
      <div slot='body'>
        <Table rows='{rowsRetired}' columns='{columnsRetired}' />
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
