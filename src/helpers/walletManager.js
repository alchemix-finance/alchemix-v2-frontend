import { ethers } from 'ethers';
import { navigate } from 'svelte-routing';
import Onboard from 'bnc-onboard';
import account from '../stores/account';
import walletBalance from '../stores/walletBalance';
import toastConfig from '../stores/toast';
import network from '../stores/network';
import initData from './initData';

let _toastConfig;
let _network;
let _account;
const accountReset = account;
let ethersProvider;
// let rpcUrl;

toastConfig.subscribe((val) => {
  _toastConfig = val;
});

network.subscribe((val) => {
  _network = val;
});

account.subscribe((val) => {
  _account = val;
});

// @dev prepare list of supported wallets according to
// https://docs.blocknative.com/onboard#wallet-modules
const wallets = [
  { walletName: 'metamask', preferred: true },
  // { walletName: 'walletLink', rpcUrl },
  // { walletName: 'lattice', rpcUrl, appName: 'Alchemix' },
  // {
  //   walletName: 'trezor',
  //   rpcUrl,
  //   appName: 'Alchemix',
  //   email: 'n4n0@mail.alchemix.fi',
  // },
  // { walletName: 'ledger', rpcUrl },
];

// @dev have eslint not get a stroke
const debugging = Boolean(parseInt(process.env.DEBUG_MODE, 10));
const mainnetId = parseInt(process.env.NETWORK_ID, 10);
const mainnetName = process.env.NETWORK_NAME;
const testnetId = parseInt(process.env.LOCAL_NETWORK_ID, 10);
const testnetName = process.env.LOCAL_NETWORK_NAME;

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
      await initData();
    });
  } catch (error) {
    console.warn('User aborted wallet selection', error);
  }
  toastConfig.set({ ..._toastConfig });
}

// @dev function disconnects user wallets and resets state
function disconnect() {
  onboard.walletReset();
  account.set({ ...accountReset });
  walletBalance.set({ tokens: [] });
  navigate('/', { replace: true });
}

function getProvider() {
  return ethersProvider;
}

export { connect, disconnect, getProvider };
