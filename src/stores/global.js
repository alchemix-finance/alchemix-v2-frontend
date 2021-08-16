import { writable } from 'svelte/store';

const global = writable({
  loading: false,
  alert: {
    type: undefined,
    message: undefined,
  },
  fiatRates: undefined,
  conversionRate: 1,
  tokenPrices: [],
  gasPrices: {
    standard: 0,
    fast: 0,
    instant: 0,
  },
  gasColor: {
    standard: 'green3',
    fast: 'orange1',
    instant: 'red1',
  },
  languages: [
    {
      name: 'English',
      locale: 'en-US',
    },
    {
      name: 'German',
      locale: 'de-DE',
    },
  ],
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
});

export default global;
