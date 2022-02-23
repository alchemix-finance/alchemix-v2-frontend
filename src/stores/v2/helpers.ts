import { BigNumber, ethers, utils } from 'ethers';
import { contractWrapper, erc20Contract } from '@helpers/contractWrapper';
import { BalanceType, BodyVaultType, TransmuterType, AdapterType } from '@stores/v2/alcxStore';
import { VaultTypes } from './types';
import { getVaultApy } from '@middleware/yearn';
import { VaultTypesInfos } from '@stores/v2/constants';

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
  const useGateway = VaultTypesInfos[vaultType].useGateway;

  return {
    type: vaultType,
    address: tokenAddress,
    balance: position.shares,
    tvl: tokenParams.activeBalance,
    yieldPerShare: yieldPerShare,
    underlyingAddress: tokenParams.underlyingToken,
    underlyingPerShare: underlyingPerShare,
    apy,
    useGateway,
  };
}

export async function fetchDataForAdapter(
  vaultType: number,
  contractSelector: string,
  signer: ethers.Signer,
): Promise<AdapterType> {
  const { instance: adapterInstance } = contractWrapper(contractSelector, signer);

  const price = await adapterInstance.price();

  return {
    type: vaultType,
    contractSelector: contractSelector,
    price: price,
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
