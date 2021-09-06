<script>
import Table from './Table.svelte';
import ExpandRowCell from './ExpandRowCell.svelte';
import ExpandedRowCard from './ExpandedRowCard.svelte';
import VaultTypeCell from './VaultTypeCell.svelte';

const columns = [
  {
    header: '+',
    dataKey: 'col0',
  },
  {
    header: 'Vault Type',
    dataKey: 'col1',
    useSortBy: true,
  },
  {
    header: 'Yield Strategies',
    dataKey: 'col2',
    useSortBy: true,
  },
  {
    header: 'Deposit Amount',
    dataKey: 'col3',
    useSortBy: true,
  },
  {
    header: 'Available Credit',
    dataKey: 'col4',
    useSortBy: true,
  },
  {
    header: 'Borrowed Amount',
    dataKey: 'col5',
    useSortBy: true,
  },
  {
    header: '',
    dataKey: 'col6',
  },
];

const rows = [
  {
    col0: {
      CellComponent: ExpandRowCell,
      expandedRow: {
        ExpandedRowComponent: ExpandedRowCard,
        value: 'aaaa',
      },
    },
    col1: {
      CellComponent: VaultTypeCell,
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
