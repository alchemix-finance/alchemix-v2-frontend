<script>
import { SORT_ORDERS } from '../../../helpers/table';

export let sortBy;
export let sortOrder = undefined;
export let header;

let sortCol = undefined;

$: _sortingColumn = sortCol;
$: _sortOrder = sortOrder;

const getSortByIcon = ({ useSortBy, dataKey, sortingColumn, sortOrder }) => {
  if (typeof useSortBy === 'undefined') {
    return '';
  }

  if (dataKey === sortingColumn && sortOrder === SORT_ORDERS.desc) {
    return '🔼';
  }

  return '🔽';
};

const handleClick = (dataKey) => {
  sortBy(dataKey);
  sortCol = dataKey;
};
</script>

<button on:click="{() => handleClick(header.dataKey)}">
  {header && header.header}
  {getSortByIcon({
    useSortBy: header.useSortBy,
    dataKey: header.dataKey,
    sortingColumn: _sortingColumn,
    sortOrder: _sortOrder,
  })}
</button>
