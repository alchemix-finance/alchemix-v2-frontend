import { writable } from 'svelte/store';

const defaults = {
  fetching: true,
  pools: 0,
  allPools: [],
  active: [],
  retired: [],
};

const stakingPools = writable({
  ...defaults,
});

export const stakingPoolsReset = () => {
  stakingPools.set({ ...defaults });
};

export const additionalTokens = ['0x93Dede06AE3B5590aF1d4c111BC54C3f717E4b35'];

export const externalLookup = [
  {
    // SushiSwap MasterChef V2
    address: '0xEF0881eC094552b2e128Cf945EF17a6752B4Ec5d',
    token: '0xC3f279090a47e80990Fe3a9c30d24Cb117EF91a8',
    title: 'ALCX/ETH v2',
    subtitle: 'SushiSwap LP',
    farmIcon: undefined,
    tokenIcon: 'sushi',
  },
  {
    // Curve alUSD3CRV
    address: '0x43b4fdfd4ff969587185cdb6f0bd875c5fc83f8c',
    title: 'alUSD3CRV v2',
    subtitle: 'Curve alUSD Metapool',
    farmIcon: 'alusd_med.svg',
    tokenIcon: 'crv',
  },
];

export const poolLookup = [
  {
    address: '0xbc6da0fe9ad5f3b0d58160288917aa56653660e9',
    title: 'alUSD',
    subtitle: 'Alchemix alUSD',
    farmIcon: 'alusd_med.svg',
    tokenIcon: undefined,
  },
  {
    address: '0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6',
    title: 'alETH',
    subtitle: 'Alchemix alETH',
    farmIcon: 'aleth_med.svg',
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
    subtitle: 'Curve alUSD Metapool',
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
    subtitle: 'Curve alETH Metapool',
    farmIcon: undefined,
    tokenIcon: 'crv',
  },
  {
    address: '0xD3B5D9a561c293Fb42b446FE7e237DaA9BF9AA84',
    title: 'tALCX',
    subtitle: 'Tokemak',
    farmIcon: undefined,
    tokenIcon: 'talcx',
  },
];

export default stakingPools;
