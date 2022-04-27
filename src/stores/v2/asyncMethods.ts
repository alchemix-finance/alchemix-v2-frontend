import {
  fetchDataForCrvFarm,
  fetchDataForETH,
  fetchDataForInternalFarm,
  fetchDataForSushiFarm,
  fetchDataForToken,
  fetchDataForTransmuter,
  fetchDataForVault,
  fetchDataForAdapter,
  generateTokenPromises,
  fetchAdapterAddress,
} from '@stores/v2/helpers';
import {
  updateAllBalances,
  updateAllFarms,
  updateAllTokens,
  updateAllTransmuters,
  updateAllVaultBody,
  updateFarmByUuid,
  updateOneBalance,
  updateSentinelRole,
  updateTransmuterByAddress,
  updateVaultByAddress,
  updateVaultDebt,
  updateVaultDebtTokenAddress,
  updateVaultRatio,
  updateAllAdapters,
} from '@stores/v2/methods';
import { contractWrapper } from '@helpers/contractWrapper';
import { TransmuterConstants, VaultConstants, chainIds } from '@stores/v2/constants';
import { FarmTypes, VaultTypes } from '@stores/v2/types';
import { ethers } from 'ethers';
import { TokensType } from './alcxStore';

export async function fetchVaultTokens(vaultId: VaultTypes, [signer]: [ethers.Signer], _network: string) {
  if (!signer) {
    console.error(`[fetchVaultTokens]: signer is undefined`);
    return Promise.reject(`[fetchVaultTokens]: signer is undefined`);
  }
  const path = chainIds.filter((chain) => chain.id === _network)[0].abiPath;

  const { instance: alchemist } = contractWrapper(
    VaultConstants[vaultId].alchemistContractSelector,
    signer,
    path,
  );

  const yieldTokens = await alchemist.getSupportedYieldTokens();
  const underlyingTokens = await alchemist.getSupportedUnderlyingTokens();

  updateAllTokens(vaultId, yieldTokens, underlyingTokens);
}

export async function fetchAllBalances([signer, fullTokenList]: [ethers.Signer, any[]], network?: string) {
  if (!signer) {
    console.error(`[fetchAllBalances]: signer is undefined`);
    return Promise.reject(`[fetchAllBalances]: signer is undefined`);
  }

  const fetchETHPromise = fetchDataForETH(signer, network);
  const fetchTokensPromises = generateTokenPromises(fullTokenList, signer, network);
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

export async function fetchVaultDebt(
  vaultId: VaultTypes,
  [accountAddress, signer]: [string, ethers.Signer],
  _network: string,
) {
  if (!signer) {
    console.error(`[fetchBalanceByAddress]: signer is undefined`);
    return Promise.reject(`[fetchAllBalances]: signer is undefined`);
  }
  const path = chainIds.filter((chain) => chain.id === _network)[0].abiPath;

  const { instance } = contractWrapper(VaultConstants[vaultId].alchemistContractSelector, signer, path);

  const rawDebt = await instance.accounts(accountAddress);

  updateVaultDebt(vaultId, rawDebt);
}

export async function fetchVaultRatio(vaultId: VaultTypes, [signer]: [ethers.Signer], _network: string) {
  if (!signer) {
    console.error(`[fetchBalanceByAddress]: signer is undefined`);
    return Promise.reject(`[fetchAllBalances]: signer is undefined`);
  }
  const path = chainIds.filter((chain) => chain.id === _network)[0].abiPath;

  const { instance } = contractWrapper(VaultConstants[vaultId].alchemistContractSelector, signer, path);

  const rawRatio = await instance.minimumCollateralization();

  updateVaultRatio(vaultId, rawRatio);
}

export async function fetchVaultDebtTokenAddress(
  vaultId: VaultTypes,
  [signer]: [ethers.Signer],
  _network: string,
) {
  if (!signer) {
    console.error(`[fetchBalanceByAddress]: signer is undefined`);
    return Promise.reject(`[fetchAllBalances]: signer is undefined`);
  }
  const path = chainIds.filter((chain) => chain.id === _network)[0].abiPath;

  const { instance } = contractWrapper(VaultConstants[vaultId].alchemistContractSelector, signer, path);

  const debtTokenAddress = await instance.debtToken();

  updateVaultDebtTokenAddress(vaultId, debtTokenAddress);
}

export async function fetchAllVaultsBodies(
  vaultId: VaultTypes,
  [signer, tokens, accountAddress]: [ethers.Signer, TokensType, string],
  _network: string,
) {
  if (!signer) {
    console.error(`[fetchBalanceByAddress]: signer is undefined`);
    return Promise.reject(`[fetchAllBalances]: signer is undefined`);
  }
  const path = chainIds.filter((chain) => chain.id === _network)[0].abiPath;

  const { instance } = contractWrapper(VaultConstants[vaultId].alchemistContractSelector, signer, path);

  const fetchVaultPromises = tokens[vaultId].yieldTokens.map((tokenAddress) => {
    return fetchDataForVault(vaultId, instance, tokenAddress, accountAddress, signer, _network);
  });

  return Promise.all([...fetchVaultPromises]).then((vaults) => {
    updateAllVaultBody(vaultId, vaults);
  });
}

export async function fetchUpdateVaultByAddress(
  vaultId: VaultTypes,
  vaultAddress: string,
  [signer, accountAddress]: [ethers.Signer, string],
  _network: string,
) {
  if (!signer) {
    console.error(`[fetchBalanceByAddress]: signer is undefined`);
    return Promise.reject(`[fetchAllBalances]: signer is undefined`);
  }
  const path = chainIds.filter((chain) => chain.id === _network)[0].abiPath;

  const { instance } = contractWrapper(VaultConstants[vaultId].alchemistContractSelector, signer, path);

  const vaultData = fetchDataForVault(vaultId, instance, vaultAddress, accountAddress, signer, _network);

  return vaultData.then((_vaultData) => {
    updateVaultByAddress(vaultId, vaultAddress, _vaultData);
  });
}

export async function fetchAdaptersForVaultType(
  vaultType: VaultTypes,
  [signer]: [ethers.Signer],
  _network: string,
) {
  if (!signer) {
    console.error(`[fetchAdaptersForVaultType]: signer is undefined`);
    return Promise.reject(`[fetchAdaptersForVaultType]: signer is undefined`);
  }
  const path = chainIds.filter((chain) => chain.id === _network)[0].abiPath;

  const { instance: alchemist } = contractWrapper(
    VaultConstants[vaultType].alchemistContractSelector,
    signer,
    path,
  );
  const yieldTokens = await alchemist.getSupportedYieldTokens();
  const adapters = yieldTokens.map((yieldToken) => {
    return fetchAdapterAddress(
      VaultConstants[vaultType].alchemistContractSelector,
      yieldToken,
      signer,
      _network,
    );
  });

  return Promise.all([...adapters]).then((params) => {
    Promise.all([
      ...params.map((adapter) => {
        return fetchDataForAdapter(vaultType, adapter.adapter, adapter.yieldToken, signer);
      }),
    ]).then((adapters) => {
      updateAllAdapters(vaultType, adapters);
    });
  });
}

export async function fetchTransmutersForVaultType(
  vaultType: VaultTypes,
  [signer, accountAddress]: [ethers.Signer, string],
  _network: string,
) {
  if (!signer) {
    console.error(`[fetchTransmutersForVaultType]: signer is undefined`);
    return Promise.reject(`[fetchTransmutersForVaultType]: signer is undefined`);
  }

  const transmutersFetchDataPromises = TransmuterConstants[vaultType].transmuterContractSelectors.map(
    (selectorId) => {
      return fetchDataForTransmuter(vaultType, selectorId, signer, accountAddress, _network);
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
  _network: string,
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
    _network,
  );

  return fetchDataForTransmuterPromise.then((_transmuter) => {
    updateTransmuterByAddress(vaultType, _transmuter.transmuterAddress, _transmuter);
  });
}

export async function fetchInternalFarms([signer]: [ethers.Signer], _network: string) {
  if (!signer) {
    console.error(`[fetchInternalFarms]: signer is undefined`);
    return Promise.reject(`[fetchInternalFarms]: signer is undefined`);
  }
  const path = chainIds.filter((chain) => chain.id === _network)[0].abiPath;

  const poolCount = await contractWrapper('StakingPools', signer, path).instance.poolCount();

  const promises = [];

  for (let i = 0; i < poolCount.toNumber(); i++) {
    promises.push(fetchDataForInternalFarm(i, [signer]));
  }

  return Promise.all([...promises]).then((data) => {
    updateAllFarms(
      data.map((_data) => {
        return {
          type: FarmTypes.INTERNAL,
          body: _data,
        };
      }),
    );
  });
}

export async function fetchSushiFarm([signer]: [ethers.Signer]) {
  if (!signer) {
    console.error(`[fetchSushiFarm]: signer is undefined`);
    return Promise.reject(`[fetchSushiFarm]: signer is undefined`);
  }

  return fetchDataForSushiFarm('SushiLP', 'SushiMasterchefV2', 'SushiOnsenRewarder', [signer]).then(
    (farmData) => {
      updateAllFarms([
        {
          type: FarmTypes.SUSHI,
          body: farmData,
        },
      ]);
    },
  );
}

export async function fetchCrvFarm([signer]: [ethers.Signer]) {
  if (!signer) {
    console.error(`[fetchCrvFarm]: signer is undefined`);
    return Promise.reject(`[fetchCrvFarm]: signer is undefined`);
  }

  return fetchDataForCrvFarm('CurveGaugeMetapool', 'CurveGaugeDeposit', 'CurveGaugeRewards', [signer]).then(
    (farmData) => {
      updateAllFarms([
        {
          type: FarmTypes.CRV,
          body: farmData,
        },
      ]);
    },
  );
}

export async function fetchCrvFarmByUuid(uuid: string, [signer]: [ethers.Signer]) {
  if (!signer) {
    console.error(`[fetchCrvFarmByUuid]: signer is undefined`);
    return Promise.reject(`[fetchCrvFarmByUuid]: signer is undefined`);
  }

  return fetchDataForCrvFarm('CurveGaugeMetapool', 'CurveGaugeDeposit', 'CurveGaugeRewards', [signer]).then(
    (farmData) => {
      updateFarmByUuid(uuid, {
        type: FarmTypes.CRV,
        body: farmData,
      });
    },
  );
}

export async function fetchSushiFarmByUuid(uuid: string, [signer]: [ethers.Signer]) {
  if (!signer) {
    console.error(`[fetchSushiFarm]: signer is undefined`);
    return Promise.reject(`[fetchSushiFarm]: signer is undefined`);
  }

  return fetchDataForSushiFarm('SushiLP', 'SushiMasterchefV2', 'SushiOnsenRewarder', [signer]).then(
    (farmData) => {
      updateFarmByUuid(uuid, {
        type: FarmTypes.SUSHI,
        body: farmData,
      });
    },
  );
}

export async function fetchInternalFarmByUuid(uuid: string, poolId: number, [signer]: [ethers.Signer]) {
  if (!signer) {
    console.error(`[fetchInternalFarmByAddress]: signer is undefined`);
    return Promise.reject(`[fetchInternalFarmByAddress]: signer is undefined`);
  }

  await fetchDataForInternalFarm(poolId, [signer]).then((data) => {
    updateFarmByUuid(uuid, { type: FarmTypes.INTERNAL, body: data });
  });
}

export async function fetchAlchemistSentinelRole(
  vaultId: VaultTypes,
  [signer, accountAddress]: [ethers.Signer, string],
  _network: string,
) {
  if (signer) {
    const path = chainIds.filter((chain) => chain.id === _network)[0].abiPath;
    const { instance } = contractWrapper(VaultConstants[vaultId].alchemistContractSelector, signer, path);
    return instance.sentinels(accountAddress).then((_role) => {
      updateSentinelRole(_role);
    });
  }
}

export async function fetchTokenEnabledStatus(
  vaultType: VaultTypes,
  tokenAddress: string,
  signer: ethers.Signer,
  _network: string,
) {
  const path = chainIds.filter((chain) => chain.id === _network)[0].abiPath;
  const { instance } = contractWrapper(VaultConstants[vaultType].alchemistContractSelector, signer, path);
  const token = (await instance.isSupportedUnderlyingToken(tokenAddress))
    ? await instance.getUnderlyingTokenParameters(tokenAddress)
    : await instance.getYieldTokenParameters(tokenAddress);
  return token.enabled;
}
