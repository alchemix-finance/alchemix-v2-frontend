import { writable } from 'svelte/store';

const settings = writable({
  allCurrencies: [
    {
      symbol: 'USD',
      ticker: '$',
    },
    {
      symbol: 'EUR',
      ticker: '€',
    },
    {
      symbol: 'JPY',
      ticker: '¥',
    },
    {
      symbol: 'AUD',
      ticker: '$',
    },
  ],
  baseCurrency: {
    symbol: 'USD',
    ticker: '$',
  },
});

export default settings;
