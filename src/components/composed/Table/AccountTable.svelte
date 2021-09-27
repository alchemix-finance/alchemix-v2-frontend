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
  },
  {
    columnId: 'col1',
    CellComponent: HeaderCell,
    value: 'Strategy',
    // isSortable: true,
  },
  {
    columnId: 'col2',
    CellComponent: HeaderCell,
    value: 'Collateral',
    // isSortable: true,
  },
  {
    columnId: 'col3',
    CellComponent: HeaderCell,
    value: 'APY',
    // isSortable: true,
  },
  {
    columnId: 'col4',
    CellComponent: HeaderCell,
    value: 'Vault APY',
    // isSortable: true,
  },
  {
    columnId: 'col5',
    CellComponent: HeaderCell,
    value: 'TVL',
    // isSortable: true,
  },
  {
    columnId: 'col6',
    CellComponent: HeaderCell,
    value: 'Deposited',
    // isSortable: true,
  },
  {
    columnId: 'col7',
    CellComponent: HeaderCell,
    value: '',
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
    },
    col1: {
      CellComponent: StrategyTitleCell,
      strategyName: 'Sushi',
      strategyFullName: 'Sushiswap',
      icon: 'images/token-svgs/sushi.svg',
    },
    col2: {
      value: 'ETH',
    },
    col3: {
      CellComponent: APYCell,
      apyRate: '50%',
      apyPeriod: 'annualized',
    },
    col4: {
      CellComponent: APYCell,
      apyRate: '35%',
      apyPeriod: 'annualized',
    },
    col5: {
      value: '$1.5M',
    },
    col6: {
      value: '$222,029',
    },
    col7: {
      CellComponent: SelectStrategyCell,
    },
  },
  {
    col0: {
      CellComponent: ExpandRowCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedRowCard,
        currentDeposit: '$2,000%',
      },
    },
    col1: {
      CellComponent: StrategyTitleCell,
      strategyName: 'Yearn',
      strategyFullName: 'Yearn vaults',
      icon: 'images/token-svgs/yearn.svg',
    },
    col2: {
      value: 'ETH',
    },
    col3: {
      CellComponent: APYCell,
      apyRate: '50%',
      apyPeriod: 'annualized',
    },
    col4: {
      CellComponent: APYCell,
      apyRate: '24%',
      apyPeriod: 'annualized',
    },
    col5: {
      value: '$1.5M',
    },
    col6: {
      value: '$222,029',
    },
    col7: {
      CellComponent: SelectStrategyCell,
    },
  },
  {
    col0: {
      CellComponent: ExpandRowCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedRowCard,
        currentDeposit: '$1,000%',
      },
    },
    col1: {
      CellComponent: StrategyTitleCell,
      strategyName: 'CRV',
      strategyFullName: 'Curve finance',
      icon: 'images/token-svgs/curve.svg',
    },
    col2: {
      value: 'ETH',
    },
    col3: {
      CellComponent: APYCell,
      apyRate: '50%',
      apyPeriod: 'annualized',
    },
    col4: {
      CellComponent: APYCell,
      apyRate: '76%',
      apyPeriod: 'annualized',
    },
    col5: {
      value: '$1.5M',
    },
    col6: {
      value: '$222,029',
    },
    col7: {
      CellComponent: SelectStrategyCell,
    },
  },
];
</script>

<div class="font-alcxTitles">
  <Table rows="{rows}" columns="{columns}" />
</div>
