import backgroundLoading from '../stores/backgroundLoading';
import walletBalance from '../stores/walletBalance';

let _backgroundLoading;
backgroundLoading.subscribe((val) => {
  _backgroundLoading = val;
});

let _walletBalance;
walletBalance.subscribe((val) => {
  _walletBalance = val;
});

// const debugging = Boolean(parseInt(process.env.DEBUG_MODE, 10))

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
  setLoading('Updating');
  // const tokens = _walletBalance.tokens;
  // tokens.forEach((token) => {});
  console.log(_walletBalance.tokens);
  clearLoading();
}
