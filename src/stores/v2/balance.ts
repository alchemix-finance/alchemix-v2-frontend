import { createNotifyStore } from '@stores/v2/notifier';
import { derived } from 'svelte/store';
import { accountStore, signer } from '@stores/v2/account';
import { fullTokenList } from '@stores/v2/tokens';
import { DefaultDerivedState, DerivedStatus } from '@helpers/storeHelpers';
import { erc20Contract } from '@helpers/contractWrapper';
import { ethers } from 'ethers';

export const balanceNotifier = createNotifyStore<{
  actionType: 'UPDATE_ALL' | 'UPDATE_ONE' | 'NONE';
  address: string;
  prevStore: {}[];
  onFinished: () => void;
}>({
  actionType: 'NONE',
  address: undefined,
  prevStore: [],
  onFinished: undefined,
});

export async function fetchDataForToken(tokenAddress: string, signer: ethers.Signer) {
  const tokenContract = erc20Contract(tokenAddress, signer);

  const address = await signer.getAddress();

  const name = await tokenContract.name();
  const symbol = await tokenContract.symbol();
  const decimals = await tokenContract.decimals();
  const balance = await tokenContract.balanceOf(address);

  return {
    address: tokenAddress,
    name,
    symbol,
    decimals,
    balance,
  };
}

export async function fetchDataForETH(signer: ethers.Signer) {
  const balance = await signer.getBalance();

  return {
    symbol: 'ETH',
    name: 'Ethereum',
    balance,
    address: '0xETH',
    decimals: 18,
  };
}

const generateTokenPromises = (_tokens: string[], signer: ethers.Signer) => {
  return _tokens.map((token) => fetchDataForToken(token, signer));
};

export const balances = derived(
  [signer, fullTokenList, balanceNotifier],
  ([$signer, $tokenList, $notifier], _set) => {
    if ($signer && $tokenList) {
      const { actionType, prevStore, address, onFinished } = $notifier.value;

      switch (actionType) {
        case 'NONE' || 'UPDATE_ALL':
          // Initial Fetch
          const erc20Promises = generateTokenPromises($tokenList, $signer);
          const ethPromise = fetchDataForETH($signer);

          Promise.all([ethPromise, ...erc20Promises])
            .then((_balances) => {
              _set({ Value: _balances, Status: DerivedStatus.LOADED });

              // Callback if we finished to update the balance
              if (onFinished) {
                onFinished();
              }
            })
            .catch((error) => {
              console.error(`[balances/NONE|UPDATE_ALL]: ${error}`);
            });

          break;
        case 'UPDATE_ONE':
          // Update just one balance
          if (!prevStore || !address) {
            console.error(`[balances/UPDATE_ONE]: prevStore or address not set`);
            break;
          }

          const _balances = prevStore.filter((el) => (el as { address: string }).address !== address);

          if (address === '0xETH') {
            fetchDataForETH($signer)
              .then((_bal) => {
                _set({ Value: [..._balances, _bal], Status: DerivedStatus.LOADED });

                // Callback if we finished to update the balance
                if (onFinished) {
                  onFinished();
                }
              })
              .catch((error) => {
                console.error(`[balances/UPDATE_ONE/fetchDataForETH]:  ${error}`);
              });
          } else {
            fetchDataForToken(address, $signer)
              .then((_bal) => {
                _set({ Value: [..._balances, _bal], Status: DerivedStatus.LOADED });

                // Callback if we finished to update the balance
                if (onFinished) {
                  onFinished();
                }
              })
              .catch((error) => {
                console.error(`[balances/UPDATE_ONE/fetchDataForToken]:  ${error}`);
              });
          }

          break;
        default:
          _set({ Value: undefined, Status: DerivedStatus.LOADING });
          break;
      }
    }
    return () => {
      _set({ Value: undefined, Status: DerivedStatus.LOADING });
    };
  },
  { ...DefaultDerivedState },
);
