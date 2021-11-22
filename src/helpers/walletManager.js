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
async function connect() {
  await onboard.walletReset();
  await onboard.walletSelect();
  try {
    await onboard.walletCheck().then(async () => {
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();
      const ens = await ethersProvider.lookupAddress(await address);
      account.set({ address, signer, ens });
    });
  } catch (error) {
    console.warn('User aborted wallet selection', error);
  }
}

// @dev function disconnects user wallets and resets state
function disconnect() {
  onboard.walletReset();
  account.set({ address: undefined, signer: undefined });
  walletBalance.set({ tokens: [] });
  navigate('/', { replace: true });
}

export { connect, disconnect };
