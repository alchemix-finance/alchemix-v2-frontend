import { AlcxStore } from '@stores/v2/alcxStore';
import {
  fetchDataForETH,
  fetchDataForToken,
  generateTokenPromises,
  getFullTokenList,
} from '@stores/v2/helpers';
import {
  updateAllBalances,
  updateAllTokens,
  updateOneBalance,
  updateVaultDebt,
  updateVaultRatio,
} from '@stores/v2/methods';
import { contractWrapper } from '@helpers/contractWrapper';
import { VaultConstants } from '@stores/v2/constants';
import { VaultTypes } from '@stores/v2/types';

export async function fetchVaultTokens(store: AlcxStore, vaultId: VaultTypes) {
  if (!store.provider) {
    console.error(`[fetchVaultTokens]: store.provider is undefined`);
    return Promise.reject(`[fetchVaultTokens]: store.provider is undefined`);
  }

  const { instance } = contractWrapper(
    VaultConstants[vaultId].alchemistContractSelector,
    store.provider.getSigner(),
  );

  const yieldTokens = await instance.getSupportedYieldTokens();
  const underlyingTokens = await instance.getSupportedUnderlyingTokens();

  updateAllTokens(vaultId, yieldTokens, underlyingTokens);
}

export async function fetchAllBalances(store: AlcxStore) {
  if (!store.provider) {
    console.error(`[fetchAllBalances]: store.provider is undefined`);
    return Promise.reject(`[fetchAllBalances]: store.provider is undefined`);
  }

  const fetchETHPromise = fetchDataForETH(store.provider.getSigner());
  const fetchTokensPromises = generateTokenPromises(
    getFullTokenList(store.tokens),
    store.provider.getSigner(),
  );
  //
  return Promise.all([fetchETHPromise, ...fetchTokensPromises]).then((balances) => {
    updateAllBalances([...balances]);
  });
}

export async function fetchBalanceByAddress(store: AlcxStore, address: string) {
  if (!store.provider) {
    console.error(`[fetchBalanceByAddress]: store.provider is undefined`);
    return Promise.reject(`[fetchAllBalances]: store.provider is undefined`);
  }

  if (address === '0xETH') {
    const ethData = await fetchDataForETH(store.provider.getSigner());
    updateOneBalance(address, ethData.balance);
  } else {
    const erc20Data = await fetchDataForToken(address, store.provider.getSigner());
    updateOneBalance(address, erc20Data.balance);
  }
}

export async function fetchVaultDebt(store: AlcxStore, vaultId: VaultTypes, accountAddress: string) {
  if (!store.provider) {
    console.error(`[fetchVaultDebt]: store.provider is undefined`);
    return Promise.reject(`[fetchVaultDebt]: store.provider is undefined`);
  }

  const { instance } = contractWrapper(
    VaultConstants[vaultId].alchemistContractSelector,
    store.provider.getSigner(),
  );

  const rawDebt = await instance.accounts(accountAddress);

  updateVaultDebt(vaultId, rawDebt);
}

export async function fetchVaultRatio(store: AlcxStore, vaultId: VaultTypes) {
  if (!store.provider) {
    console.error(`[fetchVaultDebt]: store.provider is undefined`);
    return Promise.reject(`[fetchVaultDebt]: store.provider is undefined`);
  }

  const { instance } = contractWrapper(
    VaultConstants[vaultId].alchemistContractSelector,
    store.provider.getSigner(),
  );

  const rawRatio = await instance.minimumCollateralization();

  updateVaultRatio(vaultId, rawRatio);
}
