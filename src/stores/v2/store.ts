import { derived, Readable, Writable, writable } from 'svelte/store';
import { ethers, providers } from 'ethers';
import { AsyncStoreType, StoreState, VaultType } from '@stores/v2/types';
import { createAsyncDerivator, createDerivator } from '@stores/v2/helpers';

export type StoreType = {
  accountAddress: string;
  provider: providers.Web3Provider;
  balances: AsyncStoreType<any[]>;
  tokens: AsyncStoreType<{
    [key in VaultType]?: {
      yieldTokens: any[];
      uyTokens: any[];
    };
  }>;
};

/*
 *  [1]: []
 *  [2]: []
 * */

export const rawStore = writable<StoreType>({
  accountAddress: '',
  provider: undefined,
  balances: { status: StoreState.LOADING, value: [] },
  tokens: { status: StoreState.LOADING, value: {} },
});

export default {
  address: [createDerivator<StoreType, string>(rawStore, 'accountAddress')],
  provider: [createDerivator<StoreType, providers.Web3Provider>(rawStore, 'provider')],
  balances: [
    createAsyncDerivator<StoreType, any[]>(rawStore, 'balances', 'value'),
    createAsyncDerivator<StoreType, StoreState>(rawStore, 'balances', 'status'),
  ],
};
