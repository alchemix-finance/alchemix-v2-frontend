/*
* export const poolLookup = [
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
  // {
  //   address: '0xD3B5D9a561c293Fb42b446FE7e237DaA9BF9AA84',
  //   title: 'tALCX',
  //   subtitle: 'Tokemak',
  //   farmIcon: undefined,
  //   tokenIcon: 'talcx',
  // },
];
* */

import { FarmTypes } from '@stores/v2/types';

export const FarmsList = {
  '0xbc6da0fe9ad5f3b0d58160288917aa56653660e9': {
    name: 'alUSD',
    type: FarmTypes.INTERNAL,
    status: 0,
  },
  '0xdbdb4d16eda451d0503b854cf79d55697f90c8df': {
    name: 'ALCX',
    type: FarmTypes.INTERNAL,
    status: 0,
  },
  '0xc3f279090a47e80990fe3a9c30d24cb117ef91a8': {
    name: 'ALCX/ETH v1',
    type: FarmTypes.INTERNAL,
    status: 0,
  },
  '0x43b4fdfd4ff969587185cdb6f0bd875c5fc83f8c': {
    name: 'alUSD3CRV',
    type: FarmTypes.INTERNAL,
    status: 0,
  },
  '0xc9da65931abf0ed1b74ce5ad8c041c4220940368': {
    name: 'Saddle alETH',
    type: FarmTypes.INTERNAL,
    status: 0,
  },
  '0xc4c319e2d4d66cca4464c0c2b32c9bd23ebe784e': {
    name: 'alETH Curve',
    type: FarmTypes.INTERNAL,
    status: 0,
  },
};
