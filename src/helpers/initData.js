import { ethers, utils } from 'ethers';
import getContract from './getContract';
import { getTokenSymbol, getTokenBalance, getTokenName, getTokenDecimals } from './getTokenData';
import account from '../stores/account';
import walletBalance from '../stores/walletBalance';
import vaults, { alusd, aggregate } from '../stores/vaults';
import { poolLookup } from '../stores/stakingPools';
import { setLoadingData, closeToast } from './setToast';

// @dev enable verbose messages in console when debugging
const debugging = Boolean(parseInt(process.env.DEBUG_MODE, 10));
let retry;
if (debugging) console.warn('====== Running initData in Debug mode ======');

// @dev prints out nicely formatted view of the initialized data
function logData() {
  retry = setTimeout(() => {
    if (
      !_account.loadingSupportedTokens &&
      !_account.loadingWalletBalance &&
      !_account.loadingVaultConfigurations &&
      !_account.loadingTransmuterConfigurations &&
      !_alusd.loadingRowData
    ) {
      console.log('====== Supported Tokens ======');
      console.log(tokenList);
      console.log('====== Wallet Balance ======');
      console.table(_walletBalance.tokens);
      console.log('====== Vault Configuration ======');
      console.log('Alchemist alUSD user debt:', _alusd.userDebt, 'alUSD');
      console.table(_alusd.rows);
      console.log('====== Transmuter Configuration ======');
      console.table(_walletBalance);
      console.log('====== initData finished ======');
      clearTimeout(retry);
    } else {
      logData();
    }
  }, 200);
}

// @dev a series of buffer variables to keep data reactive
let _account;
account.subscribe((val) => {
  _account = val;
});

let _walletBalance;
walletBalance.subscribe((val) => {
  _walletBalance = val;
});

let _vaults;
vaults.subscribe((val) => {
  _vaults = val;
});

let _aggregate;
aggregate.subscribe((val) => {
  _aggregate = val;
});

let _alusd;
alusd.subscribe((val) => {
  _alusd = val;
});

// @dev list of tokens to watch
const tokenList = [];

/*
 * @param token address of the token
 * @returns the token object from the walletBalance store
 * */
async function tokenFinder(token) {
  return _walletBalance.tokens.find((item) => item.address === token);
}

/*
 * @dev queries token details for a list of tokens
 * @param tokens the list of token addresses
 *  */
async function batchTokenCheck(tokens) {
  let counter = 0;
  const tokenFiller = async (token) => {
    const payload = {
      address: token,
      symbol: null,
      name: null,
      balance: null,
      decimals: null,
    };
    const decimals = await getTokenDecimals(token);
    payload.decimals = decimals;
    payload.symbol = await getTokenSymbol(token);
    payload.balance = utils.formatUnits(await getTokenBalance(token), decimals);
    payload.name = await getTokenName(token);
    _walletBalance.tokens.push(payload);
    walletBalance.set({ ..._walletBalance });
    counter += 1;
    // @dev dum naive hack to make sure state is set when everything has finished loading
    if (counter === tokens.length) {
      _account.loadingWalletBalance = false;
      account.set({ ..._account });
    }
  };
  tokens.forEach(tokenFiller);
}

// @dev retrieves the tokens supported by the alusd alchemist
async function initAlusdAlchemistTokens() {
  const contract = getContract('AlchemistV2_alUSD');
  const yieldTokens = await contract.getSupportedYieldTokens();
  const underlyingTokens = await contract.getSupportedUnderlyingTokens();
  yieldTokens.forEach((token) => {
    _alusd.yieldTokens.push(token);
    tokenList.push(token);
  });
  underlyingTokens.forEach((token) => {
    tokenList.push(token);
  });
  return true;
}

// @dev retrieves the tokens supported by the staking pools
async function initPoolTokens() {
  poolLookup.forEach((pool) => {
    tokenList.push(pool.address);
  });
  return true;
}

// @dev initializes the list of supported tokens
async function initSupportedTokens() {
  await initAlusdAlchemistTokens();
  await initPoolTokens();
  _account.loadingSupportedTokens = false;
  account.set({ ..._account });
  alusd.set({ ..._alusd });
  return true;
}

// @dev initializes the user's wallet balance
async function initWalletBalance() {
  const ethBalance = await ethers
    .getDefaultProvider(debugging ? process.env.LOCAL_NETWORK_URL : 'homestead')
    .getBalance(_account.address);
  _walletBalance.tokens = [
    ..._walletBalance.tokens,
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: utils.formatEther(ethBalance),
      address: '',
      decimals: 18,
    },
  ];
  await batchTokenCheck(tokenList);
  return true;
}

/*
 * @param tokens a list of yield tokens from the alUSD alchemist
 * @returns void
 * */
function rowBuilder(tokens) {
  const contract = getContract('AlchemistV2_alUSD');
  tokens.forEach(async (token) => {
    const params = await contract.getYieldTokenParameters(token);
    const underlyingToken = params.underlyingToken;
    const yieldConfig = await tokenFinder(token);
    const underlyingConfig = await tokenFinder(underlyingToken);
    const underlyingDecimals = underlyingConfig.decimals;
    const yieldDecimals = yieldConfig.decimals;
    const underlyingPerShare = await contract.underlyingTokensPerShare(token);
    const underlyingPerShareFormatted = utils.formatUnits(underlyingPerShare.toString(), underlyingDecimals);
    const yieldPerShare = await contract.yieldTokensPerShare(token);
    const yieldPerShareFormatted = utils.formatUnits(yieldPerShare.toString(), yieldDecimals);
    const yieldSymbol = yieldConfig.symbol;
    const underlyingSymbol = underlyingConfig.symbol;
    const tvl = utils.formatUnits(params.balance.toString(), underlyingDecimals);
    const position = await contract.positions(_account.address, token);
    const balance = utils.formatUnits(position.balance.toString(), yieldDecimals);
    const underlyingBalance = await getTokenBalance(underlyingToken);
    const vaultDebt = (balance * underlyingPerShareFormatted) / _alusd.ratio;
    const stratIsUsed = utils.formatEther(position.balance.toString()) !== '0.0';
    const depositPayload = {
      token,
      symbol: yieldSymbol,
      balance,
    };
    const rowPayload = {
      yieldSymbol,
      token,
      balance,
      yieldDecimals,
      yieldPerShare,
      yieldPerShareFormatted,
      underlyingPerShare,
      underlyingPerShareFormatted,
      underlyingSymbol,
      underlyingToken,
      underlyingBalance,
      underlyingDecimals,
      stratIsUsed,
      tvl,
      vaultDebt,
    };

    _alusd.rows.push(rowPayload);
    _alusd.maxDebt += vaultDebt;
    _aggregate.deposited.push(depositPayload);
    _aggregate.totalDeposit += depositPayload.balance;
    aggregate.set({ ..._aggregate });
    alusd.set({ ..._alusd });

    if (_alusd.yieldTokens.length === _alusd.rows.length) _alusd.loadingRowData = false;
  });
}

// @dev makes sure to not initialize vault before balances have been loaded
let rowBuilderQueueTimer;
const rowBuilderQueue = (tokens) => {
  rowBuilderQueueTimer = setTimeout(() => {
    if (!_account.loadingWalletBalance) {
      rowBuilder(tokens);
      clearTimeout(rowBuilderQueueTimer);
    } else {
      rowBuilderQueue(tokens);
    }
  }, 200);
};

// @dev initializes the alUSD vault
async function initAlusdVault() {
  const contract = getContract('AlchemistV2_alUSD');
  const rawDebt = await contract.accounts(_account.address);
  const rawRatio = await contract.minimumCollateralization();

  _alusd.userDebt = utils.formatEther(rawDebt.debt.toString());
  _alusd.ratio = utils.formatEther(rawRatio.toString());
  alusd.set({ ..._alusd });

  rowBuilderQueue(_alusd.yieldTokens);
  return true;
}

// @dev starts initialization of all vaults
async function initVaults() {
  await initAlusdVault();
  _account.loadingVaultConfigurations = false;
  account.set({ ..._account });
  _vaults.fetching = false;
  vaults.set({ ..._vaults });
  return true;
}

// @dev initializes a majority of data needed to render the site
export default async function initData() {
  setLoadingData('Supported Tokens', 1, 4);
  await initSupportedTokens();
  setLoadingData('Token Balances', 2, 4);
  await initWalletBalance();
  setLoadingData('Vault Configurations', 3, 4);
  await initVaults();
  setLoadingData('Transmuter Configurations', 4, 4);
  _account.loadingTransmuterConfigurations = false;
  account.set({ ..._account });
  closeToast();
  if (debugging) logData();
}
