<script>
  import { _ } from 'svelte-i18n';
  import ExternalActionsCell from './ExternalActionsCell.svelte';
  import FarmNameCell from './FarmNameCell.svelte';
  import HeaderCell from '../HeaderCell.svelte';
  import Table from '../Table.svelte';

  const columnsExternal = [
    {
      columnId: 'col1',
      CellComponent: HeaderCell,
      value: $_('table.pool'),
      colSize: 6,
    },
    {
      columnId: 'col2',
      CellComponent: HeaderCell,
      value: $_('table.action'),
      colSize: 6,
    },
  ];
  const rowsExternal = [
    {
      col1: {
        CellComponent: FarmNameCell,
        farmIcon: 'saddle.svg',
        farmName: 'Saddle d4',
        farmSubtitle: $_('farm_page.saddle_text'),
        colSize: 7,
        alignment: 'justify-self-start',
      },
      col2: {
        CellComponent: ExternalActionsCell,
        actions: [
          {
            label: $_('actions.deposit'),
            url: 'https://saddle.exchange/#/pools/d4/deposit',
          },
          {
            label: $_('actions.stake'),
            url: 'https://app.frax.finance/staking#Saddle_alUSD_FEI_FRAX_LUSD',
          },
          {
            label: $_('actions.swap'),
            url: 'https://saddle.exchange/#/',
          },
        ],
        colSize: 6,
      },
    },
    {
      col1: {
        CellComponent: FarmNameCell,
        farmIcon: 'sushi.svg',
        farmName: 'alUSD/ETH Onsen',
        farmSubtitle: $_('farm_page.sushi_text'),
        colSize: 7,
        alignment: 'justify-self-start',
      },
      col2: {
        CellComponent: ExternalActionsCell,
        actions: [
          {
            label: $_('actions.deposit'),
            url: 'https://app.sushi.com/add/ETH/0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9',
          },
          {
            label: $_('actions.stake'),
            url: 'https://app.sushi.com/farm',
          },
          {
            label: $_('actions.swap'),
            url: 'https://app.sushi.com/swap#/swap?inputCurrency=0xbc6da0fe9ad5f3b0d58160288917aa56653660e9&outputCurrency=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          },
        ],
        colSize: 6,
      },
    },
    {
      col1: {
        CellComponent: FarmNameCell,
        farmIcon: 'mstable.svg',
        farmName: 'mStable alUSD Feeder',
        farmSubtitle: $_('farm_page.mstable_text'),
        colSize: 7,
        alignment: 'justify-self-start',
      },
      col2: {
        CellComponent: ExternalActionsCell,
        actions: [
          {
            label: `${$_('actions.deposit')} & ${$_('actions.stake')}`,
            url: 'https://mstable.app/#/musd/pools/0x4eaa01974b6594c0ee62ffd7fee56cf11e6af936',
          },
          {
            label: $_('actions.swap'),
            url: 'https://mstable.app/#/musd/swap',
          },
        ],
        colSize: 6,
      },
    },
  ];
</script>

<Table rows="{rowsExternal}" columns="{columnsExternal}" />
