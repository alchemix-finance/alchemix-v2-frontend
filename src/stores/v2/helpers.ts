import { BigNumber, ethers, utils } from 'ethers';
import { contractWrapper, erc20Contract } from '@helpers/contractWrapper';
import { BalanceType, BodyVaultType, TransmuterType } from '@stores/v2/alcxStore';
import { InternalFarmType, SushiFarmType, VaultTypes } from './types';
import { getVaultApy } from '@middleware/yearn';

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
  const userUnclaimed = await stakingInstance.getStakeTotalUnclaimed(accountAddress, poolId);

  const tvl = await stakingInstance.getPoolTotalDeposited(poolId);

  return {
    tokenAddress,
    tokenSymbol,
    userDeposit,
    isActive: rewardRate.gt(BigNumber.from(0)),
    rewardRate,
    rewardToken: 'ALCX',
    userUnclaimed,
    tvl,
    poolId,
  };
}

/*
* async function initSushiFarm() {
  // @dev set up contract instances
  const mcv2Contract = getExternalContract('SushiMasterchefV2');
  const mcv2Address = getExternalAddress('SushiMasterchefV2');
  const onsenContract = getExternalContract('SushiOnsenRewarder');
  const slpContract = getExternalContract('SushiLP');
  const slpAddress = getExternalAddress('SushiLP');
  // @dev grab data from contracts
  const slpBalance = await getTokenBalance(slpAddress);
  const rewardsSushi = await mcv2Contract.pendingSushi(0, _account.address);
  const rewardsAlcx = await onsenContract.pendingToken(0, _account.address);
  const userDeposit = await mcv2Contract.userInfo(0, _account.address);
  const totalDeposit = await slpContract.balanceOf(mcv2Address);
  const reserve = await slpContract.getReserves();
  const totalSupply = await slpContract.totalSupply();
  const alcxPerBlock = await onsenContract.tokenPerBlock();
  const sushiPerBlock = await mcv2Contract.sushiPerBlock();
  const underlying0 = await slpContract.token0();
  const underlying1 = await slpContract.token1();
  const poolConfig = externalLookup.find((pool) => pool.address === mcv2Address);
  const payload = {
    type: 'sushi',
    reward: 'yes',
    token: slpAddress,
    rewardsSushi,
    rewardsAlcx,
    slpBalance,
    userDeposit,
    tvl: totalDeposit,
    reserve,
    totalSupply,
    alcxPerBlock,
    sushiPerBlock,
    underlying0,
    underlying1,
    poolConfig,
  };
  _stakingPools.allPools.push(payload);
  stakingPools.set({ ..._stakingPools });
  return true;
}
*
* */

export async function fetchDataForSushiFarm(
  lpContractSelector: string,
  masterchefContractSelector: string,
  onsenContractSelector: string,
  [signer]: [ethers.Signer],
): Promise<SushiFarmType> {
  const { instance: lpInstance, address: lpAddress } = contractWrapper(lpContractSelector, signer);
  const { instance: onsenInstance } = contractWrapper(onsenContractSelector, signer);
  const { instance: masterchefInstance, address: masterchefAddress } = contractWrapper(
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

  return {
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
    tokenSymbol,
    tokenBalance: tokenBalance,
    totalDeposit: totalDeposit,
    tokenAddress: lpAddress,
    isActive: alcxPerBlock.add(sushiPerBlock).gt(BigNumber.from(0)),
    userDeposit: userDeposit,
    userUnclaimed: [rewardsAlcx, rewardsSushi],
    tvl: [underlying0, underlying1],
  };
}
export async function fetchDataForCrvFarm() {}
