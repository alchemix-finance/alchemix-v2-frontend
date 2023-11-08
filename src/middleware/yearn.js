// see yearn documentation at https://docs.yearn.finance/vaults/yearn-api

import axios from 'axios';
import { chainIds } from '../stores/v2/constants';

function connector(networkId) {
  const legacyId = chainIds.filter((entry) => entry.id === networkId)[0].legacyId;
  return {
    url: `https://api.yexporter.io/v1/chains/${legacyId}/vaults/all`,
    method: 'GET',
  };
}

/*
 * @param tokenAddress the address of the vault
 * @returns the yearn vault object
 * */
export async function getVaultApy(vaultAddress, networkId) {
  const api = await axios(connector(networkId));
  const vaults = api.data.filter((vault) => vault.address.toUpperCase() === vaultAddress.toUpperCase());
  const vault = vaults[vaults.length - 1];
  return networkId === '0xa' ? vault.apy.net_apy + vault.apy.staking_rewards_apr : vault.apy.net_apy;
}
