<script>
import ExternalActionsCell from './ExternalActionsCell.svelte';
import FarmNameCell from './FarmNameCell.svelte';
import HeaderCell from '../HeaderCell.svelte';
import Table from '../Table.svelte';

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
</script>

<Table rows="{rowsExternal}" columns="{columnsExternal}" />
