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

/*
  The width of each column can be defined using the `colSize` property
  Sizes go from 1 (48px) to 8 (384px)
 */

export const getFlexBasisForColSize = (colSize) =>
  /* eslint-disable */
  ({
    /* eslint-enable */
    1: 'flex-basis-w-48',
    2: 'flex-basis-w-96',
    3: 'flex-basis-w-144',
    4: 'flex-basis-w-192',
    5: 'flex-basis-w-240',
    6: 'flex-basis-w-288',
    7: 'flex-basis-w-336',
    8: 'flex-basis-w-384',
  }[colSize]);

export const getFlexGrowForColSize = (colSize) =>
  /* eslint-disable */
  ({
    /* eslint-enable */
    1: 'flex-grow-1',
    2: 'flex-grow-2',
    3: 'flex-grow-3',
    4: 'flex-grow-4',
    5: 'flex-grow-5',
    6: 'flex-grow-6',
    7: 'flex-grow-7',
    8: 'flex-grow-8',
  }[colSize]);

export const getWidthForColSize = (colSize) =>
  /* eslint-disable */
  ({
    /* eslint-enable */
    1: 'w-12',
    2: 'w-24',
    3: 'w-36',
    4: 'w-48',
    5: 'w-60',
    6: 'w-72',
    7: 'w-84',
    8: 'w-96',
  }[colSize]);

export const getColumnWidth = (colSize) =>
  `${getFlexBasisForColSize(colSize)} ${getFlexGrowForColSize(colSize)} ${getWidthForColSize(colSize)}`; // eslint-disable-line
