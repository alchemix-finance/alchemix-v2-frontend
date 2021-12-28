import { utils } from 'ethers';
import getContract from './getContract';
import { getTokenSymbol, getTokenBalance, getTokenName, getTokenDecimals } from './getTokenData';
import walletBalance from '../stores/walletBalance';

let _walletBalance;

walletBalance.subscribe((val) => {
  _walletBalance = val;
});

// @dev list of tokens to force-watch
const tokenList = ['0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9'];

/*
 * @dev queries token details for a list of tokens
 * @params tokens the list of token addresses
 * */
const batchTokenCheck = async (tokens) => {
  // TODO refactor to properly wait for each token result before moving on
  tokens.forEach(async (token) => {
    const payload = {
      address: token,
      symbol: null,
      name: null,
      balance: null,
    };
    const decimals = await getTokenDecimals(token);
    payload.symbol = await getTokenSymbol(token);
    payload.balance = utils.formatUnits(await getTokenBalance(token), decimals);
    payload.name = await getTokenName(token);
    _walletBalance.tokens.push(payload);
    walletBalance.set({ ..._walletBalance });
  });
};

/*
 * @dev initializes the user's wallet balance with tokens supported by the alchemists
 * */
const initAlUsdAlchemist = async () => {
  const contract = getContract('AlchemistV2_alUSD');
  const yieldTokens = await contract.getSupportedYieldTokens();
  const underlyingTokens = await contract.getSupportedUnderlyingTokens();
  tokenList.push(...yieldTokens);
  tokenList.push(...underlyingTokens);
  return true;
};

/*
 * @dev initializes user's wallet balance
 * */
const initBalance = async () => {
  await initAlUsdAlchemist();
  await batchTokenCheck(tokenList);
  return true;
};

export default initBalance;
