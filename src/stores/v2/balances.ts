import { derived, writable } from 'svelte/store';
import { makeProviderStore, provider } from '@stores/v2/accounts';
import { DefaultDerivedState, DerivedStatus } from '@helpers/storeHelpers';
import { createNotifyStore } from '@stores/v2/notify';
import { ethers } from 'ethers';
import { erc20Contract } from '@helpers/contractWrapper';
import { makeTokensStore, tokens } from '@stores/v2/tokens';

/*
* // @dev initializes the user's wallet balance
async function initWalletBalance() {
  const ethBalance = await ethers
    .getDefaultProvider(debugging ? process.env.LOCAL_NETWORK_URL : 'homestead')
    .getBalance(_account.address);
  _walletBalance.tokens = [
    ..._walletBalance.tokens,
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: utils.formatEther(ethBalance),
      address: '',
      decimals: 18,
    },
  ];
  await batchTokenCheck(tokenList);
  return true;
}
*
*
* */

export const fetchDataForToken = async (tokenAddress: string, signer: ethers.Signer) => {
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
};

export const fetchDataForETH = async (signer: ethers.Signer) => {
  const balance = await signer.getBalance();

  return {
    symbol: 'ETH',
    name: 'Ethereum',
    balance,
    address: '0xETH',
    decimals: 18,
  };
};

const generateTokenPromises = (_tokens: string[], signer: ethers.Signer) => {
  return _tokens.map((token) => fetchDataForToken(token, signer));
};

export const makeBalancesStore = (
  _provider: ReturnType<typeof makeProviderStore>,
  _tokenList: ReturnType<typeof makeTokensStore>,
) => {
  let _balances = [];

  const balanceNotifier = createNotifyStore({
    address: undefined,
  });

  return {
    balances: derived(
      [_provider.signer, balanceNotifier, _tokenList.allTokens],
      ([$signer, $notifier, $tokens], _set) => {
        if ($signer && $notifier.value === undefined) {
          // Initial balance fetching

          const erc20Promises = generateTokenPromises($tokens.Value, $signer);
          const ethPromise = fetchDataForETH($signer);

          Promise.all([ethPromise, ...erc20Promises])
            .then((data) => {
              _balances = [...data];

              _set({ Value: _balances, Status: DerivedStatus.LOADED });
            })
            .catch((e) => {
              console.error(`[makeBalancesStore/balances]: ${e}`);
              _set({ Value: [], Status: DerivedStatus.ERROR });
            });
        } else {
          // Update balance when requested
          // TODO: Add the necessary method to update just a token balance
        }
        return () => {
          _set({ Value: _balances, Status: DerivedStatus.LOADING });
        };
      },
      {
        ...DefaultDerivedState,
      },
    ),
    notifyBalanceUpdate: (address: string) => balanceNotifier.notify({ address }),
  };
};

export const balances = makeBalancesStore(provider, tokens);
