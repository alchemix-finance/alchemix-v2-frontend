import { ethers, utils } from 'ethers';
import getContract, { getAddress } from './getContract';
import {
  getTokenSymbol,
  getTokenBalance,
  getTokenName,
  getTokenDecimals,
  getTokenAllowance,
} from './getTokenData';
import account from '../stores/account';
import walletBalance from '../stores/walletBalance';
import vaults, { alusd, aggregate } from '../stores/vaults';
import transmuters, { transmuterContracts } from '../stores/transmuters';
import stakingPools, { poolLookup } from '../stores/stakingPools';
import backgroundLoading from '../stores/backgroundLoading';

// @dev enable verbose messages in console when debugging
const debugging = Boolean(parseInt(process.env.DEBUG_MODE, 10));
let retry;
let startStamp;
let stopStamp;
if (debugging) console.log('====== Running initData in Debug mode ======');

// @dev prints out nicely formatted view of the initialized data
function logData() {
  retry = setTimeout(() => {
    if (
      !_account.loadingSupportedTokens &&
      !_account.loadingWalletBalance &&
      !_account.loadingVaultConfigurations &&
      !_account.loadingTransmuterConfigurations &&
      !_alusd.loadingRowData &&
      !_account.loadingFarmsConfigurations
    ) {
      stopStamp = Date.now();
      if (debugging) {
        console.log('====== Supported Tokens ======');
        console.log(tokenList);
        console.log('====== Wallet Balance ======');
        console.table(_walletBalance.tokens);
        console.log('====== Vault Configuration ======');
        console.log('Alchemist alUSD user debt:', _alusd.userDebt, 'alUSD');
        console.table(_alusd.rows);
        console.log('====== Transmuter Configuration ======');
        console.table(_transmuters.props);
        console.log('====== Farms Configuration ======');
        console.table(_stakingPools.allPools);
        console.log(`====== initData finished ( ~${(stopStamp - startStamp) / 1000}s) ======`);
      }
      _backgroundLoading.active = false;
      _backgroundLoading.message = null;
      backgroundLoading.set({ ..._backgroundLoading });
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

let _transmuters;
transmuters.subscribe((val) => {
  _transmuters = val;
});

let _stakingPools;
stakingPools.subscribe((val) => {
  _stakingPools = val;
});

let _backgroundLoading;
backgroundLoading.subscribe((val) => {
  _backgroundLoading = val;
});

// @dev list of tokens to watch
const tokenList = [];

/*
 * @param token address of the token
 * @returns the token object from the walletBalance store
 * */
async function tokenFinder(token) {
  if (debugging) console.log(':: tokenFinder');
  return _walletBalance.tokens.find((item) => item.address === token);
}

/*
 * @dev queries token details for a list of tokens
 * @param tokens the list of token addresses
 *  */
async function batchTokenCheck(tokens) {
  if (debugging) console.log(':: batchTokenCheck');
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
  if (debugging) console.log(':: initAlusdAlchemistTokens');
  const contract = getContract('AlchemistV2_alUSD');
  const yieldTokens = await contract.getSupportedYieldTokens();
  const underlyingTokens = await contract.getSupportedUnderlyingTokens();
  const dupeCheck = (token) => tokenList.some((entry) => entry === token);
  yieldTokens.forEach((token) => {
    if (!dupeCheck(token)) {
      _alusd.yieldTokens.push(token);
      tokenList.push(token);
    }
  });
  underlyingTokens.forEach((token) => {
    if (!dupeCheck(token)) {
      tokenList.push(token);
    }
  });
  return true;
}

// @dev retrieves the tokens supported by the staking pools
async function initPoolTokens() {
  if (debugging) console.log(':: initPoolTokens');
  const contract = getContract('StakingPools');
  _stakingPools.pools = ethers.BigNumber.from(await contract.poolCount()).toString();
  const dupeCheck = (token) => tokenList.some((entry) => entry === token);
  stakingPools.set({ ..._stakingPools });
  poolLookup.forEach((pool) => {
    if (!dupeCheck(pool.address)) {
      tokenList.push(pool.address);
    }
  });
  return true;
}

// @dev initializes the list of supported tokens
async function initSupportedTokens() {
  if (debugging) console.log(':: initSupportedTokens');
  await initAlusdAlchemistTokens();
  await initPoolTokens();
  _account.loadingSupportedTokens = false;
  account.set({ ..._account });
  alusd.set({ ..._alusd });
  return true;
}

// @dev initializes the user's wallet balance
async function initWalletBalance() {
  if (debugging) console.log(':: initWalletBalance');
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
function vaultAlusdRowBuilder(tokens) {
  if (debugging) console.log(':: vaultAlusdRowBuilder');
  if (_alusd.rows.length === 0) {
    const contract = getContract('AlchemistV2_alUSD');
    tokens.forEach(async (token) => {
      const params = await contract.getYieldTokenParameters(token);
      const underlyingToken = params.underlyingToken;
      const yieldConfig = await tokenFinder(token);
      const underlyingConfig = await tokenFinder(underlyingToken);
      const underlyingDecimals = underlyingConfig.decimals;
      const yieldDecimals = yieldConfig.decimals;
      const underlyingPerShare = await contract.underlyingTokensPerShare(token);
      const underlyingPerShareFormatted = utils.formatUnits(
        underlyingPerShare.toString(),
        underlyingDecimals,
      );
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
  } else {
    _alusd.loadingRowData = false;
  }
}

// @dev makes sure to not initialize vault before balances have been loaded
let vaultAlusdRowBuilderQueueTimer;
const vaultAlusdRowBuilderQueue = (tokens) => {
  vaultAlusdRowBuilderQueueTimer = setTimeout(() => {
    if (!_account.loadingWalletBalance) {
      vaultAlusdRowBuilder(tokens);
      clearTimeout(vaultAlusdRowBuilderQueueTimer);
    } else {
      vaultAlusdRowBuilderQueue(tokens);
    }
  }, 200);
};

// @dev initializes the alUSD vault
async function initAlusdVault() {
  if (debugging) console.log(':: initAlusdVault');
  const contract = getContract('AlchemistV2_alUSD');
  const rawDebt = await contract.accounts(_account.address);
  const rawRatio = await contract.minimumCollateralization();

  _alusd.userDebt = utils.formatEther(rawDebt.debt.toString());
  _alusd.ratio = utils.formatEther(rawRatio.toString());
  alusd.set({ ..._alusd });

  vaultAlusdRowBuilderQueue(_alusd.yieldTokens);
  return true;
}

// @dev orchestrates initialization of all vaults
async function initVaults() {
  if (debugging) console.log(':: initVaults');
  await initAlusdVault();
  _account.loadingVaultConfigurations = false;
  account.set({ ..._account });
  _vaults.fetching = false;
  vaults.set({ ..._vaults });
  return true;
}

// @dev orchestrates initialization of all transmuters
function initTransmuters() {
  if (debugging) console.log(':: initTransmuters');
  if (_transmuters.props.length === 0) {
    let counter = 0;
    transmuterContracts.forEach(async (transmuter) => {
      const contract = getContract(transmuter);
      const address = getAddress(transmuter);
      const getAlToken = await contract.syntheticToken();
      const alToken = getAlToken.toLowerCase();
      const alTokenAllowance = await getTokenAllowance(getAlToken, _account.address, address);
      const alTokenSymbol = await getTokenSymbol(getAlToken);
      const getUnderlyingToken = await contract.underlyingToken();
      const underlyingTokenSymbol = await getTokenSymbol(getUnderlyingToken);
      const getTotalUnexchanged = await contract.totalUnexchanged();
      const getExchangedBalance = await contract.getExchangedBalance(_account.address);
      const exchangedBalance = utils.formatEther(getExchangedBalance.toString());
      const getUnexchangedBalance = await contract.getUnexchangedBalance(_account.address);
      const unexchangedBalance = utils.formatEther(getUnexchangedBalance.toString());
      const exchangedBN = ethers.BigNumber.from(getExchangedBalance);
      const unexchangedBN = ethers.BigNumber.from(getUnexchangedBalance);
      const totalDeposited = utils.formatEther(exchangedBN.add(unexchangedBN).toString());
      const payload = {
        address,
        getAlToken,
        alToken,
        alTokenAllowance,
        alTokenSymbol,
        underlyingTokenSymbol,
        getTotalUnexchanged,
        getExchangedBalance,
        exchangedBalance,
        getUnexchangedBalance,
        unexchangedBalance,
        exchangedBN,
        unexchangedBN,
        totalDeposited,
      };
      _transmuters.props.push(payload);
      transmuters.set({ ..._transmuters });
      counter += 1;
      if (transmuterContracts.length === counter) {
        _account.loadingTransmuterConfigurations = false;
        account.set({ ..._account });
      }
    });
  } else {
    _account.loadingTransmuterConfigurations = false;
    account.set({ ..._account });
  }

  return true;
}

// @dev orchestrates initialization of all farms
async function initFarms() {
  if (debugging) console.log(':: initFarms');
  if (_stakingPools.allPools.length === 0) {
    const contract = getContract('StakingPools');
    const poolCounter = parseInt(_stakingPools.pools, 10);
    for (let i = 0; i < poolCounter; i++) {
      const checkToken = await contract.getPoolToken(i);
      const token = checkToken.toLowerCase();
      const checkReward = await contract.getPoolRewardRate(i);
      const reward = utils.formatEther(checkReward.toString());
      const checkUserDeposit = await contract.getStakeTotalDeposited(_account.address, i);
      const userDeposit = utils.formatEther(checkUserDeposit.toString());
      const checkUserUnclaimed = await contract.getStakeTotalUnclaimed(_account.address, i);
      const userUnclaimed = utils.formatEther(checkUserUnclaimed.toString());
      const checkTvl = await contract.getPoolTotalDeposited(i);
      const tvl = utils.formatEther(checkTvl.toString());
      const poolConfig = poolLookup.find((pool) => pool.address === token);
      const rewardToken = 'ALCX';
      const payload = {
        token,
        reward,
        userDeposit,
        userUnclaimed,
        tvl,
        poolConfig,
        rewardToken,
        poolId: i,
      };
      _stakingPools.allPools.push(payload);
      stakingPools.set({ ..._stakingPools });
      if (i + 1 === poolCounter) {
        _account.loadingFarmsConfigurations = false;
        account.set({ ..._account });
      }
    }
  } else {
    _account.loadingFarmsConfigurations = false;
    account.set({ ..._account });
  }
}

// @dev prints neato ascii art. bitches love ascii art
function leet() {
  console.log(
    `%c  
 ▄▄▄       ██▓     ▄████▄   ██░ ██ ▓█████  ███▄ ▄███▓ ██▓▒██   ██▒
▒████▄    ▓██▒    ▒██▀ ▀█  ▓██░ ██▒▓█   ▀ ▓██▒▀█▀ ██▒▓██▒▒▒ █ █ ▒░
▒██  ▀█▄  ▒██░    ▒▓█    ▄ ▒██▀▀██░▒███   ▓██    ▓██░▒██▒░░  █   ░
░██▄▄▄▄██ ▒██░    ▒▓▓▄ ▄██▒░▓█ ░██ ▒▓█  ▄ ▒██    ▒██ ░██░ ░ █ █ ▒ 
 ▓█   ▓██▒░██████▒▒ ▓███▀ ░░▓█▒░██▓░▒████▒▒██▒   ░██▒░██░▒██▒ ▒██▒
 ▒▒   ▓▒█░░ ▒░▓  ░░ ░▒ ▒  ░ ▒ ░░▒░▒░░ ▒░ ░░ ▒░   ░  ░░▓  ▒▒ ░ ░▓ ░
  ▒   ▒▒ ░░ ░ ▒  ░  ░  ▒    ▒ ░▒░ ░ ░ ░  ░░  ░      ░ ▒ ░░░   ░▒ ░
  ░   ▒     ░ ░   ░         ░  ░░ ░   ░   ░      ░    ▒ ░ ░    ░  
      ░  ░    ░  ░░ ░       ░  ░  ░   ░  ░       ░    ░   ░    ░  
                  ░              
                                                   
=============================[ v2 ]=================================

GitHub:   https://github.com/alchemix-finance
Twitter:  https://twitter.com/alchemixfi
Telegram: lmao no

Make sure you're running this on ${
      process.env.APP_URL ||
      'if you can read this, the site you are visiting right now is probably trying to scam you'
    }
We will never ask you for your private key or seedphrase.

========================[ DISCLAIMER ]==============================

All rights reserved, no guarantees given.
DeFi tools are not toys.
Use at your own risk.

  `,
    'color: #F5C09A',
  );
}

// @dev initializes a majority of data needed to render the site
export default async function initData() {
  if (debugging) {
    startStamp = Date.now();
  }
  leet();
  _backgroundLoading.message = 'Tokens';
  _backgroundLoading.active = true;
  backgroundLoading.set({ ..._backgroundLoading });
  await initSupportedTokens();
  _backgroundLoading.message = 'Balances';
  backgroundLoading.set({ ..._backgroundLoading });
  await initWalletBalance();
  _backgroundLoading.message = 'Vaults';
  backgroundLoading.set({ ..._backgroundLoading });
  await initVaults();
  _backgroundLoading.message = 'Transmuters';
  backgroundLoading.set({ ..._backgroundLoading });
  initTransmuters();
  _backgroundLoading.message = 'Farms';
  backgroundLoading.set({ ..._backgroundLoading });
  initFarms();
  logData();
  _backgroundLoading.message = 'Finalizing';
  backgroundLoading.set({ ..._backgroundLoading });
}
