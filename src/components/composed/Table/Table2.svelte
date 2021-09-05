<script>
import { SORT_ORDERS, sortTableRows } from '../../../helpers/table';

const columns = [
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
    header: undefined,
    dataKey: 'col6',
    useSortBy: false,
  },
];

const rows = [
  {
    col1: 'alUsd',
    col2: '6',
    col3: '161.5',
    col4: '30.3',
    col5: '50.2',
    col6: 'View',
  },
  {
    col1: 'blUsd',
    col2: '7',
    col3: '261.5',
    col4: '40.3',
    col5: '60.2',
    col6: 'View',
  },
];

const colNumber = columns.length;

// we could tweak this to support multiple headers
// like on https://codesandbox.io/s/github/tannerlinsley/react-table/tree/master/examples/sorting?file=/src/App.js:0-65
const headerGroups = columns.map((col) => ({
  headers: [{ header: col.header, ...col }],
}));

let tableRows = rows.map((row) => ({
  cells: Object.keys(row).map((rowKey) => ({
    data: row[rowKey],
    dataKey: rowKey,
  })),
}));

$: sortedRows = tableRows;

let sortOrder = SORT_ORDERS.asc;

const sortBy = (dataKey) => {
  tableRows = sortTableRows({ columnKey: dataKey, rows: tableRows, sortOrder });

  if (sortOrder === SORT_ORDERS.asc) {
    sortOrder = SORT_ORDERS.desc;
  } else {
    sortOrder = SORT_ORDERS.asc;
  }
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
            {header && header.header}
            <button on:click="{() => sortBy(header.dataKey)}">
              {header.useSortBy ? ' 🔽' : ' 🔼'}
            </button>
          </th>
        {/each}
      </tr>
    {/each}
  </thead>

  <tbody>
    {#each sortedRows as row, i}
      <tr
        class="flex justify-items-center items-center h-16 grid grid-cols-{colNumber} {rowBg(
          i,
        )}"
      >
        {#each row.cells as cell}
          <td>{cell.data}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
