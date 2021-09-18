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
    value: 'Vault Type',
    isSortable: true,
  },
  {
    columnId: 'col2',
    CellComponent: HeaderCell,
    value: 'Yield Strategies',
    isSortable: true,
  },
  {
    columnId: 'col3',
    CellComponent: HeaderCell,
    value: 'Deposit Amount',
    isSortable: true,
  },
  {
    columnId: 'col4',
    CellComponent: HeaderCell,
    value: 'Available Credit',
    isSortable: true,
  },
  {
    columnId: 'col5',
    CellComponent: HeaderCell,
    value: 'Borrowed Amount',
    isSortable: true,
  },
  {
    columnId: 'col6',
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
      value: '50.2',
    },
    col6: {
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
      value: '60.2',
    },
    col6: {
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
      value: '10.2',
    },
    col6: {
      value: 'View',
    },
  },
];
</script>

<Table rows="{rows}" columns="{columns}" />
