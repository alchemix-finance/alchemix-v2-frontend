import { BigNumber, ethers } from 'ethers';
import { erc20Contract } from '@helpers/contractWrapper';
import { BalanceType, BodyVaultType, TokensType } from '@stores/v2/alcxStore';
import { VaultTypes } from './types';

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
  signer: ethers.Signer,
  contractInstance: ethers.Contract,
  tokenAddress: string,
  accountAddress: string,
  balancesArr: BalanceType[],
  debtRatio: ethers.BigNumber,
): Promise<BodyVaultType> {
  // const position = await contract.positions(_account.address, token);
  const _yToken = balancesArr.find((elm) => elm.address === tokenAddress);

  const position = await contractInstance.positions(accountAddress, tokenAddress);
  const tokenParams = await contractInstance.getYieldTokenParameters(tokenAddress);
  const yieldPerShare = await contractInstance.getYieldTokensPerShare(tokenAddress);

  const _uyToken = balancesArr.find((elm) => elm.address === tokenParams.underlyingToken);

  const underlyingPerShare = await contractInstance.getUnderlyingTokensPerShare(tokenAddress);

  const uyInstance = erc20Contract(_uyToken.address, signer);

  const uyBalance = await uyInstance.balanceOf(accountAddress);

  // Check if debtRatio is null
  const _debtRatio = debtRatio ?? BigNumber.from(0);

  /**
   *  const vaultDebt = balance
        .div(utils.parseUnits(_alusd.ratio, 18))
        .mul(underlyingPerShare)
        .div(ethers.BigNumber.from(10).pow(underlyingDecimals));
   * 
   */

  const debt = position.shares
    .mul(underlyingPerShare.div(BigNumber.from(10).pow(_uyToken.decimals)))
    .div(_debtRatio.div(BigNumber.from(10).pow(18)));
  // .pow(_uyToken.decimals)

  const isUsed = BigNumber.from(position.shares).gt(BigNumber.from(0));

  return {
    type: vaultType,
    symbol: _yToken.symbol,
    address: tokenAddress,
    balance: position.shares,
    tvl: tokenParams.activeBalance,
    yieldPerShare: yieldPerShare,
    underlyingAddress: tokenParams.underlyingToken,
    underlyingBalance: uyBalance,
    underlyingDecimals: _uyToken.decimals,
    underlyingSymbol: _uyToken.symbol,
    underlyingPerShare: underlyingPerShare,
    decimals: _yToken.decimals,
    debt: debt,
    isUsed: isUsed,
  };
}
