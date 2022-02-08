// function vaultAlusdRowBuilder(tokens) {
//   if (_alusd.rows.length === 0) {
//     const contract = getContract('AlchemistV2_alUSD');
//     tokens.forEach(async (token) => {
//       if (Object.keys(_alusd.debtToken).length === 0) {
//         const debtTokenAddress = await contract.debtToken();
//         _alusd.debtToken = await tokenFinder(debtTokenAddress);
//       }
//       const params = await contract.getYieldTokenParameters(token);
//       const underlyingToken = params.underlyingToken;
//       const yieldConfig = await tokenFinder(token);
//       const underlyingConfig = await tokenFinder(underlyingToken);
//       const underlyingDecimals = underlyingConfig.decimals;
//       const yieldDecimals = yieldConfig.decimals;
//       const underlyingPerShare = await contract.getUnderlyingTokensPerShare(token);
//       const underlyingPerShareFormatted = utils.formatUnits(
//         underlyingPerShare.toString(),
//         underlyingDecimals,
//       );
//       const yieldPerShare = await contract.getYieldTokensPerShare(token);
//       const yieldPerShareFormatted = utils.formatUnits(yieldPerShare.toString(), yieldDecimals);
//       const yieldSymbol = yieldConfig.symbol;
//       const underlyingSymbol = underlyingConfig.symbol;
//       const tvl = utils.formatUnits(params.activeBalance, underlyingDecimals);
//       const position = await contract.positions(_account.address, token);
//       const balance = position.shares;
//       const underlyingBalance = await getTokenBalance(underlyingToken);
//       const vaultDebt = balance
//         .div(utils.parseUnits(_alusd.ratio, 18))
//         .mul(underlyingPerShare)
//         .div(ethers.BigNumber.from(10).pow(underlyingDecimals));
//       const stratIsUsed =
//         parseFloat(utils.formatUnits(position.shares, underlyingDecimals)).toFixed(4) !== '0.0000';
//       const depositPayload = {
//         token,
//         symbol: yieldSymbol,
//         balance,
//       };
//       const rowPayload = {
//         yieldSymbol,
//         token,
//         balance,
//         yieldDecimals,
//         yieldPerShare,
//         yieldPerShareFormatted,
//         underlyingPerShare,
//         underlyingPerShareFormatted,
//         underlyingSymbol,
//         underlyingToken,
//         underlyingBalance,
//         underlyingDecimals,
//         stratIsUsed,
//         tvl,
//         vaultDebt: vaultDebt.toString(),
//       };
//       _alusd.rows.push(rowPayload);
//       if (_alusd.maxDebt) {
//         _alusd.maxDebt = _alusd.maxDebt.add(vaultDebt);
//       } else {
//         _alusd.maxDebt = vaultDebt;
//       }
//       _aggregate.deposited.push(depositPayload);
//       _aggregate.totalDeposit +=
//         (parseFloat(depositPayload.balance) * underlyingPerShare) / 10 ** underlyingDecimals;
//       _aggregate.debtLimit += vaultDebt;
//       const balanceValue = utils
//         .parseUnits(utils.formatUnits(balance, underlyingDecimals), 18)
//         .mul(underlyingPerShare)
//         .div(ethers.BigNumber.from(10).pow(underlyingDecimals));
//       if (_aggregate.balance) {
//         _aggregate.balance = _aggregate.balance.add(balanceValue);
//       } else {
//         _aggregate.balance = balanceValue;
//       }
//       aggregate.set({ ..._aggregate });
//       alusd.set({ ..._alusd });
//       if (_alusd.yieldTokens.length === _alusd.rows.length) _alusd.loadingRowData = false;
//     });
//   } else {
//     _alusd.loadingRowData = false;
//   }
// }
//
// // @dev makes sure to not initialize vault before balances have been loaded
// let vaultAlusdRowBuilderQueueTimer;
// const vaultAlusdRowBuilderQueue = (tokens) => {
//   vaultAlusdRowBuilderQueueTimer = setTimeout(() => {
//     if (!_account.loadingWalletBalance) {
//       vaultAlusdRowBuilder(tokens);
//       clearTimeout(vaultAlusdRowBuilderQueueTimer);
//     } else {
//       vaultAlusdRowBuilderQueue(tokens);
//     }
//   }, 200);
// };
//
// // @dev initializes the alUSD vault
// async function initAlusdVault() {
//   const contract = getContract('AlchemistV2_alUSD');
//   const rawDebt = await contract.accounts(_account.address);
//   const rawRatio = await contract.minimumCollateralization();
//   _alusd.userDebt = utils.formatEther(rawDebt.debt.toString());
//   _alusd.ratio = utils.formatEther(rawRatio.toString());
//   alusd.set({ ..._alusd });
//
//   _aggregate.totalDebt = parseFloat(_alusd.userDebt);
//
//   vaultAlusdRowBuilderQueue(_alusd.yieldTokens);
//   return true;
// }

import { derived, writable } from 'svelte/store';
import { ethers } from 'ethers';
import { makeProviderStore, provider } from '@stores/v2/accounts';
import { contractWrapper } from '@helpers/contractWrapper';
import { DefaultDerivedState, DerivedStatus } from '@helpers/storeHelpers';
import { createNotifyStore } from '@stores/v2/notify';

export const SupportedVaults = Object.freeze({
  alUSD: 0,
  alETH: 1,
});

export const VAULTS = {
  [SupportedVaults.alUSD]: {
    contractSelector: 'AlchemistV2_alUSD',
  },
};

async function fetchVaultsHeadInfo(vaultId: number, contractSelector: string, signer: ethers.Signer) {
  const address = await signer.getAddress();

  const { instance } = contractWrapper(contractSelector, signer);

  const rawDebt = await instance.accounts(address).catch((e) => {
    console.error(`[fetchVaultInfo/accounts]: ${e}`);
  });

  const rawRatio = await instance.minimumCollateralization().catch((e) => {
    console.error(`[fetchVaultInfo/minimumCollateralization]: ${e}`);
  });

  return { vaultId, rawDebt, rawRatio };
}

export const makeActiveVaultStore = () => {
  const _currentVault = writable([SupportedVaults.alUSD]);

  return {
    ..._currentVault,
  };
};

// TODO: Create function to select the choosen vault
export const makeVaultsHeadStore = (_provider: ReturnType<typeof makeProviderStore>) => {
  let _vaultsHead = [];

  const vaultsHeadNotifier = createNotifyStore({
    vaultId: undefined,
  });

  return {
    vaultsInfo: derived(
      [_provider.signer, vaultsHeadNotifier],
      ([$signer, $notifier], _set) => {
        if ($signer && !$notifier.value) {
          const vaultsPromises = Object.keys(VAULTS).map((vaultId) =>
            fetchVaultsHeadInfo(Number(vaultId), VAULTS[vaultId].contractSelector, $signer),
          );

          Promise.allSettled([...vaultsPromises])
            .then((_vaults) => {
              _vaultsHead = [..._vaults];

              _set({ Value: _vaultsHead, Status: DerivedStatus.LOADED });
            })
            .catch((error) => {
              console.error(`[makeVaultsHeadStore/vaultInfo]: ${error}`);

              _set({ Value: undefined, Status: DerivedStatus.ERROR });
            });
        } else {
          // TODO: use notifiers to update just a value
        }

        return () => {
          _set({ Value: undefined, Status: DerivedStatus.LOADING });
        };
      },
      { ...DefaultDerivedState },
    ),
    notifyVaultUpdate: (vaultId) => vaultsHeadNotifier.notify(vaultId),
  };
};

export const activeVault = makeActiveVaultStore();

export const vaultsHead = makeVaultsHeadStore(provider);
