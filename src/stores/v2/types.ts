export enum VaultType {
  alUSD,
  alETH,
}

export enum StoreState {
  LOADING = 0,
  LOADED = 1,
  ERROR = 2,
}

export type AsyncStoreType<T> = {
  status: StoreState;
  value: T;
};

export const makeDefaultValue = <T>(defaultValue: T): AsyncStoreType<T> => {
  return { status: StoreState.LOADING, value: defaultValue };
};
