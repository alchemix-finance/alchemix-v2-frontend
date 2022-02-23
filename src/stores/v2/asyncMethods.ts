import {
  fetchDataForETH,
  fetchDataForToken,
  fetchDataForTransmuter,
  fetchDataForVault,
  fetchDataForAdapter,
  generateTokenPromises,
} from '@stores/v2/helpers';
import {
  updateAllBalances,
  updateAllTokens,
  updateAllVaultBody,
  updateOneBalance,
  updateVaultByAddress,
  updateVaultDebt,
  updateVaultRatio,
  updateSentinelRole,
  updateVaultDebtTokenAddress,
  updateAllTransmuters,
  updateTransmuterByAddress,
  updateAllAdapters,
} from '@stores/v2/methods';
import { contractWrapper } from '@helpers/contractWrapper';
import { TransmuterConstants, VaultConstants, AdapterConstants } from '@stores/v2/constants';
import { VaultTypes } from '@stores/v2/types';
import { ethers } from 'ethers';
import { TokensType } from './alcxStore';

export async function fetchVaultTokens(vaultId: VaultTypes, [signer]: [ethers.Signer]) {
  if (!signer) {
    console.error(`[fetchVaultTokens]: signer is undefined`);
    return Promise.reject(`[fetchVaultTokens]: signer is undefined`);
  }

  const { instance } = contractWrapper(VaultConstants[vaultId].alchemistContractSelector, signer);

  const yieldTokens = await instance.getSupportedYieldTokens();
  const underlyingTokens = await instance.getSupportedUnderlyingTokens();

  updateAllTokens(vaultId, yieldTokens, underlyingTokens);
}

export async function fetchAllBalances([signer, fullTokenList]: [ethers.Signer, any[]]) {
  if (!signer) {
    console.error(`[fetchAllBalances]: signer is undefined`);
    return Promise.reject(`[fetchAllBalances]: signer is undefined`);
  }

  const fetchETHPromise = fetchDataForETH(signer);
  const fetchTokensPromises = generateTokenPromises(fullTokenList, signer);
  //
  return Promise.all([fetchETHPromise, ...fetchTokensPromises]).then((balances) => {
    updateAllBalances([...balances]);
  });
}

export async function fetchBalanceByAddress(address: string, [signer]: [ethers.Signer]) {
  if (!signer) {
    console.error(`[fetchBalanceByAddress]: signer is undefined`);
    return Promise.reject(`[fetchAllBalances]: signer is undefined`);
  }

  if (address === '0xETH') {
    const ethData = await fetchDataForETH(signer);
    updateOneBalance(address, ethData.balance);
  } else {
    const erc20Data = await fetchDataForToken(address, signer);
    updateOneBalance(address, erc20Data.balance);
  }
}

export async function fetchVaultDebt(vaultId: VaultTypes, [accountAddress, signer]: [string, ethers.Signer]) {
  if (!signer) {
    console.error(`[fetchBalanceByAddress]: signer is undefined`);
    return Promise.reject(`[fetchAllBalances]: signer is undefined`);
  }

  const { instance } = contractWrapper(VaultConstants[vaultId].alchemistContractSelector, signer);

  const rawDebt = await instance.accounts(accountAddress);

  updateVaultDebt(vaultId, rawDebt);
}

export async function fetchVaultRatio(vaultId: VaultTypes, [signer]: [ethers.Signer]) {
  if (!signer) {
    console.error(`[fetchBalanceByAddress]: signer is undefined`);
    return Promise.reject(`[fetchAllBalances]: signer is undefined`);
  }

  const { instance } = contractWrapper(VaultConstants[vaultId].alchemistContractSelector, signer);

  const rawRatio = await instance.minimumCollateralization();

  updateVaultRatio(vaultId, rawRatio);
}

export async function fetchVaultDebtTokenAddress(vaultId: VaultTypes, [signer]: [ethers.Signer]) {
  if (!signer) {
    console.error(`[fetchBalanceByAddress]: signer is undefined`);
    return Promise.reject(`[fetchAllBalances]: signer is undefined`);
  }

  const { instance } = contractWrapper(VaultConstants[vaultId].alchemistContractSelector, signer);

  const debtTokenAddress = await instance.debtToken();

  updateVaultDebtTokenAddress(vaultId, debtTokenAddress);
}

export async function fetchAllVaultsBodies(
  vaultId: VaultTypes,
  [signer, tokens, accountAddress]: [ethers.Signer, TokensType, string],
) {
  if (!signer) {
    console.error(`[fetchBalanceByAddress]: signer is undefined`);
    return Promise.reject(`[fetchAllBalances]: signer is undefined`);
  }

  const { instance } = contractWrapper(VaultConstants[vaultId].alchemistContractSelector, signer);

  const fetchVaultPromises = tokens[vaultId].yieldTokens.map((tokenAddress) => {
    return fetchDataForVault(vaultId, instance, tokenAddress, accountAddress);
  });

  return Promise.all([...fetchVaultPromises]).then((vaults) => {
    updateAllVaultBody(vaultId, vaults);
  });
}

export async function fetchUpdateVaultByAddress(
  vaultId: VaultTypes,
  vaultAddress: string,
  [signer, accountAddress]: [ethers.Signer, string],
) {
  if (!signer) {
    console.error(`[fetchBalanceByAddress]: signer is undefined`);
    return Promise.reject(`[fetchAllBalances]: signer is undefined`);
  }

  const { instance } = contractWrapper(VaultConstants[vaultId].alchemistContractSelector, signer);

  const vaultData = fetchDataForVault(vaultId, instance, vaultAddress, accountAddress);

  return vaultData.then((_vaultData) => {
    updateVaultByAddress(vaultId, vaultAddress, _vaultData);
  });
}

export async function fetchAdaptersForVaultType(vaultType: VaultTypes, [signer]: [ethers.Signer]) {
  if (!signer) {
    console.error(`[fetchAdaptersForVaultType]: signer is undefined`);
    return Promise.reject(`[fetchAdaptersForVaultType]: signer is undefined`);
  }

  const adaptersFetchDataPromise = AdapterConstants[vaultType].adapterContractSelectors.map((selectorId) => {
    return fetchDataForAdapter(vaultType, selectorId, signer);
  });

  return Promise.all([...adaptersFetchDataPromise]).then((adapters) => {
    updateAllAdapters(vaultType, adapters);
  });
}

export async function fetchTransmutersForVaultType(
  vaultType: VaultTypes,
  [signer, accountAddress]: [ethers.Signer, string],
) {
  if (!signer) {
    console.error(`[fetchTransmutersForVaultType]: signer is undefined`);
    return Promise.reject(`[fetchTransmutersForVaultType]: signer is undefined`);
  }

  const transmutersFetchDataPromises = TransmuterConstants[vaultType].transmuterContractSelectors.map(
    (selectorId) => {
      return fetchDataForTransmuter(vaultType, selectorId, signer, accountAddress);
    },
  );

  return Promise.all([...transmutersFetchDataPromises]).then((transmuters) => {
    updateAllTransmuters(vaultType, transmuters);
  });
}

export async function fetchTransmuterBySelector(
  vaultType: VaultTypes,
  transmuterSelector: string,
  [signer, accountAddress]: [ethers.Signer, string],
) {
  if (!signer) {
    console.error(`[fetchTransmuterBySelector]: signer is undefined`);
    return Promise.reject(`[fetchTransmuterBySelector]: signer is undefined`);
  }

  const fetchDataForTransmuterPromise = fetchDataForTransmuter(
    vaultType,
    transmuterSelector,
    signer,
    accountAddress,
  );

  return fetchDataForTransmuterPromise.then((_transmuter) => {
    updateTransmuterByAddress(vaultType, _transmuter.transmuterAddress, _transmuter);
  });
}

export async function fetchAlchemistSentinelRole(
  vaultId: VaultTypes,
  [signer, accountAddress]: [ethers.Signer, string],
) {
  if (signer) {
    const { instance } = contractWrapper(VaultConstants[vaultId].alchemistContractSelector, signer);
    return instance.sentinels(accountAddress).then((_role) => {
      updateSentinelRole(_role);
    });
  }
}

export async function fetchTokenEnabledStatus(
  vaultType: VaultTypes,
  tokenAddress: string,
  signer: ethers.Signer,
) {
  const { instance } = contractWrapper(VaultConstants[vaultType].alchemistContractSelector, signer);
  const token = (await instance.isSupportedUnderlyingToken(tokenAddress))
    ? await instance.getUnderlyingTokenParameters(tokenAddress)
    : await instance.getYieldTokenParameters(tokenAddress);
  return token.enabled;
}
