import { writable } from 'svelte/store';

const defaults = {
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
    {
      name: 'Brazilian',
      locale: 'br',
    },
    {
      name: 'Chook',
      locale: 'aussie',
    },
    {
      name: 'Dutch',
      locale: 'nl',
    },
    {
      name: 'French',
      locale: 'fr',
    },
    {
      name: 'Greek',
      locale: 'gr',
    },
    {
      name: 'Hungarian',
      locale: 'hu',
    },
    {
      name: 'Latvian',
      locale: 'lv',
    },
    {
      name: 'Persian',
      locale: 'pr',
    },
    {
      name: 'Portuguese',
      locale: 'pt',
    },
    {
      name: 'Turkish',
      locale: 'tr',
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
      symbol: 'GBP',
      ticker: '£',
    },
    {
      symbol: 'AUD',
      ticker: '$',
    },
    {
      symbol: 'ETH',
      ticker: 'Ξ',
    },
  ],
};

const global = writable({
  ...defaults,
});

export const globalReset = () => {
  global.set({ ...defaults });
};

export default global;
