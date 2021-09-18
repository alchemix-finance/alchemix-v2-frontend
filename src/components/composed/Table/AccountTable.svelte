<script>
import Table from './Table.svelte';
import ExpandRowCell from './ExpandRowCell.svelte';
import ExpandHeaderCell from './ExpandHeaderCell.svelte';
import ExpandedRowCard from './ExpandedRowCard.svelte';
import VaultTypeCell from './VaultTypeCell.svelte';
import HeaderCell from './HeaderCell.svelte';

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
    value: 'Alchemist',
    // isSortable: true,
  },
  {
    columnId: 'col6',
    CellComponent: HeaderCell,
    value: 'TVL',
    // isSortable: true,
  },
  {
    columnId: 'col7',
    CellComponent: HeaderCell,
    value: 'Deposited',
    // isSortable: true,
  },
  {
    columnId: 'col8',
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
        value: 'aaaa',
      },
    },
    col1: {
      CellComponent: VaultTypeCell,
      // pass through any other props
      value: 'alUsd',
      title: '',
    },
    col2: {
      value: '6',
    },
    col3: {
      value: '161.5',
    },
    col4: {
      value: '30.3',
    },
    col5: {
      value: 'Gandalf',
    },
    col6: {
      value: '$1.5M',
    },
    col7: {
      value: '$222,029',
    },
    col8: {
      value: 'View',
    },
  },
  {
    col0: {
      CellComponent: ExpandRowCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedRowCard,
        value: 'bbbb',
      },
    },
    col1: {
      CellComponent: VaultTypeCell,
      value: 'blUsd',
    },
    col2: {
      value: '7',
    },
    col3: {
      value: '261.5',
    },
    col4: {
      value: '40.3',
    },
    col5: {
      value: 'Gandalf',
    },
    col6: {
      value: '$1.5M',
    },
    col7: {
      value: '$222,029',
    },
    col8: {
      value: 'View',
    },
  },
  {
    col0: {
      CellComponent: ExpandRowCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedRowCard,
        value: 'cccc',
      },
    },
    col1: {
      CellComponent: VaultTypeCell,
      value: 'clUsd',
    },
    col2: {
      value: '10',
    },
    col3: {
      value: '761.5',
    },
    col4: {
      value: '10.3',
    },
    col5: {
      value: 'Gandalf',
    },
    col6: {
      value: '$1.5M',
    },
    col7: {
      value: '$222,029',
    },
    col8: {
      value: 'View',
    },
  },
];
</script>

<Table rows="{rows}" columns="{columns}" />
