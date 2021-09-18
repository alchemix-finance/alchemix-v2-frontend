export const SORT_ORDERS = {
  asc: 'asc',
  desc: 'desc',
};

const isString = (string) => typeof string === 'string';
const isNumber = (number) => typeof number === 'number';

export const sortTableRows = ({ columnKey, rows, sortOrder }) =>
  /* eslint-disable implicit-arrow-linebreak */
  rows.sort((rowA, rowB) => {
    /* eslint-enable implicit-arrow-linebreak */
    const cellA = rowA.cells.find((cell) => cell.columnId === columnKey);
    const cellB = rowB.cells.find((cell) => cell.columnId === columnKey);

    const valueA = cellA.data.value;
    const valueB = cellB.data.value;

    if (isString(valueA) && isString(valueB)) {
      if (sortOrder === SORT_ORDERS.asc) {
        return valueB.localeCompare(valueA);
      }

      return valueA.localeCompare(valueB);
    }

    if (isNumber(valueA) && isNumber(valueB)) {
      if (sortOrder === SORT_ORDERS.asc) {
        return valueB > valueA;
      }

      return valueA > valueB;
    }

    throw new Error('cell data must be a string or number');
  });

// alternate rows light/dark grey
export const getRowBgClass = (idx) => (idx % 2 === 0 ? 'bg-grey10' : 'bg-grey15');
