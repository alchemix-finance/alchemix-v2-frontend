<script>
import { SORT_ORDERS, sortTableRows } from '../../../helpers/table';

import TableBodyRow from './TableBodyRow.svelte';
import TableHeaderCell from './TableHeaderCell.svelte';

export let rows = [];
export let columns = [];

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
  sortOrder = sortOrder === SORT_ORDERS.asc ? SORT_ORDERS.desc : SORT_ORDERS.asc;
};

const rowBg = (idx) => (idx % 2 === 0 ? 'bg-grey10' : 'bg-grey15');
</script>

<table class="border border-grey10 border-4 grid grid-flow-row auto-rows-max">
  <thead class="flex justify-items-center items-center bg-grey15 h-16 grid grid-cols-{colNumber}">
    {#each headerGroups as headerGroup}
      <tr>
        {#each headerGroup.headers as header}
          <th>
            <TableHeaderCell header="{header}" sortBy="{sortBy}" sortOrder="{sortOrder}" />
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
