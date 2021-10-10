<script>
import Table from './Table.svelte';
import ExpandRowCell from './ExpandRowCell.svelte';
import ExpandHeaderCell from './ExpandHeaderCell.svelte';
import ExpandedRowCard from './SelectStrategyExpandedRow.svelte';
import HeaderCell from './HeaderCell.svelte';
import StrategyTitleCell from './StrategyTitleCell.svelte';
import APYCell from './APYCell.svelte';
import SelectStrategyCell from './SelectStrategyCell.svelte';

const columns = [
  {
    columnId: 'col0',
    CellComponent: ExpandHeaderCell,
    width: 2,
  },
  {
    columnId: 'col1',
    CellComponent: HeaderCell,
    value: 'Strategy',
    width: 2,
    // isSortable: true,
  },
  {
    columnId: 'col2',
    CellComponent: HeaderCell,
    value: 'Collateral',
    width: 2,
    // isSortable: true,
  },
  {
    columnId: 'col3',
    CellComponent: HeaderCell,
    value: 'APY',
    width: 2,
    // isSortable: true,
  },
  {
    columnId: 'col4',
    CellComponent: HeaderCell,
    value: 'Vault APY',
    width: 2,
    // isSortable: true,
  },
  {
    columnId: 'col5',
    CellComponent: HeaderCell,
    value: 'TVL',
    width: 4,
    // isSortable: true,
  },
  {
    columnId: 'col6',
    CellComponent: HeaderCell,
    value: 'Deposited',
    width: 2,
    // isSortable: true,
  },
  {
    columnId: 'col7',
    CellComponent: HeaderCell,
    value: '',
    width: 2,
  },
];

const rows = [
  {
    // the key here matches the columnId in the columns rray
    col0: {
      // define which component to render in this cell
      CellComponent: ExpandRowCell,
      // rows can display an expanded row
      expandedRow: {
        ExpandedRowComponent: ExpandedRowCard,
        // pass through any other props
        currentDeposit: '$5,000%',
      },
      width: 2,
    },
    col1: {
      CellComponent: StrategyTitleCell,
      strategyName: 'Sushi',
      strategyFullName: 'Sushiswap',
      icon: 'images/token-svgs/sushi.svg',
      width: 2,
    },
    col2: {
      value: 'ETH',
      width: 2,
    },
    col3: {
      CellComponent: APYCell,
      apyRate: '50%',
      apyPeriod: 'annualized',
      width: 2,
    },
    col4: {
      CellComponent: APYCell,
      apyRate: '35%',
      apyPeriod: 'annualized',
      width: 2,
    },
    col5: {
      value: '$1.ada;slkfj;aslkfja;sdlkfj;al sdkfj;alksdfj;sadlkfj;asdlfkj',
      width: 4,
    },
    col6: {
      value: '$222,029',
      width: 2,
    },
    col7: {
      CellComponent: SelectStrategyCell,
      width: 2,
    },
  },
  {
    col0: {
      CellComponent: ExpandRowCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedRowCard,
        currentDeposit: '$2,000%',
      },
      width: 2,
    },
    col1: {
      CellComponent: StrategyTitleCell,
      strategyName: 'Yearn',
      strategyFullName: 'Yearn vaults',
      icon: 'images/token-svgs/yearn.svg',
      width: 2,
    },
    col2: {
      value: 'ETH',
      width: 2,
    },
    col3: {
      CellComponent: APYCell,
      apyRate: '50%',
      apyPeriod: 'annualized',
      width: 2,
    },
    col4: {
      CellComponent: APYCell,
      apyRate: '24%',
      apyPeriod: 'annualized',
      width: 2,
    },
    col5: {
      value: '$1.5M',
      width: 4,
    },
    col6: {
      value: '$222,029',
      width: 2,
    },
    col7: {
      CellComponent: SelectStrategyCell,
      width: 2,
    },
  },
  {
    col0: {
      CellComponent: ExpandRowCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedRowCard,
        currentDeposit: '$1,000%',
      },
      width: 2,
    },
    col1: {
      CellComponent: StrategyTitleCell,
      strategyName: 'CRV',
      strategyFullName: 'Curve finance',
      icon: 'images/token-svgs/curve.svg',
      width: 2,
    },
    col2: {
      value: 'ETH',
      width: 2,
    },
    col3: {
      CellComponent: APYCell,
      apyRate: '50%',
      apyPeriod: 'annualized',
      width: 2,
    },
    col4: {
      CellComponent: APYCell,
      apyRate: '76%',
      apyPeriod: 'annualized',
      width: 2,
    },
    col5: {
      value: '$1.5M',
      width: 4,
    },
    col6: {
      value: '$222,029',
      width: 2,
    },
    col7: {
      CellComponent: SelectStrategyCell,
      width: 2,
    },
  },
];
</script>

<div class="font-alcxTitles">
  <Table rows="{rows}" columns="{columns}" />
</div>
