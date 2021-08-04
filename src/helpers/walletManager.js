import { ethers } from 'ethers';
import { navigate } from 'svelte-routing';
import Onboard from 'bnc-onboard';
import account from '../stores/account';
import walletBalance from '../stores/walletBalance';

let ethersProvider;

// @dev initializes blocknative onboarding
const onboard = Onboard({
  darkMode: true,
  networkId: parseInt(process.env.NETWORK_ID, 10),
  subscriptions: {
    wallet: async (result) => {
      const { provider } = result;
      ethersProvider = new ethers.providers.Web3Provider(provider);
    },
  },
});

// @dev function calls onboard to connect user wallets and stores them in state
const connect = async () => {
  await onboard.walletReset();
  await onboard.walletSelect();
  await onboard.walletCheck().then(async () => {
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();
    account.set({ address, signer });
  });
};

// @dev function disconnects user wallets and resets state
const disconnect = () => {
  onboard.walletReset();
  account.set({ address: undefined, signer: undefined });
  walletBalance.set({ tokens: [] });
  navigate('/', { replace: true });
};

export { connect, disconnect };
