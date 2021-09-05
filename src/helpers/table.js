export const SORT_ORDERS = {
  asc: 'asc',
  desc: 'desc',
};

const isString = (string) => typeof string === 'string';
const isNumber = (number) => typeof number === 'number';

export const sortTableRows = ({ columnKey, rows, sortOrder }) =>
  rows.sort((rowA, rowB) => {
    const cellA = rowA.cells.find((cell) => cell.dataKey === columnKey);
    const cellB = rowB.cells.find((cell) => cell.dataKey === columnKey);

    if (isString(cellA.data) && isString(cellB.data)) {
      if (sortOrder === SORT_ORDERS.asc) {
        return cellB.data.localeCompare(cellA.data);
      }

      return cellA.data.localeCompare(cellB.data);
    }

    if (isNumber(cellA.data) && isNumber(cellB.data)) {
      if (sortOrder === SORT_ORDERS.asc) {
        return cellB.data > cellA.data;
      }

      return cellA.data > cellB.data;
    }

    throw new Error('cell data must be a string or number');
  });
