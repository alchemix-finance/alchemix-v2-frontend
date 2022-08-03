<script>
  import { getColumnWidth, SORT_ORDERS, sortTableRows } from '@helpers/table';
  import settings from '@stores/settings';

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

  // headerGroups are groups of header
  // TODO: support multiple headers like on https://codesandbox.io/s/github/tannerlinsley/react-table/tree/master/examples/sorting?file=/src/App.js:0-65
  $: headerGroups = columns.map((col) => ({
    colSize: col.colSize,
    headers: [{ value: col.value, ...col }],
  }));

  // parse provided row data to internal data structure
  // let sortedRows;
  $: tableRows = rows.map((row, i) => ({
    cells: Object.keys(row).map((columnId) => ({
      columnId,
      ...row[columnId],
    })),
    rowId: i,
  }));

  $: sortedRows = rows.map((row, i) => ({
    cells: Object.keys(row).map((columnId) => ({
      columnId,
      ...row[columnId],
    })),
    rowId: i,
  }));

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

<table class="w-full">
  <thead
    class="flex justify-items-center items-center {$settings.invertColors
      ? 'bg-grey15inverse'
      : 'bg-grey15'} h-16"
  >
    {#if headerGroups.length > 0}
      {#each headerGroups as headerGroup}
        <tr class="{getColumnWidth(headerGroup.colSize)} flex justify-center">
          {#if headerGroup.headers.length > 0}
            {#each headerGroup.headers as header}
              <th>
                <TableHeaderCell header="{header}" />
              </th>
            {/each}
          {/if}
        </tr>
      {/each}
    {/if}
  </thead>

  <tbody>
    {#if sortedRows.length > 0}
      {#each sortedRows as row, index}
        <TableBodyRow index="{index}" row="{row}" />
      {/each}
    {/if}
  </tbody>
</table>
