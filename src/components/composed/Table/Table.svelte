<script>
import { SORT_ORDERS, sortTableRows } from '../../../helpers/table';

import TableBodyRow from './TableBodyRow.svelte';
import TableHeaderCell from './TableHeaderCell.svelte';

/*
  Table component

  Render: <Table rows="{rows}" columns="{columns}" />

  Rows is an array of rows.
  Each row can define what cell component it should use and additional props
  For example: [
    {
      column1: {
        CellComponent: SomeCellComponent
        expandedRow: {
          ExpandedRowComponent: SomeComponent,
          value|props
        }
        value|props
      }
    },
    {
      column2: {
        CellComponent: SomeCellComponent
        expandedRow: optional { ExpandedRowComponent: SomeComponent, value|props }
        value|props
      }
    }
  ]
*/

export let rows = [];
export let columns = [];

const numberOfColumns = columns.length;

// headerGroups are groups of header
// TODO: support multiple headers like on https://codesandbox.io/s/github/tannerlinsley/react-table/tree/master/examples/sorting?file=/src/App.js:0-65
const headerGroups = columns.map((col) => ({
  width: col.width,
  headers: [{ value: col.value, ...col }],
}));

// parse provided row data to internal data structure
let tableRows = rows.map((row, i) => ({
  cells: Object.keys(row).map((columnId) => ({
    columnId,
    ...row[columnId],
  })),
  rowId: i,
}));
$: sortedRows = tableRows;

// TODO: Sorting needs to be debugged and is not yet supported
let defaultSortOrder = SORT_ORDERS.asc;
$: sortOrder = defaultSortOrder;

/**
 * Sort the table rows and re-render
 * @param columnKey
 */
const sortBy = (columnKey) => {
  tableRows = sortTableRows({ columnKey, rows: tableRows, sortOrder });
  sortOrder = sortOrder === SORT_ORDERS.asc ? SORT_ORDERS.desc : SORT_ORDERS.asc;
};
</script>

<style>
/*
Assuming min col of 48px, each with is col.width * 48
We could use scss mixin to not hard-code this and support any column width
This currently only supports 8 columns
*/
.col-1 {
  flex-basis: 48px !important;
  flex-grow: 1 !important;
  min-width: 48px;
}
.col-2 {
  flex-basis: 96px !important;
  flex-grow: 2 !important;
  min-width: 96px;
}
.col-3 {
  flex-basis: 144px !important;
  flex-grow: 3 !important;
  min-width: 144px;
}
.col-4 {
  flex-basis: 192px !important;
  flex-grow: 4 !important;
  min-width: 192px;
}
.col-5 {
  flex-basis: 240px !important;
  flex-grow: 5 !important;
  min-width: 240px;
}
.col-6 {
  flex-basis: 288px !important;
  flex-grow: 6 !important;
  min-width: 288px;
}
.col-7 {
  flex-basis: 336px !important;
  flex-grow: 7 !important;
  min-width: 336px;
}
.col-8 {
  flex-basis: 384px !important;
  flex-grow: 8 !important;
  min-width: 384px;
}
tr {
  justify-content: center;
  display: flex;
}
</style>

<table class="border border-grey10 border-4 rounded">
  <thead class="flex justify-items-center items-center bg-grey15 h-16">
    {#each headerGroups as headerGroup}
      <tr class="col-{headerGroup.width}">
        {#each headerGroup.headers as header}
          <th>
            <TableHeaderCell header="{header}" onClickSortBy="{sortBy}" sortOrder="{sortOrder}" />
          </th>
        {/each}
      </tr>
    {/each}
  </thead>

  <tbody>
    {#each sortedRows as row, index}
      <TableBodyRow index="{index}" row="{row}" numberOfColumns="{numberOfColumns}" />
    {/each}
  </tbody>
</table>
