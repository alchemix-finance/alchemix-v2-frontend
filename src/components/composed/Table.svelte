<script>
//TODO: Get live token data
//Consolidate table structure into object w/pointers, functionally return values
//based on locally sourced parameters

//filler content
export const junkContent = [
  'Sushi',
  'ETH',
  '50%',
  '35%',
  'Gandalf',
  '12/05/2021',
  '$1.5M',
  '$500,000',
];

//Example details of asset callback
const alAssets = [
  {
    name: 'Alchemix USD',
    ticker: 'alUSD',
    price: 0.99,
    icon: 'alusd.png',
    color: 'bronze2',
    index: 0,
  },
  {
    name: 'Alchemix ETH',
    ticker: 'alETH',
    price: 2171.88,
    icon: 'aleth.png',
    color: 'blue3',
    index: 1,
  },
  {
    name: 'Alchemix BTC',
    ticker: 'SUSHI',
    price: 34096.11,
    icon: 'albtc.png',
    color: 'orange1',
    index: 2,
  },
];

export const exampleCategories = [
  'STRATEGY',
  'COLLATERAL',
  'APY',
  'VAULT APY',
  'ALCHEMIST',
  'START DATE',
  'TVL',
  'DEPOSITED',
];

//tableStruct is designed to take in data directly or via callback functions.
//const declaration means mutability can be reduced

//endColumnFormatter(): mix and match any pre-defined elements by referencing
//an Object containing HTML
const endColumnFormatter = function (el1, el2) {
  //separate config for last column into its own set of values, allowing for future modifications

  const lastColumnConfig = {
    rowHeaders: {
      tooltip: '<img class="h-8" src="./images/tooltipIcon.png"/>',
    },
    rowContents: {
      favorite: '<p>star</p>',
    },
  };
  //current example return value
  return [lastColumnConfig.rowHeaders[el1], lastColumnConfig.rowContents[el2]];
};
//TODO - replace example list arrays with API callback functions
const tableStruct = {
  expandable: true,
  endColumn: endColumnFormatter('tooltip', 'favorite'),
  categories: exampleCategories,
  assetsInfo: alAssets,
  assetsContent: junkContent,
};

const handleRow = function (idx) {
  return idx % 2 == 0 ? 'bg-grey10' : 'bg-grey15';
};
</script>

