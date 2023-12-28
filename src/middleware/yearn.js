// see yearn documentation at https://docs.yearn.finance/vaults/yearn-api

import axios from 'axios';
import { chainIds } from '@stores/v2/constants';

function connector(networkId, address) {
  const legacyId = chainIds.filter((entry) => entry.id === networkId)[0].legacyId;
  return {
    url: `https://ydaemon.yearn.fi/${legacyId}/vaults/${address}`,
    method: 'GET',
  };
}

export async function getVaultApy(vaultAddress, networkId) {
  const api = await axios(connector(networkId, vaultAddress));
  const vault = api.data;
  return networkId === '0xa' ? vault.apr.netAPR + vault.apr.extra.stakingRewardsAPR : vault.apr.netAPR;
}
