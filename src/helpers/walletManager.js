import { ethers } from 'ethers';
import { navigate } from 'svelte-routing';
import Onboard from 'bnc-onboard';
import account from '../stores/account';
import toastConfig from '../stores/toast';
import network from '../stores/network';
import initData from './initData';
import { uninitData } from './uninitData';

let _toastConfig;
let _network;
let _account;
let ethersProvider;

// @dev have eslint not get a stroke
const debugging = Boolean(parseInt(process.env.DEBUG_MODE, 10));
const mainnetId = parseInt(process.env.NETWORK_ID, 10);
const mainnetName = process.env.NETWORK_NAME;
const testnetId = parseInt(process.env.LOCAL_NETWORK_ID, 10);
const testnetName = process.env.LOCAL_NETWORK_NAME;
const testnetRpc = process.env.LOCAL_NETWORK_URL;

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
const rpcUrl = `https://mainnet.infura.io/v3/${infuraKey}`;

toastConfig.subscribe((val) => {
  _toastConfig = val;
});

network.subscribe((val) => {
  _network = val;
});

account.subscribe((val) => {
  _account = val;
});

/*
 * @dev evaluates if current network is supported
 * @param networkId the network to evaluate
 * @returns boolean
 * */
const supportedNetwork = (networkId) => {
  const targetNetwork = debugging ? testnetId : mainnetId;
  return targetNetwork === networkId;
};

let initDone = false;

// @dev prepare list of supported wallets according to
// https://docs.blocknative.com/onboard#wallet-modules
const wallets = [
  { walletName: 'metamask', preferred: true },
  {
    walletName: 'walletConnect',
    rpc: {
      [mainnetId]: rpcUrl,
      [testnetId]: testnetRpc,
    },
  },
  { walletName: 'walletLink', rpcUrl: debugging ? testnetRpc : rpcUrl },
  { walletName: 'lattice', rpcUrl, appName: 'Alchemix' },
  {
    walletName: 'trezor',
    rpcUrl: debugging ? testnetRpc : rpcUrl,
    appName: 'Alchemix',
    email: 'n4n0@mail.alchemix.fi',
    customNetwork: {
      name: process.env.LOCAL_NETWORK_NAME,
      chainId: process.env.LOCAL_NETWORK_ID,
    },
  },
  { walletName: 'ledger', rpcUrl: debugging ? testnetRpc : rpcUrl },
];

// @dev initializes blocknative onboarding
const onboard = Onboard({
  darkMode: true,
  networkId: debugging ? testnetId : mainnetId,
  networkName: debugging ? testnetName : mainnetName,
  subscriptions: {
    // @dev react to changes in the user's wallet
    wallet: async (result) => {
      const { provider } = result;
      ethersProvider = new ethers.providers.Web3Provider(provider);
      _account.provider = ethersProvider;
      account.set({ ..._account });
      window.localStorage.setItem('userWallet', result.name);
    },
    // @dev react to changes in the wallet's network
    network: async (result) => {
      _network.id = result;
      network.set({ ..._network });
      if (debugging) console.log('network changed to', result);
      if (!initDone && supportedNetwork(_network.id)) await initData();
    },
  },
  walletSelect: { wallets },
});

// @dev function calls onboard to connect user wallets and stores them in state
async function connect(preselect) {
  await onboard.walletReset();
  if (preselect !== null) {
    await onboard.walletSelect(preselect);
  } else {
    await onboard.walletSelect();
  }
  try {
    await onboard.walletCheck().then(async () => {
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      const ens = debugging ? testnetName : await ethersProvider.lookupAddress(await address);
      const toastGreeting = ens !== null ? `, ${ens}!` : '!';
      _toastConfig.spinner = false;
      _toastConfig.kind = 'success';
      _toastConfig.showCloseButton = false;
      _toastConfig.closeOnMount = true;
      _toastConfig.closeTimeout = 2500;
      _toastConfig.title = `Welcome back${toastGreeting}`;
      _toastConfig.visible = true;
      _account.address = address;
      _account.ens = ens;
      _account.signer = signer;
      account.set({ ..._account });
      if (supportedNetwork(_network.id)) {
        initDone = true;
        await initData();
      }
    });
  } catch (error) {
    console.error(error);
    throw new Error('User aborted wallet selection');
  }
  toastConfig.set({ ..._toastConfig });
}

// @dev function disconnects user wallets and resets state
function disconnect() {
  onboard.walletReset();
  uninitData();
  navigate('/', { replace: true });
}

function getProvider() {
  return ethersProvider;
}

export { connect, disconnect, getProvider };
