<script>
import { SORT_ORDERS, sortTableRows } from '../../../helpers/table';

import ExpandedRowCard from './ExpandedRowCard.svelte';
import TableBodyRow from './TableBodyRow.svelte';
import TableHeaderCell from './TableHeaderCell.svelte';
import VaultTypeCell from './VaultTypeCell.svelte';
import ExpandRowCell from './ExpandRowCell.svelte';

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

const colNumber = columns.length;

// we could tweak this to support multiple headers
// like on https://codesandbox.io/s/github/tannerlinsley/react-table/tree/master/examples/sorting?file=/src/App.js:0-65
const headerGroups = columns.map((col) => ({
  headers: [{ value: col.value, ...col }],
}));

let tableRows = rows.map((row, i) => ({
  cells: Object.keys(row).map((rowKey) => ({
    data: row[rowKey],
    dataKey: rowKey,
  })),
  rowId: i,
}));

$: sortedRows = tableRows;

let sortOrder = SORT_ORDERS.asc;

const sortBy = (dataKey) => {
  tableRows = sortTableRows({ columnKey: dataKey, rows: tableRows, sortOrder });

  // toggle sortOrder
  sortOrder =
    sortOrder === SORT_ORDERS.asc ? SORT_ORDERS.desc : SORT_ORDERS.asc;
};

const rowBg = (idx) => (idx % 2 === 0 ? 'bg-grey10' : 'bg-grey15');
</script>

<!-- TODO remove mt-10 -->
<table
  class="border border-grey10 border-4 grid grid-flow-row auto-rows-max mt-10"
>
  <thead
    class="flex justify-items-center items-center bg-grey15 h-16 grid grid-cols-{colNumber}"
  >
    {#each headerGroups as headerGroup}
      <tr>
        {#each headerGroup.headers as header}
          <th>
            <TableHeaderCell
              header="{header}"
              sortBy="{sortBy}"
              sortOrder="{sortOrder}"
            />
          </th>
        {/each}
      </tr>
    {/each}
  </thead>

  <tbody>
    {#each sortedRows as row, index}
      <TableBodyRow index="{index}" row="{row}" colNumber="{colNumber}" />
    {/each}
  </tbody>
</table>
