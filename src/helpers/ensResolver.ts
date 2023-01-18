import { getProvider } from './walletManager';
import { networkStore } from '@stores/v2/alcxStore';
import { get } from 'svelte/store';

export async function reverseLookup(address: string) {
  const provider = getProvider(get(networkStore));
  const lookup = await provider.lookupAddress(address);
  return !!lookup ? lookup : address;
}
