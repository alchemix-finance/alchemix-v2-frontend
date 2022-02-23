import { BigNumber, ethers, utils } from 'ethers';
import { contractWrapper, erc20Contract } from '@helpers/contractWrapper';
import { BalanceType, BodyVaultType, TransmuterType } from '@stores/v2/alcxStore';
import { InternalFarmType, VaultTypes } from './types';
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

/*
* // @dev orchestrates initialization of all farms
async function initFarms() {
  if (_stakingPools.allPools.length === 0) {
    // @dev init external farms first
    await initSushiFarm();
    await initCurveFarm();
    // @dev continue routine for internal farms
    const contract = getContract('StakingPools');
    const poolCounter = parseInt(_stakingPools.pools, 10);
    for (let i = 0; i < poolCounter; i++) {
      const checkToken = await contract.getPoolToken(i);
      const token = checkToken.toLowerCase();
      const tokenSymbol = await getTokenSymbol(token);
      const checkReward = await contract.getPoolRewardRate(i);
      const reward = utils.formatEther(checkReward.toString());
      const checkUserDeposit = await contract.getStakeTotalDeposited(_account.address, i);
      const userDeposit = utils.formatEther(checkUserDeposit.toString());
      const checkUserUnclaimed = await contract.getStakeTotalUnclaimed(_account.address, i);
      const userUnclaimed = utils.formatEther(checkUserUnclaimed.toString());
      const tvl = await contract.getPoolTotalDeposited(i);
      // const tvl = utils.formatEther(checkTvl.toString());
      const poolConfig = poolLookup.find((pool) => pool.address === token);
      const rewardToken = 'ALCX';
      const payload = {
        token,
        tokenSymbol,
        reward,
        userDeposit,
        userUnclaimed,
        tvl,
        poolConfig,
        rewardToken,
        poolId: i,
        type: 'internal',
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
* */

export async function fetchDataForInternalFarm(poolId: number, [signer]: [ethers.Signer]): InternalFarmType {
  const { instance: stakingInstance } = contractWrapper('StakingPools', signer);
  const accountAddress = await signer.getAddress();

  const tokenAddress = await stakingInstance.getPoolToken(poolId);
  const tokenContract = erc20Contract(tokenAddress, signer);

  const tokenSymbol = await tokenContract.symbol();
  const userDeposit = await stakingInstance.getStakeTotalDeposited(accountAddress, poolId);

  const rewardRate = await stakingInstance.getPoolRewardRate(poolId);
  const userUnclaimed = await stakingInstance.getStakeTotalUnclaimed(accountAddress, i);

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
  };
}
export async function fetchDataForSushiFarm() {}
export async function fetchDataForCrvFarm() {}
