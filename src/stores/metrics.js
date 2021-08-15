import { writable } from 'svelte/store';

const METRICS = {
  millions: 'm',
  billions: 'bn',
};

const CURRENCIES = {
  dollar: '$',
};

const metrics = writable({
  global: {
    globalMintableDebt: {
      label: 'Global Mintable Debt',
      value: 100.1,
      metric: METRICS.millions,
      currency: CURRENCIES.dollar,
      percentChanged: 2.82,
      percentChangedIsIncrease: true,
    },
    globalTVL: {
      label: 'Global TVL',
      value: 2.5,
      metric: METRICS.billions,
      currency: CURRENCIES.dollar,
      percentChanged: 2.82,
      percentChangedIsIncrease: true,
    },
    globalDebt: {
      label: 'Global Debt',
      value: 1.05,
      metric: METRICS.billions,
      currency: CURRENCIES.dollar,
      percentChanged: 2.82,
      percentChangedIsIncrease: true,
    },
    alcxValue: {
      label: 'ACLX Value',
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
});

export default metrics;
