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
});

export default global;
