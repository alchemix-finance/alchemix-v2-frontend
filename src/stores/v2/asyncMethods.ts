import {
  fetchDataForETH,
  fetchDataForToken,
  fetchDataForVault,
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
} from '@stores/v2/methods';
import { contractWrapper } from '@helpers/contractWrapper';
import { VaultConstants } from '@stores/v2/constants';
import { VaultTypes } from '@stores/v2/types';
import { VaultsType } from '@stores/v2/alcxStore';
import { ethers, providers } from 'ethers';
import { TokensType, BalanceType } from './alcxStore';

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

export async function fetchAllVaultsBodies(
  vaultId: VaultTypes,
  [signer, tokens, accountAddress, balances, vaults]: [
    ethers.Signer,
    TokensType,
    string,
    BalanceType[],
    VaultsType,
  ],
) {
  if (!signer) {
    console.error(`[fetchBalanceByAddress]: signer is undefined`);
    return Promise.reject(`[fetchAllBalances]: signer is undefined`);
  }

  const { instance } = contractWrapper(VaultConstants[vaultId].alchemistContractSelector, signer);

  const fetchVaultPromises = tokens[vaultId].yieldTokens.map((tokenAddress) => {
    return fetchDataForVault(signer, instance, tokenAddress, accountAddress, balances, vaults[vaultId].ratio);
  });

  return Promise.all([...fetchVaultPromises]).then((vaults) => {
    updateAllVaultBody(vaultId, vaults);
  });
}

// export async function fetchVaultBodyByAddress(store: AlcxStore, vaultId: VaultTypes, vaultAddress: string) {
//   if (!store.provider) {
//     console.error(`[fetchVaultDebt]: store.provider is undefined`);
//     return Promise.reject(`[fetchVaultDebt]: store.provider is undefined`);
//   }

//   const { instance } = contractWrapper(
//     VaultConstants[vaultId].alchemistContractSelector,
//     store.provider.getSigner(),
//   );

//   const fetchDataPromise = fetchDataForVault(
//     store.provider.getSigner(),
//     instance,
//     vaultAddress,
//     store.address,
//     store.balances,
//     store.vaults[vaultId].ratio,
//   );

//   return fetchDataPromise.then((vault) => {
//     updateVaultByAddress(vaultId, vaultAddress, vault);
//   });
// }
