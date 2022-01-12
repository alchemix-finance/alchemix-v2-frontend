<script>
import { getColumnWidth, SORT_ORDERS, sortTableRows } from '../../../helpers/table';

import TableBodyRow from './TableBodyRow.svelte';
import TableHeaderCell from './TableHeaderCell.svelte';

/*
 * Table component
 *
 * Render: <Table rows="{rows}" columns="{columns}" />
 *
 * Rows is an array of rows.
 * Each row can define what cell component it should use and additional props
 * For example: [
 *   {
 *     column1: {
 *       CellComponent: SomeCellComponent
 *       expandedRow: {
 *         ExpandedRowComponent: SomeComponent,
 *         value|props
 *       }
 *       value|props
 *     }
 *   },
 *   {
 *     column2: {
 *       CellComponent: SomeCellComponent
 *       expandedRow: optional { ExpandedRowComponent: SomeComponent, value|props }
 *       value|props
 *     }
 *   }
 * ]
 * */

export let rows = [];
export let columns = [];
export let key;

const numberOfColumns = columns.length;

// headerGroups are groups of header
// TODO: support multiple headers like on https://codesandbox.io/s/github/tannerlinsley/react-table/tree/master/examples/sorting?file=/src/App.js:0-65
const headerGroups = columns.map((col) => ({
  colSize: col.colSize,
  headers: [{ value: col.value, ...col }],
}));

// parse provided row data to internal data structure
let sortedRows;
let tableRows = rows.map((row, i) => ({
  cells: Object.keys(row).map((columnId) => ({
    columnId,
    ...row[columnId],
  })),
  rowId: i,
}));

// FIXME the way that tableRows/sortedRows is originally constructed kills reactivity

const redoRows = () => {
  tableRows = rows.map((row, i) => ({
    cells: Object.keys(row).map((columnId) => ({
      columnId,
      ...row[columnId],
    })),
    rowId: i,
  }));
};

$: key, (sortedRows = tableRows);

// $: sortedRows = tableRows;

// TODO: Sorting needs to be debugged and is not yet supported
let defaultSortOrder = SORT_ORDERS.asc;
$: sortOrder = defaultSortOrder;

$: key, console.log('key changed in table', key);
$: key, redoRows();

/**
 * Sort the table rows and re-render
 * @param columnKey
 */
const sortBy = (columnKey) => {
  tableRows = sortTableRows({ columnKey, rows: tableRows, sortOrder });
  sortOrder = sortOrder === SORT_ORDERS.asc ? SORT_ORDERS.desc : SORT_ORDERS.asc;
};
</script>

<table class="w-full">
  <thead class="flex justify-items-center items-center bg-grey15 h-16">
    {#each headerGroups as headerGroup}
      <tr class="{getColumnWidth(headerGroup.colSize)} flex justify-center">
        {#each headerGroup.headers as header}
          <th>
            <TableHeaderCell header="{header}" onClickSortBy="{sortBy}" sortOrder="{sortOrder}" />
          </th>
        {/each}
      </tr>
    {/each}
  </thead>

  <tbody>
    {#each tableRows as row, index (key)}
      <TableBodyRow index="{index}" row="{row}" numberOfColumns="{numberOfColumns}" key="{key}" />
    {/each}
  </tbody>
</table>
