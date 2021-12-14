<script>
import Table from './Table.svelte';
import ExpandRowCell from './ExpandRowCell.svelte';
import ExpandedRowCard from './SelectStrategyExpandedRow.svelte';
import HeaderCell from './HeaderCell.svelte';
import StrategyTitleCell from './StrategyTitleCell.svelte';
import APYCell from './APYCell.svelte';
import SelectStrategyCell from './SelectStrategyCell.svelte';

const columns = [
  {
    columnId: 'col0',
    CellComponent: HeaderCell,
    value: '',
    colSize: 2,
  },
  {
    columnId: 'col1',
    CellComponent: HeaderCell,
    value: 'Strategy',
    colSize: 2,
    // isSortable: true,
  },
  {
    columnId: 'col2',
    CellComponent: HeaderCell,
    value: 'Collateral',
    colSize: 2,
    // isSortable: true,
  },
  {
    columnId: 'col3',
    CellComponent: HeaderCell,
    value: 'APY',
    colSize: 2,
    // isSortable: true,
  },
  {
    columnId: 'col4',
    CellComponent: HeaderCell,
    value: 'Vault APY',
    colSize: 2,
    // isSortable: true,
  },
  {
    columnId: 'col5',
    CellComponent: HeaderCell,
    value: 'TVL',
    colSize: 4,
    // isSortable: true,
  },
  {
    columnId: 'col6',
    CellComponent: HeaderCell,
    value: 'Deposited',
    colSize: 2,
    // isSortable: true,
  },
  {
    columnId: 'col7',
    CellComponent: HeaderCell,
    value: '',
    colSize: 2,
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
      colSize: 2,
    },
    col1: {
      CellComponent: StrategyTitleCell,
      strategyName: 'Sushi',
      strategyFullName: 'Sushiswap',
      icon: 'images/token-svgs/sushi.svg',
      colSize: 2,
    },
    col2: {
      value: 'ETH',
      colSize: 2,
    },
    col3: {
      CellComponent: APYCell,
      apyRate: '50%',
      apyPeriod: 'annualized',
      colSize: 2,
    },
    col4: {
      CellComponent: APYCell,
      apyRate: '35%',
      apyPeriod: 'annualized',
      colSize: 2,
    },
    col5: {
      value: '$1.ada;slkfj;aslkfja;sdlkfj;al sdkfj;alksdfj;sadlkfj;asdlfkj',
      colSize: 4,
    },
    col6: {
      value: '$222,029',
      colSize: 2,
    },
    col7: {
      CellComponent: SelectStrategyCell,
      colSize: 2,
    },
  },
  {
    col0: {
      CellComponent: ExpandRowCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedRowCard,
        currentDeposit: '$2,000%',
      },
      colSize: 2,
    },
    col1: {
      CellComponent: StrategyTitleCell,
      strategyName: 'Yearn',
      strategyFullName: 'Yearn vaults',
      icon: 'images/token-svgs/yearn.svg',
      colSize: 2,
    },
    col2: {
      value: 'ETH',
      colSize: 2,
    },
    col3: {
      CellComponent: APYCell,
      apyRate: '50%',
      apyPeriod: 'annualized',
      colSize: 2,
    },
    col4: {
      CellComponent: APYCell,
      apyRate: '24%',
      apyPeriod: 'annualized',
      colSize: 2,
    },
    col5: {
      value: '$1.5M',
      colSize: 4,
    },
    col6: {
      value: '$222,029',
      colSize: 2,
    },
    col7: {
      CellComponent: SelectStrategyCell,
      colSize: 2,
    },
  },
  {
    col0: {
      CellComponent: ExpandRowCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedRowCard,
        currentDeposit: '$1,000%',
      },
      colSize: 2,
    },
    col1: {
      CellComponent: StrategyTitleCell,
      strategyName: 'CRV',
      strategyFullName: 'Curve finance',
      icon: 'images/token-svgs/curve.svg',
      colSize: 2,
    },
    col2: {
      value: 'ETH',
      colSize: 2,
    },
    col3: {
      CellComponent: APYCell,
      apyRate: '50%',
      apyPeriod: 'annualized',
      colSize: 2,
    },
    col4: {
      CellComponent: APYCell,
      apyRate: '76%',
      apyPeriod: 'annualized',
      colSize: 2,
    },
    col5: {
      value: '$1.5M',
      colSize: 4,
    },
    col6: {
      value: '$222,029',
      colSize: 2,
    },
    col7: {
      CellComponent: SelectStrategyCell,
      colSize: 2,
    },
  },
];
</script>

<div class="font-alcxTitles">
  <Table rows="{rows}" columns="{columns}" />
</div>
