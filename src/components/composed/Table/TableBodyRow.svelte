<script>
import TableCell from './TableCell.svelte';

export let colNumber = 1;
export let row = {};
export let index = undefined;

let expandedRows = new Set();

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

let expandedRowCell = row.cells.find((cell) => cell.data.expandedRow);

$: isExpanded = expandedRows.has(row.rowId);

$: if (isExpanded) {
  // re-render to account for rows being re-ordered
  expandedRowCell = row.cells.find((cell) => cell.data.expandedRow);
}

const ExpandedRowComponent = expandedRowCell && expandedRowCell.data.expandedRow.ExpandedRowComponent;

$: if (isExpanded && !ExpandedRowComponent) {
  throw new Error('Row needs an ExpandedRowComponent when expanded');
}

const rowBg = (idx) => (idx % 2 === 0 ? 'bg-grey10' : 'bg-grey15');
</script>

<tr class="flex justify-items-center items-center h-16 grid grid-cols-{colNumber} {rowBg(index)}">
  {#each row.cells as cell}
    <td>
      <TableCell {...cell} row="{row}" rowIndex="{index}" onExpand="{onExpand}" />
    </td>
  {/each}
</tr>

{#if isExpanded && ExpandedRowComponent}
  <tr class="flex justify-items-center items-center h-16 grid grid-cols-1 {rowBg(index)}">
    <ExpandedRowComponent {...expandedRowCell.data} />
  </tr>
{/if}
