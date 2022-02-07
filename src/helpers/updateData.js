import { utils } from 'ethers';
import backgroundLoading from '../stores/backgroundLoading';
import account from '../stores/account';
import walletBalance from '../stores/walletBalance';
import { alusd, aggregate } from '../stores/vaults';
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

let _aggregate;
aggregate.subscribe((val) => {
  _aggregate = val;
});

// const debugging = Boolean(parseInt(process.env.DEBUG_MODE, 10));

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

/*
 * @dev updates the user's wallet balances from chain to state
 * @param token the address of the token to update
 * */
export async function updateWalletBalance(token) {
  setLoading('Updating', token);
  const index = _walletBalance.tokens.findIndex((entry) => entry.address === token);
  const uToken = _walletBalance.tokens[index];
  const balance = utils.formatUnits(await getTokenBalance(uToken.address), uToken.decimals);
  if (uToken.balance !== balance) {
    _walletBalance.tokens[index].balance = balance;
    walletBalance.set({ ..._walletBalance });
  }
  clearLoading();
  return true;
}

/*
 * @dev updates the user's alusd vault balances from chain to state
 * @param vaultIndex the index of the vault's row to update
 * */
export async function updateAlusdVault(vaultIndex) {
  setLoading('Updating');
  _alusd.loadingRowData = true;
  alusd.set({ ..._alusd });
  const contract = getContract('AlchemistV2_alUSD');
  const vault = _alusd.rows[vaultIndex];
  const params = await contract.getYieldTokenParameters(vault.token);
  const position = await contract.positions(_account.address, vault.token);
  console.log('position', position);
  const balance = utils.formatUnits(position.shares, vault.yieldDecimals);
  const tvl = utils.formatUnits(params.activeBalance, vault.underlyingDecimals);
  const underlyingBalance = await getTokenBalance(vault.underlyingToken);
  const vaultDebt = utils
    .formatUnits(
      position.shares.mul(vault.underlyingPerShare).div(parseFloat(_alusd.ratio)),
      vault.underlyingDecimals * 2,
    )
    .toString();
  console.log('tvl', tvl, vault.tvl);
  if (tvl !== vault.tvl) {
    _alusd.rows[vaultIndex].tvl = tvl;
    alusd.set({ ..._alusd });
  }
  console.log('underlyingBalance', underlyingBalance, vault.underlyingBalance);
  if (underlyingBalance !== vault.underlyingBalance) {
    _alusd.rows[vaultIndex].underlyingBalance = underlyingBalance;
    alusd.set({ ..._alusd });
  }
  console.log('vaultDebt', vaultDebt, vault.vaultDebt);
  console.log('maxDebt', _alusd.maxDebt);
  if (vaultDebt !== vault.vaultDebt) {
    const debtDiff = vaultDebt - vault.vaultDebt;
    _alusd.rows[vaultIndex].vaultDebt = vaultDebt;
    _alusd.maxDebt += debtDiff;
    alusd.set({ ..._alusd });
  }
  console.log('balance', balance, vault.balance);
  if (balance !== vault.balance) {
    _alusd.rows[vaultIndex].balance = balance;
    alusd.set({ ..._alusd });
  }
  _alusd.loadingRowData = false;
  alusd.set({ ..._alusd });
  clearLoading();
  return true;
}

// @dev updates the alusd aggregate balances
export async function updateAlusdAggregate() {
  setLoading('Updating');
  const contract = getContract('AlchemistV2_alUSD');
  const rawDebt = await contract.accounts(_account.address);
  const newDebt = parseFloat(utils.formatEther(rawDebt.debt.toString()));
  console.log('debt old v new', _aggregate.totalDebt, newDebt);
  if (newDebt !== _aggregate.totalDebt) {
    console.log('updating aggregate debt');
    _aggregate.totalDebt = newDebt;
    aggregate.set({ ..._aggregate });
  }
  clearLoading();
  return true;
}
