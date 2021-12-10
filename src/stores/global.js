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
    standard: { maxFeePerGas: 0, baseFeePerGas: 0, maxPriorityFeePerGas: 0 },
    fast: { maxFeePerGas: 0, baseFeePerGas: 0, maxPriorityFeePerGas: 0 },
    instant: { maxFeePerGas: 0, baseFeePerGas: 0, maxPriorityFeePerGas: 0 },
  },
  gasColor: {
    standard: 'green3',
    fast: 'orange1',
    instant: 'red1',
  },
  languages: [
    {
      name: 'English',
      locale: 'en',
    },
    {
      name: 'Farsi',
      locale: 'fa',
    },
    {
      name: 'German',
      locale: 'de',
    },
    {
      name: 'Italian',
      locale: 'it',
    },
    {
      name: 'Russian',
      locale: 'ru',
    },
    {
      name: 'Spanish',
      locale: 'es',
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
