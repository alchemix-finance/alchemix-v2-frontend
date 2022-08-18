<script>
  import { SORT_ORDERS } from '../../../helpers/table';
  import TableCell from './TableCell.svelte';

  // export let onClickSortBy;
  // export let sortOrder = undefined;
  export let header;

  // let sortCol = undefined;
  // $: _sortingColumn = sortCol;
  // $: _sortOrder = sortOrder;

  // const getSortByIcon = ({ isSortable, columnId, sortingColumn, sortOrder }) => {
  //   if (typeof isSortable === 'undefined') {
  //     return '';
  //   }
  //
  //   if (columnId === sortingColumn && sortOrder === SORT_ORDERS.desc) {
  //     return '🔼';
  //   }
  //
  //   return '🔽';
  // };

  // const handleClick = (columnId) => {
  //   onClickSortBy(columnId);
  //   sortCol = columnId;
  // };
</script>

<!-- TODO: Debug the case where expanded rows only appear at the index they were expanded when sorting  -->
<!--<button on:click="{() => handleClick(header.columnId)}">-->
<!--  {header && header.header}-->
<!--  {getSortByIcon({-->
<!--    isSortable: header.isSortable,-->
<!--    columnId: header.columnId,-->
<!--    sortingColumn: _sortingColumn,-->
<!--    sortOrder: _sortOrder,-->
<!--  })}-->
<!--</button>-->

<div >
  <TableCell {...header} />
</div>
