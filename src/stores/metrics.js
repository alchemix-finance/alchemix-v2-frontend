import { writable } from 'svelte/store';

const METRICS = {
  millions: 'm',
  billions: 'bn',
};

const CURRENCIES = {
  dollar: '$',
};

const defaults = {
  global: {
    globalMintableDebt: {
      label: 'Global Mintable Debt',
      value: 100.1,
      metric: METRICS.millions,
      currency: CURRENCIES.dollar,
      percentChanged: 0,
      percentChangedIsIncrease: true,
    },
    globalTVL: {
      label: 'Outstanding Debt',
      value: 2.5,
      metric: METRICS.billions,
      currency: CURRENCIES.dollar,
      percentChanged: 2.82,
      percentChangedIsIncrease: true,
    },
    globalDebt: {
      label: 'Open Credit Balance',
      value: 1.05,
      metric: METRICS.billions,
      currency: CURRENCIES.dollar,
      percentChanged: 2.82,
      percentChangedIsIncrease: true,
    },
    alcxValue: {
      label: 'ALCX value',
      value: 1463,
      metric: METRICS.billions,
      currency: CURRENCIES.dollar,
      percentChanged: 2.82,
      percentChangedIsIncrease: false,
    },
  },
  account: {
    APY: 345.23,
    estimatedMaturity: '12/29/2022',
  },
};

const metrics = writable({
  ...defaults,
});

export const metricsReset = () => {
  metrics.set({ ...defaults });
};

export default metrics;
