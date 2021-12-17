import { writable } from 'svelte/store';

const stakingPools = writable({
  fetching: true,
  active: [],
  retired: [],
});

export const poolLookup = [
  {
    address: '0xbc6da0fe9ad5f3b0d58160288917aa56653660e9',
    title: 'alUSD',
    subtitle: 'Alchemix alUSD',
    farmIcon: 'alusd_med.svg',
    tokenIcon: undefined,
  },
  {
    address: '0xdbdb4d16eda451d0503b854cf79d55697f90c8df',
    title: 'ALCX',
    subtitle: 'Alchemix ALCX',
    farmIcon: undefined,
    tokenIcon: undefined,
  },
  {
    address: '0xc3f279090a47e80990fe3a9c30d24cb117ef91a8',
    title: 'ALCX/ETH v1',
    subtitle: 'SushiSwap LP',
    farmIcon: undefined,
    tokenIcon: 'sushi',
  },
  {
    address: '0x43b4fdfd4ff969587185cdb6f0bd875c5fc83f8c',
    title: 'alUSD3CRV',
    subtitle: 'Convex',
    farmIcon: 'alusd_med.svg',
    tokenIcon: 'crv',
  },
  {
    address: '0xc9da65931abf0ed1b74ce5ad8c041c4220940368',
    title: 'Saddle alETH',
    subtitle: 'Saddle LP',
    farmIcon: undefined,
    tokenIcon: 'saddle',
  },
  {
    address: '0xc4c319e2d4d66cca4464c0c2b32c9bd23ebe784e',
    title: 'alETH Curve',
    subtitle: 'Convex',
    farmIcon: undefined,
    tokenIcon: 'crv',
  },
];

export default stakingPools;
