import { derived, Readable } from 'svelte/store';

export const createDerivator = <T, S>(store: Readable<T>, key: string): Readable<S> => {
  return derived(store, ($store) => $store[key]);
};

export const getDerivator = <T>(selector: T[]) => selector[0];
export const getAsyncDerivator = <T>(selector: T[]) => ({ value: selector[0], status: selector[1] });

export const createAsyncDerivator = <T, S>(
  store: Readable<T>,
  key: string,
  returnKey: 'status' | 'value',
): Readable<S> => {
  return derived(store, ($store) => $store[key][returnKey]);
};
