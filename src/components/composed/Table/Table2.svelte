<script>
export const columns = [
  {
    header: 'Vault Type',
    dataKey: 'col1',
  },
  {
    header: 'Yield Strategies',
    dataKey: 'col2',
  },
  {
    header: 'Deposit Amount',
    dataKey: 'col3',
  },
  {
    header: 'Available Credit',
    dataKey: 'col4',
  },
  {
    header: 'Borrowed Amount',
    dataKey: 'col5',
  },
  {
    header: undefined,
    dataKey: 'col6',
  },
];

export const rows = [
  {
    col1: 'alUsd',
    col2: '6',
    col3: '161.5',
    col4: '30.3',
    col5: '50.2',
    col6: 'View',
  },
  {
    col1: 'alUsd',
    col2: '6',
    col3: '161.5',
    col4: '30.3',
    col5: '50.2',
    col6: 'View',
  },
];

const headerGroups = columns.map((col) => ({
  headers: [{ header: col.header }],
}));

const tableRows = rows.map((row) => ({
  cells: Object.keys(row).map((rowCell) => ({ data: row[rowCell] })),
}));

const colNumber = columns.length;

const handleRow = (idx) => (idx % 2 === 0 ? 'bg-grey10' : 'bg-grey15');
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
          <th>{header && header.header}</th>
        {/each}
      </tr>
    {/each}
  </thead>

  <tbody>
    {#each tableRows as row, i}
      <tr
        class="flex justify-items-center items-center h-16 grid grid-cols-{colNumber} {handleRow(
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
