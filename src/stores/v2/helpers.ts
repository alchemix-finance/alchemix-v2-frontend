import { BigNumber, ethers, utils } from 'ethers';
import {
  contractWrapper,
  vaultAdapterWrapper,
  erc20Contract,
  externalContractWrapper,
} from '@helpers/contractWrapper';
import type { BalanceType, BodyVaultType, TransmuterType, AdapterType } from '@stores/v2/alcxStore';
import type { CurveFarmType, InternalFarmType, SushiFarmType, VaultTypes } from './types';
import { getVaultApy } from '@middleware/yearn';
import { getVaultApr as getRocketApr } from '@middleware/rocketPool';
import { getLidoApr } from '@middleware/lido';
import { getAaveApr } from '@middleware/aave';
import { getVesperApy } from '@middleware/vesper';
import { getTokenPrice } from '@middleware/llama';
import { getFraxApy } from '@middleware/frax';
import { v4 as uuidv4 } from 'uuid';
import { VaultTypesInfos, chainIds } from './constants';

export async function fetchDataForToken(tokenAddress: string, signer: ethers.Signer): Promise<BalanceType> {
  const tokenContract = erc20Contract(tokenAddress, signer);

  const address = await signer.getAddress();
  try {
    const name = (await tokenContract.name()) || '';
    const symbol = (await tokenContract.symbol()) || '';
    const decimals = (await tokenContract.decimals()) || 18;
    const balance = (await tokenContract.balanceOf(address)) || 0;

    return {
      address: tokenAddress,
      name,
      symbol,
      decimals,
      balance,
    };
  } catch (error) {
    console.error('[fetchDataForToken]:', tokenAddress, signer, error);

    return {
      address: tokenAddress,
      name: '',
      symbol: '',
      decimals: 18,
      balance: BigNumber.from(0),
    };
  }
}

export async function fetchDataForETH(signer: ethers.Signer, network = '0x1'): Promise<BalanceType> {
  const balance = await signer.getBalance();

  return {
    symbol: chainIds.filter((entry) => entry.id === network)[0].token.symbol,
    name: chainIds.filter((entry) => entry.id === network)[0].token.name,
    balance,
    address: '0xETH',
    decimals: chainIds.filter((entry) => entry.id === network)[0].token.decimals,
  };
}

export const generateTokenPromises = (_tokens: string[], signer: ethers.Signer, network?: string) => {
  const networkName = chainIds.filter((chain) => chain.id === network)[0].abiPath;
  getTokenPrice(
    networkName || 'ethereum',
    _tokens.map((token) => token),
  );
  return _tokens.map((token) => fetchDataForToken(token, signer));
};

export async function fetchDataForVault(
  vaultType: VaultTypes,
  contractInstance: ethers.Contract,
  tokenAddress: string,
  accountAddress: string,
  signer: ethers.Signer,
  network: string,
): Promise<BodyVaultType> {
  // const position = await contract.positions(_account.address, token);
  const position = await contractInstance.positions(accountAddress, tokenAddress);
  const tokenParams = await contractInstance.getYieldTokenParameters(tokenAddress);
  const yieldPerShare = await contractInstance.getYieldTokensPerShare(tokenAddress);
  const underlyingPerShare = await contractInstance.getUnderlyingTokensPerShare(tokenAddress);
  const useGateway = VaultTypesInfos[vaultType].useGateway;
  const debtToken = await contractInstance.debtToken();
  let apy;
  if (
    VaultTypesInfos[vaultType].metaConfig.hasOwnProperty(tokenAddress) &&
    !!VaultTypesInfos[vaultType].metaConfig[tokenAddress].rewardAdapter
  ) {
    try {
      const rAdapter = VaultTypesInfos[vaultType].metaConfig[tokenAddress].rewardAdapter;
      apy =
        rAdapter === 'vesper'
          ? await rewardAdapter(rAdapter, signer, tokenAddress)
          : await rewardAdapter(rAdapter, signer, tokenParams.underlyingToken);
    } catch (e) {
      console.error(`[fetchDataForVault]:${vaultType}:${tokenAddress}`, e);
    }
  } else {
    try {
      apy = await getVaultApy(tokenAddress, network);
    } catch (e) {
      console.log(e);
      apy = 0;
    }
  }
  // reduce values by 10% cut taken by Alchemix
  apy *= 0.9;

  return {
    type: vaultType,
    address: tokenAddress,
    balance: position.shares,
    tvl: tokenParams.expectedValue,
    yieldPerShare: yieldPerShare,
    underlyingAddress: tokenParams.underlyingToken,
    underlyingPerShare: underlyingPerShare,
    apy,
    useGateway,
    debtToken,
  };
}

async function rewardAdapter(adapter: string, signer: ethers.Signer, token: string) {
  switch (adapter) {
    case 'lido':
      return getLidoApr(signer);
    case 'rocketPool':
      return getRocketApr();
    case 'aave':
      return getAaveApr(token);
    case 'vesper':
      return getVesperApy(token);
    case 'frax':
      return getFraxApy(token);
    default:
      return getVaultApy();
  }
}

export async function fetchAdapterAddress(
  vaultType: string,
  yieldToken: string,
  signer: ethers.Signer,
  _network: string,
): Promise<any> {
  const path = chainIds.filter((item) => item.id === _network)[0].abiPath;
  const { instance: alchemist } = await contractWrapper(vaultType, signer, path);
  const params = await alchemist.getYieldTokenParameters(yieldToken);

  return {
    yieldToken: yieldToken,
    adapter: params.adapter,
  };
}

export async function fetchDataForAdapter(
  vaultType: number,
  contractSelector: string,
  yieldToken: string,
  signer: ethers.Signer,
): Promise<AdapterType> {
  const { instance: adapterInstance } = vaultAdapterWrapper(contractSelector, signer);
  const price = await adapterInstance.price();

  return {
    type: vaultType,
    contractSelector: contractSelector,
    yieldToken: yieldToken,
    price: price,
  };
}

export async function fetchDataForTransmuter(
  vaultType: number,
  contractSelector: string,
  signer: ethers.Signer,
  accountAddress: string,
  _network: string,
): Promise<TransmuterType> {
  const path = chainIds.filter((item) => item.id === _network)[0].abiPath;
  const { instance: transmuterInstance, address: transmuterAddress } = await contractWrapper(
    contractSelector,
    signer,
    path,
  );

  const syntethicTokenAddress = await transmuterInstance.syntheticToken();
  const underlyingTokenAddress = await transmuterInstance.underlyingToken();
  const totalUnexchanged = await transmuterInstance.totalUnexchanged();
  const exchangedBalance = await transmuterInstance.getClaimableBalance(accountAddress);
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
  const scalar = (decimals) => BigNumber.from(10).pow(decimals);
  return (
    _vaultBalance
      .div(_debtRatio.div(scalar(18)))
      .mul(_underlyingPerShare)
      .div(scalar(_underlyingDecimals))
      .mul(scalar(BigNumber.from(18).sub(_underlyingDecimals))) ?? BigNumber.from(0)
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
  const { instance: stakingInstance } = await contractWrapper('StakingPools', signer, 'ethereum');
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
  const { instance: lpInstance, address: lpAddress } = await externalContractWrapper(
    lpContractSelector,
    signer,
  );
  const { instance: onsenInstance } = await externalContractWrapper(onsenContractSelector, signer);
  const { instance: masterchefInstance, address: masterchefAddress } = await externalContractWrapper(
    masterchefContractSelector,
    signer,
  );

  const accountAddress = await signer.getAddress();

  const lpTokenInstance = erc20Contract(lpAddress, signer);

  const tokenSymbol = await lpTokenInstance.symbol();
  const lpTotalSupply = await lpTokenInstance.totalSupply();

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
    slpTotalSupply: lpTotalSupply,
    isActive: alcxPerBlock.add(sushiPerBlock).gt(BigNumber.from(0)),
    rewardRates: [alcxPerBlock, sushiPerBlock],
    userDeposit: userDeposit.amount,
    userUnclaimed: [rewardsAlcx, rewardsSushi],
    poolTokenAddress: lpAddress,
    tvl: [reserve._reserve0, reserve._reserve1],
  };
}

export async function fetchDataForCrvFarm(
  metapoolContractSelector: string,
  depositContractSelector: string,
  rewardsContractSelector: string,
  [signer]: [ethers.Signer],
): Promise<CurveFarmType> {
  const { instance: metapoolGaugeInstance, address: metapoolAddress } = await externalContractWrapper(
    metapoolContractSelector,
    signer,
  );
  const { instance: depositGaugeInstance } = await externalContractWrapper(depositContractSelector, signer);
  const { instance: rewardsGaugeInstance } = await externalContractWrapper(rewardsContractSelector, signer);

  const accountAddress = await signer.getAddress();

  const lpToken = await depositGaugeInstance.lp_token();

  const lpTokenInstance = erc20Contract(lpToken, signer);

  const userDeposit = await depositGaugeInstance.balanceOf(accountAddress);

  // const rewardRateAlcx = await rewardsGaugeInstance.rewardRate();

  const totalSupply = await depositGaugeInstance.totalSupply();
  const virtualPrice = await metapoolGaugeInstance.get_virtual_price();

  const rewardToken = await rewardsGaugeInstance.rewardsToken();
  const crvToken = await depositGaugeInstance.crv_token();

  const tokenBalance = await lpTokenInstance.balanceOf(accountAddress);

  const rewardsCrv = await depositGaugeInstance.claimable_reward(accountAddress, crvToken);
  const rewardsAlcx = await depositGaugeInstance.claimable_reward(accountAddress, rewardToken);

  return {
    uuid: uuidv4(),
    tokenAddress: metapoolAddress,
    tokenBalance,
    userDeposit,
    tokenSymbol: await lpTokenInstance.symbol(),
    isActive: false,
    lpTokenAddress: lpToken,
    tvl: totalSupply.mul(virtualPrice).div(BigNumber.from(10).pow(18)),
    userUnclaimed: [rewardsAlcx, rewardsCrv],
    rewards: [
      {
        iconName: 'alchemix',
        tokenName: 'ALCX',
      },
      {
        iconName: 'crv',
        tokenName: 'CRV',
      },
    ],
  };
}

export async function aaveStaticToDynamicAmount(
  amount: BigNumber,
  symbol: string,
  [signer]: [ethers.Signer],
  network: string,
) {
  if (!!amount && symbol?.slice(0, 1) === 'a') {
    const networkName = chainIds.filter((chain) => chain.id === network)[0].abiPath;
    const slicer = networkName === 'optimism' ? 4 : 1;
    const { instance } = await contractWrapper(`StaticAToken_${symbol.slice(slicer)}`, signer, networkName);
    return instance.staticToDynamicAmount(amount);
  } else {
    return false;
  }
}

export async function aaveDynamicToStaticAmount(
  amount: BigNumber,
  symbol: string,
  [signer]: [ethers.Signer],
  network: string,
) {
  if (!!amount && symbol?.slice(0, 1) === 'a') {
    const networkName = chainIds.filter((chain) => chain.id === network)[0].abiPath;
    const slicer = networkName === 'optimism' ? 4 : 1;
    const { instance } = await contractWrapper(`StaticAToken_${symbol.slice(slicer)}`, signer, networkName);
    return instance.dynamicToStaticAmount(amount);
  } else {
    return false;
  }
}
