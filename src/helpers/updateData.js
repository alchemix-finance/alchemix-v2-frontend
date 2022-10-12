import { utils, BigNumber } from 'ethers';
import backgroundLoading from '../stores/backgroundLoading';
import account from '@stores/account';
import walletBalance from '../stores/walletBalance';
import { alusd, aggregate } from '@stores/vaults';
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
  setLoading('Updating');
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
  const contract = await getContract('AlchemistV2_alUSD');
  const vault = _alusd.rows[vaultIndex];
  const params = await contract.getYieldTokenParameters(vault.token);
  const position = await contract.positions(_account.address, vault.token);
  const underlyingPerShare = await contract.getUnderlyingTokensPerShare(vault.token);
  const balance = position.shares;
  const tvl = utils.formatUnits(params.activeBalance, vault.underlyingDecimals);
  const underlyingBalance = await getTokenBalance(vault.underlyingToken);
  const vaultDebt = balance
    .div(utils.parseUnits(_alusd.ratio, vault.underlyingDecimals))
    .mul(underlyingPerShare)
    .div(BigNumber.from(10).pow(vault.underlyingDecimals));
  if (tvl !== vault.tvl) {
    _alusd.rows[vaultIndex].tvl = tvl;
    alusd.set({ ..._alusd });
  }
  if (underlyingBalance !== vault.underlyingBalance) {
    _alusd.rows[vaultIndex].underlyingBalance = underlyingBalance;
    alusd.set({ ..._alusd });
  }
  if (!vaultDebt.eq(vault.vaultDebt)) {
    const debtDiff = vaultDebt.sub(vault.vaultDebt);
    _alusd.rows[vaultIndex].vaultDebt = vaultDebt;
    _alusd.maxDebt = _alusd.maxDebt.add(debtDiff);
    alusd.set({ ..._alusd });
  }
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
  const contract = await getContract('AlchemistV2_alUSD');
  const rawDebt = await contract.accounts(_account.address);
  const newDebt = parseFloat(utils.formatEther(rawDebt.debt.toString()));
  if (newDebt !== _aggregate.totalDebt) {
    _aggregate.totalDebt = newDebt;
    aggregate.set({ ..._aggregate });
  }
  clearLoading();
  return true;
}
