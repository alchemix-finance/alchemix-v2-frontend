import { utils } from 'ethers';
import backgroundLoading from '../stores/backgroundLoading';
import walletBalance from '../stores/walletBalance';
import { getTokenBalance } from './getTokenData';

let _backgroundLoading;
backgroundLoading.subscribe((val) => {
  _backgroundLoading = val;
});

let _walletBalance;
walletBalance.subscribe((val) => {
  _walletBalance = val;
});

const debugging = Boolean(parseInt(process.env.DEBUG_MODE, 10));

// @dev helper function to easily clear the background loading indicator
const clearLoading = () => {
  _backgroundLoading.active = false;
  _backgroundLoading.message = null;
  backgroundLoading.set({ ..._backgroundLoading });
};

/*
 * @dev helper function to easily set new messages for the background loading indicator
 * @param msg the message string
 * @return void
 * */
const setLoading = (msg) => {
  _backgroundLoading.active = true;
  _backgroundLoading.message = msg;
  backgroundLoading.set({ ..._backgroundLoading });
};

// @dev updates the user's wallet balances from chain to state
export function updateWalletBalance() {
  if (debugging) console.log(':: updateWalletBalance');
  setLoading('Balancing');
  let counter = 1;
  _walletBalance.tokens.forEach(async (token) => {
    const index = _walletBalance.tokens.findIndex((entry) => entry === token);
    const balance = utils.formatUnits(await getTokenBalance(token.address), token.decimals);
    if (token.balance !== balance) {
      _walletBalance.tokens[index].balance = balance;
      walletBalance.set({ ..._walletBalance });
    }
    counter += 1;
    if (counter === _walletBalance.tokens.length) clearLoading();
  });
}
