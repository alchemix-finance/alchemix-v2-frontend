import { ethers } from 'ethers';
import { navigate } from 'svelte-routing';
import account from '@stores/account';
import network from '../stores/network';
import { uninitData } from './uninitData';
// import getItl from './getItl';
import { updateAddress, updateProvider, updateNetwork } from '@stores/v2/methods';
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import coinbaseWallet from '@web3-onboard/coinbase';
import { chainIds } from '@stores/v2/constants';
// import { getRpcUrl } from '../middleware/figment';
// import {setLoginSuccess} from './setToast'

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

// @dev we're literally cheating infura with this lmfao
const infuraKeys = [
  '823507aa205c4761a50d3c4e1498143a',
  '54a3abfeaadc4c71b8ebe13d593ba611',
  '68c754b1dc074216b0b4c60c059c456e',
  'd506144931134462b2157f3b6ee001b4',
  'bfd639c5e98b41a990b4e3983ba54c7d',
  'eba3c9fbe23e45318034d525c6b9f10c',
  '9322e37943ef4d61bd3fd8e2049a441e',
  '42e287812d1c4b038b43b550360e808c',
  'f9274d4bd94d4a9abb568ce154f36a89',
];

const infuraKey = infuraKeys[Math.floor(Math.random() * infuraKeys.length)];
const randomMainnetRpc = () => `https://mainnet.infura.io/v3/${infuraKey}`;

// @note throws CORS errors due to datahub not supporting cross origin request
// @note solution from figment: "use a cloudflare worker" => extra dollars
// const figmentRpc = `https://ethereum-mainnet--rpc.datahub.figment.io/apikey/${process.env.FIGMENT_KEY}/`;
// console.log(figmentRpc);

const supportedChains = chainIds.map((chain) => {
  return {
    id: chain.id,
    token: chain.token.symbol,
    label: chain.name,
    rpcUrl: chain.id === '0x1' ? randomMainnetRpc() : chain.rpcUrl,
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

function getProvider() {
  return ethersProvider;
}

export { connect, disconnect, getProvider };
