<script>
  import TableCell from './TableCell.svelte';
  import { getColumnWidth } from '@helpers/table';

  export let numberOfColumns = 1;
  export let row = {};
  export let index = undefined;

  let expandedRows = new Set();

  /*
   * Expand a given row to display row.expandedRow.ExpandedRowComponent
   */
  const onExpand = (rowId) => {
    if (rowId === row.rowId) {
      if (expandedRows.has(rowId)) {
        expandedRows.delete(rowId);
      } else {
        expandedRows.add(rowId);
      }

      // re-render expanded rows
      expandedRows = expandedRows;
    }
  };

  let expandedRowCell = row.cells.find((cell) => cell.expandedRow);
  $: isExpanded = expandedRows.has(row.rowId);
  $: if (isExpanded) {
    // re-render to account for rows being re-ordered
    expandedRowCell = row.cells.find((cell) => cell.expandedRow);
  }

  const ExpandedRowComponent = expandedRowCell && expandedRowCell.expandedRow.ExpandedRowComponent;

  $: if (isExpanded && !ExpandedRowComponent) {
    throw new Error('Row needs an ExpandedRowComponent when expanded');
  }

  $: console.log(row.cells);
</script>

<style>
  td {
    display: flex;
  }
</style>

<tr
  class="flex justify-items-center items-center bg-grey15 {isExpanded
    ? 'pt-4'
    : 'py-4 border-b border-grey10'}"
>
  {#each row.cells as cell}
    <td class="{getColumnWidth(cell.colSize)} {cell.alignment || 'justify-center'}">
      <TableCell {...cell} row="{row}" rowIndex="{index}" onExpand="{onExpand}" isExpanded="{isExpanded}" />
    </td>
  {/each}
</tr>

{#if isExpanded && ExpandedRowComponent}
  <tr class="flex min-h-16 grid grid-cols-1 bg-grey15">
    <ExpandedRowComponent {...expandedRowCell} />
  </tr>
{/if}
