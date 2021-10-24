<script>
import TableCell from './TableCell.svelte';
import { getColumnWidth, getRowBgClass } from '../../../helpers/table';

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
</script>

<style>
td {
  justify-content: center;
  display: flex;
}
</style>

<tr class="flex justify-items-center items-center {getRowBgClass(index)}">
  {#each row.cells as cell, i}
    <td class="{getColumnWidth(cell.colSize)}">
      <TableCell {...cell} row="{row}" rowIndex="{index}" onExpand="{onExpand}" isExpanded="{isExpanded}" />
    </td>
  {/each}
</tr>

{#if isExpanded && ExpandedRowComponent}
  <tr class="flex min-h-16 grid grid-cols-1 {getRowBgClass(index)}">
    <ExpandedRowComponent {...expandedRowCell} />
  </tr>
{/if}
