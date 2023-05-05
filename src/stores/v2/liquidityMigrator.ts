import { Signer, BigNumber, utils } from 'ethers';
import { externalContractWrapper } from '@helpers/contractWrapper';

export function test(signer: Signer) {
  return getPrice(0, signer);
}

// users can't be trusted with making sane decisions so we hardcode slippage
const BPS = BigNumber.from(10000);
const slippage = BigNumber.from(10);

export async function calculateParams(toAura: boolean, [userAddress, signer]: [string, Signer]) {
  const sushiPool = await externalContractWrapper('SushiLP', signer);
  const balancerPool = await externalContractWrapper('BalancerPool', signer);
  const auraPool = await externalContractWrapper('AuraPool', signer);
  const wethPrice = await externalContractWrapper('chainlinkEthUsdOracle', signer);
  const tokenPrice = await externalContractWrapper('chainlinkAlcxEthOracle', signer);
  return true;
}

async function calculateLpAmounts(amount: BigNumber, signer: Signer) {
  try {
    const { instance: sushiPool } = await externalContractWrapper('SushiLP', signer);
    const tokenPriceEth = await getPrice(1, signer);
    const wethPriceUsd = await getPrice(0, signer);
    const lpSupply = await sushiPool.totalSupply();
    const [wethReserves, tokenReserves] = sushiPool.getReserves();

    const tokenReservesUsd = tokenReserves.mul(tokenPriceEth).mul(wethPriceUsd).div(utils.parseEther('1'));
    const wethReservesUsd = wethReserves.mul(wethPriceUsd);
    const amountTokenUsd = amount.mul(tokenReservesUsd).div(lpSupply).mul(BPS.sub(slippage)).div(BPS);
    const amountWethUsd = amount.mul(wethReservesUsd).div(lpSupply).mul(BPS.sub(slippage)).div(BPS);
    const amountTokenMin = amountTokenUsd.mul(utils.parseEther('1')).div(tokenPriceEth.mul(wethPriceUsd));
    const amountWethMin = amountWethUsd.div(wethPriceUsd);
    return {
      amountTokenMin,
      amountWethMin,
    };
  } catch (e) {
    console.error('[calculateLpAmounts]:', e);
    return {
      amountTokenMin: BigNumber.from(0),
      amountWethMin: BigNumber.from(0),
    };
  }
}

async function calculateWethRequired(amount: BigNumber, signer: Signer) {
  try {
    const { instance: balancerPool } = await externalContractWrapper('BalancerPool', signer);
    const normalizedWeights = await balancerPool.getNormalizedWeights();
    const tokenPriceEth = await getPrice(1, signer);
    return amount
      .mul(tokenPriceEth)
      .div(utils.parseEther('1'))
      .mul(normalizedWeights[0])
      .div(normalizedWeights[1]);
  } catch (e) {
    console.error('[calculateWethRequired]:', e);
    return BigNumber.from(0);
  }
}

async function calculateTokenAmountOut(amount: BigNumber, signer: Signer) {
  try {
    const tokenPriceEth = await getPrice(1, signer);
    return amount.mul(tokenPriceEth).div(utils.parseEther('1')).mul(BPS.sub(slippage)).div(BPS);
  } catch (e) {
    console.error('[calculateTokenAmountOut]:', e);
    return BigNumber.from(0);
  }
}

async function calculateBptAmountOut(tokenAmount: BigNumber, wethAmount: BigNumber, signer: Signer) {
  try {
    const { instance: balancerPool } = await externalContractWrapper('BalancerPool', signer);
    const { instance: balancerVault } = await externalContractWrapper('BalancerVault', signer);
    const balancerPoolId = await balancerPool.getPoolId();
    const [, balances] = balancerVault.getPoolTokens(balancerPoolId);
    const normalizedWeights = await balancerPool.getNormalizedWeights();
    // fake return
    return BigNumber.from(0);
  } catch (e) {
    console.error('[calculateBptAmountOut]:', e);
    return BigNumber.from(0);
  }
}

async function getPrice(oracleSelector: number, signer: Signer) {
  enum Oracle {
    'chainlinkEthUsdOracle',
    'chainlinkAlcxEthOracle',
  }

  try {
    const { instance: oracle } = await externalContractWrapper(Oracle[oracleSelector], signer);
    const [roundId, price, , timestamp, answeredInRound] = await oracle.latestRoundData();
    if (answeredInRound.gte(roundId) && timestamp !== BigNumber.from(0) && price.gt(BigNumber.from(0))) {
      return price;
    } else {
      console.log(
        '[getPrice]: Stale price, round not complete or ChainLink answer reporting 0',
        Oracle[oracleSelector],
      );
      return BigNumber.from(0);
    }
  } catch (e) {
    console.error('[getPrice]:', e, Oracle[oracleSelector]);
    return BigNumber.from(0);
  }
}
