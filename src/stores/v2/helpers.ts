import { BigNumber, ethers, utils } from 'ethers';
import { contractWrapper, erc20Contract, externalContractWrapper } from '@helpers/contractWrapper';
import { BalanceType, BodyVaultType, TransmuterType } from '@stores/v2/alcxStore';
import { InternalFarmType, SushiFarmType, VaultTypes } from './types';
import { getVaultApy } from '@middleware/yearn';
import { v4 as uuidv4 } from 'uuid';

export async function fetchDataForToken(tokenAddress: string, signer: ethers.Signer): Promise<BalanceType> {
  const tokenContract = erc20Contract(tokenAddress, signer);

  const address = await signer.getAddress();

  const name = await tokenContract.name();
  const symbol = await tokenContract.symbol();
  const decimals = await tokenContract.decimals();
  const balance = await tokenContract.balanceOf(address);

  return {
    address: tokenAddress,
    name,
    symbol,
    decimals,
    balance,
  };
}

export async function fetchDataForETH(signer: ethers.Signer): Promise<BalanceType> {
  const balance = await signer.getBalance();

  return {
    symbol: 'ETH',
    name: 'Ethereum',
    balance,
    address: '0xETH',
    decimals: 18,
  };
}

export const generateTokenPromises = (_tokens: string[], signer: ethers.Signer) => {
  return _tokens.map((token) => fetchDataForToken(token, signer));
};

// Remove the debt
export async function fetchDataForVault(
  vaultType: VaultTypes,
  contractInstance: ethers.Contract,
  tokenAddress: string,
  accountAddress: string,
): Promise<BodyVaultType> {
  // const position = await contract.positions(_account.address, token);
  const position = await contractInstance.positions(accountAddress, tokenAddress);
  const tokenParams = await contractInstance.getYieldTokenParameters(tokenAddress);
  const yieldPerShare = await contractInstance.getYieldTokensPerShare(tokenAddress);
  const underlyingPerShare = await contractInstance.getUnderlyingTokensPerShare(tokenAddress);
  const apy = await getVaultApy(tokenAddress);

  return {
    type: vaultType,
    address: tokenAddress,
    balance: position.shares,
    tvl: tokenParams.activeBalance,
    yieldPerShare: yieldPerShare,
    underlyingAddress: tokenParams.underlyingToken,
    underlyingPerShare: underlyingPerShare,
    apy,
  };
}

export async function fetchDataForTransmuter(
  vaultType: number,
  contractSelector: string,
  signer: ethers.Signer,
  accountAddress: string,
): Promise<TransmuterType> {
  const { instance: transmuterInstance, address: transmuterAddress } = contractWrapper(
    contractSelector,
    signer,
  );

  const syntethicTokenAddress = await transmuterInstance.syntheticToken();
  const underlyingTokenAddress = await transmuterInstance.underlyingToken();
  const totalUnexchanged = await transmuterInstance.totalUnexchanged();
  const exchangedBalance = await transmuterInstance.getExchangedBalance(accountAddress);
  const unexchangedBalance = await transmuterInstance.getUnexchangedBalance(accountAddress);

  return {
    type: vaultType,
    contractSelector: contractSelector,
    transmuterAddress: transmuterAddress,
    synthAddress: syntethicTokenAddress,
    underlyingTokenAddress: underlyingTokenAddress,
    totalUnexchangedBN: totalUnexchanged,
    exchangedBalanceBN: exchangedBalance,
    unexchangedBalanceBN: unexchangedBalance,
  };
}

export function calculateVaultDebt(
  _vaultBalance: BigNumber,
  _underlyingPerShare: BigNumber,
  _underlyingDecimals: number,
  _debtRatio: BigNumber,
) {
  return (
    _vaultBalance
      .div(_debtRatio.div(BigNumber.from(10).pow(18)).mul(BigNumber.from(10).pow(_underlyingDecimals)))
      .mul(_underlyingPerShare)
      .div(BigNumber.from(10).pow(_underlyingDecimals)) ?? BigNumber.from(0)
  );
}

export function getTokenDataFromBalances(address: string, [balancesStore]: [BalanceType[]]) {
  return balancesStore.find((val) => `${val.address}`.toLowerCase() === `${address}`.toLowerCase());
}

export function getTokenDataFromBalancesBySymbol(symbol: string, [balancesStore]: [BalanceType[]]) {
  return balancesStore.find((val) => val.symbol === symbol);
}

export function normalizeAmount(_amount: BigNumber, _decimalsFrom: number, _decimalsTo: number) {
  return utils.parseUnits(utils.formatUnits(_amount, _decimalsFrom), _decimalsTo);
}

export async function fetchDataForInternalFarm(
  poolId: number,
  [signer]: [ethers.Signer],
): Promise<InternalFarmType> {
  const { instance: stakingInstance } = contractWrapper('StakingPools', signer);
  const accountAddress = await signer.getAddress();

  const tokenAddress = await stakingInstance.getPoolToken(poolId);
  const tokenContract = erc20Contract(tokenAddress, signer);

  const tokenSymbol = await tokenContract.symbol();
  const userDeposit = await stakingInstance.getStakeTotalDeposited(accountAddress, poolId);

  const rewardRate = await stakingInstance.getPoolRewardRate(poolId);
  const uUnclaimed = await stakingInstance.getStakeTotalUnclaimed(accountAddress, poolId);

  const tvl = await stakingInstance.getPoolTotalDeposited(poolId);

  return {
    uuid: uuidv4(),
    tokenAddress,
    rewards: [
      {
        iconName: 'alchemix',
        tokenName: 'ALCX',
      },
    ],
    tokenSymbol,
    userDeposit,
    isActive: rewardRate.gt(BigNumber.from(0)),
    rewardRate,
    rewardToken: 'ALCX',
    userUnclaimed: [uUnclaimed],
    tvl,
    poolId,
  };
}

export async function fetchDataForSushiFarm(
  lpContractSelector: string,
  masterchefContractSelector: string,
  onsenContractSelector: string,
  [signer]: [ethers.Signer],
): Promise<SushiFarmType> {
  const { instance: lpInstance, address: lpAddress } = externalContractWrapper(lpContractSelector, signer);
  const { instance: onsenInstance } = externalContractWrapper(onsenContractSelector, signer);
  const { instance: masterchefInstance, address: masterchefAddress } = externalContractWrapper(
    masterchefContractSelector,
    signer,
  );

  const accountAddress = await signer.getAddress();

  const lpTokenInstance = erc20Contract(lpAddress, signer);

  const tokenSymbol = await lpTokenInstance.symbol();

  const tokenBalance = await lpTokenInstance.balanceOf(accountAddress);

  const rewardsSushi = await masterchefInstance.pendingSushi(0, accountAddress);
  const rewardsAlcx = await onsenInstance.pendingToken(0, accountAddress);

  const userDeposit = await masterchefInstance.userInfo(0, accountAddress);
  const totalDeposit = await lpInstance.balanceOf(masterchefAddress);

  const alcxPerBlock = await onsenInstance.tokenPerBlock();
  const sushiPerBlock = await masterchefInstance.sushiPerBlock();

  const underlying0 = await lpInstance.token0();
  const underlying1 = await lpInstance.token1();

  const reserve = await lpInstance.getReserves();

  return {
    uuid: uuidv4(),
    rewards: [
      {
        iconName: 'alchemix',
        tokenName: 'ALCX',
      },
      {
        iconName: 'sushi',
        tokenName: 'SUSHI',
      },
    ],
    underlyingAddresses: [underlying0, underlying1],
    tokenSymbol,
    tokenBalance: tokenBalance,
    totalDeposit: totalDeposit,
    tokenAddress: masterchefAddress,
    isActive: alcxPerBlock.add(sushiPerBlock).gt(BigNumber.from(0)),
    userDeposit: userDeposit,
    userUnclaimed: [rewardsAlcx, rewardsSushi],
    poolTokenAddress: lpAddress,
    tvl: [reserve._reserve0, reserve._reserve1],
  };
}

/*
s up external curve farm
async function initCurveFarm() {
  // @dev set up contract instances
  const crvMetapool = getExternalContract('CurveGaugeMetapool');
  const crvGauge = getExternalContract('CurveGaugeDeposit');
  const crvRewarder = getExternalContract('CurveGaugeRewards');
  // @dev grab data from contracts
  const rewardToken = await crvRewarder.rewardsToken();
  const lpToken = await crvGauge.lp_token();
  const tokenSymbol = await getTokenSymbol(lpToken);
  const crvToken = await crvGauge.crv_token();
  const slpBalance = await getTokenBalance(lpToken);
  const slpSupply = await crvMetapool.totalSupply();
  const userDeposit = await crvGauge.balanceOf(_account.address);
  const rewardsCrv = await crvGauge.claimable_reward(_account.address, crvToken);
  const rewardsAlcx = await crvGauge.claimable_reward(_account.address, rewardToken);
  const totalSupply = await crvGauge.totalSupply();
  const rewardRateAlcx = await crvRewarder.rewardRate();
  const virtualPrice = await crvMetapool.get_virtual_price();
  const poolConfig = externalLookup.find((pool) => pool.address.toLowerCase() === lpToken.toLowerCase());
  const userUnclaimed = `${utils.formatEther(rewardsAlcx)} ALCX + ${utils.formatEther(rewardsCrv)} CRV`;
  const payload = {
    type: 'crv',
    reward: '0.0',
    token: lpToken,
    tokenSymbol,
    lpToken,
    rewardsCrv,
    rewardsAlcx,
    slpBalance,
    slpSupply,
    userDeposit: utils.formatEther(userDeposit),
    totalSupply,
    rewardRateAlcx,
    virtualPrice,
    poolConfig,
    userUnclaimed,
  };
  _stakingPools.allPools.push(payload);
  stakingPools.set({ ..._stakingPools });
  return true;
}
* */

// export async function fetchDataForCrvFarm(
//   metapoolContractSelector: string,
//   depositContractSelector: string,
//   rewardsContractSelector: string,
//   [signer]: [ethers.Signer],
// ): Promise<CurveFarmType> {
//   const { instance: metapoolInstance } = externalContractWrapper(metapoolContractSelector, signer);
//   const { instance: depositInstance } = externalContractWrapper(depositContractSelector, signer);
//   const { instance: rewardsInstance } = externalContractWrapper(rewardsContractSelector, signer);
//
//   return {};
// }
