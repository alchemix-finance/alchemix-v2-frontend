import { ethers } from 'ethers';
import { erc20Contract } from '@helpers/contractWrapper';
import { BalanceType, TokensType } from '@stores/v2/alcxStore';
import { arrayDoubleCheck } from '@helpers/arrayHelpers';
import { poolLookup } from '@stores/stakingPools';

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

export function getFullTokenList(tokenList: TokensType) {
  const _list = [...poolLookup.map((pool) => pool.address)];

  Object.keys(tokenList).forEach((vaultKey) => {
    Object.keys(tokenList[vaultKey]).forEach((tokenKey) => {
      tokenList[vaultKey][tokenKey].forEach((address) => {
        if (arrayDoubleCheck(address, tokenList[vaultKey][tokenKey])) {
          _list.push(address);
        }
      });
    });
  });

  return _list;
}
