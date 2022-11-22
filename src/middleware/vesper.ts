// see documentation at https://github.com/vesperfi/doc/blob/main/api/API.md

import axios from 'axios';
import { vesperVaults } from '@stores/vesperVaults';

const API_URL = 'https://api.vesper.finance';

function connector(endpoint: string) {
  return {
    url: `${API_URL}/${endpoint}`,
    method: 'GET',
  };
}

let _vaults;
vesperVaults.subscribe((vaults) => (_vaults = vaults));

/*
 * @returns the data array from Versper's API
 * */
export async function getVesperData() {
  try {
    const poolData = await axios(connector('pools'));
    return poolData.data;
  } catch (e) {
    console.error(e);
    return [];
  }
}

/*
 * @param {string} tokenAddress - the address of the underlying token
 * @returns the vesper loan rate object for the VSP pool
 * */
export async function getVesperApy(token: string) {
  try {
    const tokenData = _vaults.filter((entry) => entry.address === token)[0];
    // use tokenData.hasTokenRewards to determine if there are rewards
    // if yes, fetch tokenData.tokenDeltaRates for bonus yield
    return tokenData['actualRates']['30'] / 100;
  } catch (e) {
    console.error(e);
    return null;
  }
}
