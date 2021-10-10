<script>
import TableCell from './TableCell.svelte';
import { getRowBgClass } from '../../../helpers/table';

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
/* Copy-pasted from Table.svelte -- TODO: figure out how to re-use/import styles */
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
td {
  justify-content: center;
  display: flex;
}
</style>

<tr class="flex justify-items-center items-center {getRowBgClass(index)}">
  {#each row.cells as cell, i}
    <td class="col-{cell.width}">
      <TableCell {...cell} row="{row}" rowIndex="{index}" onExpand="{onExpand}" isExpanded="{isExpanded}" />
    </td>
  {/each}
</tr>

{#if isExpanded && ExpandedRowComponent}
  <tr class="flex min-h-16 grid grid-cols-1 {getRowBgClass(index)}">
    <ExpandedRowComponent {...expandedRowCell} />
  </tr>
{/if}
