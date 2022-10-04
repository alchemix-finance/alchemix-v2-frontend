// @ts-nocheck
import { ethers } from 'ethers';
import { navigate } from 'svelte-routing';

import account from '@stores/account';
import network from '@stores/network';
import { uninitData } from './uninitData';
import { updateAddress, updateProvider, updateNetwork } from '@stores/v2/methods';
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import coinbaseWallet from '@web3-onboard/coinbase';
import { chainIds } from '@stores/v2/constants';

// let _toastConfig;
let _network;
let _account;
let ethersProvider;

network.subscribe((val) => {
  _network = val;
});

account.subscribe((val) => {
  _account = val;
});

const injected = injectedModule();
const walletConnect = walletConnectModule();
const coinbase = coinbaseWallet();

const supportedChains = chainIds.map((chain) => {
  return {
    id: chain.id,
    token: chain.token.symbol,
    label: chain.name,
    rpcUrl: chain.rpcUrl,
  };
});

const onboard = Onboard({
  wallets: [injected, walletConnect, coinbase],
  chains: supportedChains,

  appMetadata: {
    name: 'Alchemix',
    icon: 'https://alchemix.fi/images/icons/alcx_med.svg',
    logo: 'https://alchemix.fi/images/icons/ALCX_Std_logo.svg',
    description: 'Self repaying, non-liquidatable loans. Your only debt is time.',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io/' },
      { name: 'Tally', url: 'https://tally.cash/' },
    ],
  },
  accountCenter: {
    desktop: {
      enabled: false,
    },
    mobile: {
      enabled: false,
    },
  },
});

const connect = async (preselect) => {
  try {
    if (preselect && preselect.length !== 0) {
      await onboard.connectWallet({
        autoSelect: {
          label: preselect[0],
          disableModals: true,
        },
      });
    } else {
      await onboard.connectWallet();
    }
  } catch (e) {
    console.log(`[connect]: ${e}`);
  }
};

export const switchChain = async (id) => {
  try {
    await onboard.setChain({ chainId: id });
  } catch (e) {
    console.error(`[switchChain]: ${e}`);
  }
};

const walletsSub = onboard.state.select('wallets');
const { unsubscribe } = walletsSub.subscribe(async (wallets) => {
  if (!!wallets && wallets.length > 0) {
    const connectedWallets = wallets.map(({ label }) => label);
    window.localStorage.setItem('connectedWallets', JSON.stringify(connectedWallets));
    ethersProvider = new ethers.providers.Web3Provider(wallets[0].provider);
    updateNetwork(wallets[0].chains[0].id === '0x539' ? '0x1' : wallets[0].chains[0].id);
    updateProvider(await ethersProvider);
    updateAddress(wallets[0].accounts[0].address);
    _account.provider = await ethersProvider;
    _account.signer = await ethersProvider.getSigner();
    _account.address = wallets[0].accounts[0].address;
    _account.ens = wallets[0].accounts[0].ens?.name || null;
    _network.id = wallets[0].chains[0].id;
    account.set({ ..._account });
    network.set({ ..._network });
  }
});

const disconnect = async () => {
  const [primaryWallet] = onboard.state.get().wallets;
  await onboard.disconnectWallet({
    label: primaryWallet.label,
  });
  uninitData();
  navigate('/', { replace: true });
  unsubscribe();
};

function getProvider(chainId) {
  if (!!chainId) {
    let rpc = `${chainIds.filter((entry) => entry.id === chainId)[0].apiUrl}${
      import.meta.env.VITE_INFURA_KEY
    }`;
    if (rpc === '' && chainId === '0x1') {
      rpc = 'homestead';
    } else {
      rpc = chainIds.filter((entry) => entry.id === chainId)[0].rpcUrl;
    }
    return ethers.getDefaultProvider(rpc, { infura: import.meta.env.VITE_INFURA_KEY });
  }
}

export { connect, disconnect, getProvider };
