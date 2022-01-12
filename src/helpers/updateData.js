import { utils } from 'ethers';
import backgroundLoading from '../stores/backgroundLoading';
import account from '../stores/account';
import walletBalance from '../stores/walletBalance';
import { alusd } from '../stores/vaults';
import { getTokenBalance } from './getTokenData';
import getContract from './getContract';

let _backgroundLoading;
backgroundLoading.subscribe((val) => {
  _backgroundLoading = val;
});

let _account;
account.subscribe((val) => {
  _account = val;
});

let _walletBalance;
walletBalance.subscribe((val) => {
  _walletBalance = val;
});

let _alusd;
alusd.subscribe((val) => {
  _alusd = val;
});

// let _aggregate;
// aggregate.subscribe((val) => {
//   _aggregate = val;
// });

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
 * */
const setLoading = (msg) => {
  _backgroundLoading.active = true;
  _backgroundLoading.message = msg;
  backgroundLoading.set({ ..._backgroundLoading });
};

// @dev updates the user's wallet balances from chain to state
export function updateWalletBalance() {
  if (debugging) console.log(':: updateWalletBalance');
  setLoading('Updating');
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

// @dev updates the user's alusd vault balances from chain to state
export function updateAlusdVault() {
  if (debugging) console.log(':: updateAlusdVault');
  setLoading('Updating');
  _alusd.loadingRowData = true;
  alusd.set({ ..._alusd });
  const contract = getContract('AlchemistV2_alUSD');
  let counter = 1;
  _alusd.rows.forEach(async (vault) => {
    const index = _alusd.rows.findIndex((entry) => entry === vault);
    const params = await contract.getYieldTokenParameters(vault.token);
    const position = await contract.positions(_account.address, vault.token);
    const balance = utils.formatUnits(position.balance.toString(), vault.yieldDecimals);
    const tvl = utils.formatUnits(params.balance.toString(), vault.underlyingDecimals);
    const underlyingBalance = await getTokenBalance(vault.underlyingToken);
    const vaultDebt = (balance * vault.underlyingPerShareFormatted) / _alusd.ratio;
    if (tvl !== vault.tvl) {
      _alusd.rows[index].tvl = tvl;
      alusd.set({ ..._alusd });
    }
    if (underlyingBalance !== vault.underlyingBalance) {
      _alusd.rows[index].underlyingBalance = underlyingBalance;
      alusd.set({ ..._alusd });
    }
    if (vaultDebt !== vault.vaultDebt) {
      _alusd.rows[index].vaultDebt = vaultDebt;
      alusd.set({ ..._alusd });
    }
    if (balance !== vault.balance) {
      _alusd.rows[index].balance = balance;
      alusd.set({ ..._alusd });
    }
    counter += 1;
    if (counter === _alusd.rows.length) {
      _alusd.loadingRowData = false;
      alusd.set({ ..._alusd });
      clearLoading();
    }
  });
}
