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
import tahoWallet from '@web3-onboard/taho';
import trezor from '@web3-onboard/trezor';
import ledgerModule from '@web3-onboard/ledger';
import { chainIds } from '@stores/v2/constants';

// let _toastConfig;
let _network;
let _account;

network.subscribe((val) => {
  _network = val;
});

account.subscribe((val) => {
  _account = val;
});

const injected = injectedModule();
const walletConnect = walletConnectModule();
const coinbase = coinbaseWallet();
const taho = tahoWallet();
const trezorWallet = trezor({ email: 'n4n0@mail.alchemix.fi', appUrl: 'https://alchemix.fi' });
const ledger = ledgerModule();

const supportedChains = chainIds.map((chain) => {
  return {
    id: chain.id,
    token: chain.token.symbol,
    label: chain.name,
    publicRpcUrl: chain.rpcUrl,
    rpcUrl: chain.apiUrl || chain.rpcUrl,
  };
});

const onboard = Onboard({
  wallets: [injected, walletConnect, coinbase, taho, trezorWallet, ledger],
  chains: supportedChains,

  appMetadata: {
    name: 'Alchemix',
    icon: 'https://alchemix.fi/images/icons/alcx_med.svg',
    logo: 'https://alchemix.fi/images/icons/ALCX_Std_logo.svg',
    description: 'Self repaying, non-liquidatable loans. Your only debt is time.',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io/' },
      { name: 'Taho', url: 'https://taho.xyz/' },
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
    // const chainConfig = chainIds.filter((entry) => entry.id === wallets[0].chains[0].id)[0];
    // const providerUrl = chainConfig.apiUrl === '' ? chainConfig.rpcUrl : chainConfig.apiUrl;
    // console.log(wallets[0].provider);
    const ethersProvider = new ethers.providers.Web3Provider(wallets[0].provider, 'any');
    // const ethersProvider = new ethers.providers.JsonRpcProvider(providerUrl, 'any');
    updateNetwork(wallets[0].chains[0].id === '0x539' ? '0x1' : wallets[0].chains[0].id);
    updateProvider(ethersProvider);
    updateAddress(wallets[0].accounts[0].address);
    _account.provider = ethersProvider;
    _account.signer = ethersProvider.getSigner(wallets[0].accounts[0].address);
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
    const defaults = ['0xfa', '0xa4b1'];
    if (defaults.includes(chainId)) {
      return ethers.getDefaultProvider();
    } else {
      const networkish =
        chainId === '0x1' ? 'homestead' : chainIds.filter((entry) => entry.id === chainId)[0].abiPath;
      return ethers.getDefaultProvider(networkish, {
        infura: import.meta.env.VITE_INFURA_KEY,
        alchemy: import.meta.env.VITE_ALCHEMY_KEY,
      });
    }
  }
}

export { connect, disconnect, getProvider };
