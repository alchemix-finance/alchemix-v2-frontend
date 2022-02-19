// see yearn documentation at https://docs.yearn.finance/vaults/yearn-api

import axios from 'axios';

const apiUrl = 'https://api.yearn.finance/v1/chains/1/vaults/all';

function connector() {
  return {
    url: apiUrl,
    method: 'GET',
  };
}

/*
 * @param tokenAddress the address of the vault
 * @returns the yearn vault object
 * */
export async function getVaultApy(vaultAddress) {
  const api = await axios(connector());
  const vaults = api.data.filter((vault) => vault.address.toUpperCase() === vaultAddress.toUpperCase());
  const vault = vaults[vaults.length - 1];
  return vault.apy.net_apy;
}
