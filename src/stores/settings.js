import { writable } from 'svelte/store';

const settings = writable({
  baseCurrency: {
    symbol: 'USD',
    ticker: '$',
  },
  userLanguage: {
    name: 'English',
    locale: 'en-US',
  },
  defaultGas: 'standard',
});

export default settings;
