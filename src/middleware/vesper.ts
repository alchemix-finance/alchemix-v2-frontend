// see documentation at https://github.com/vesperfi/doc/blob/main/api/API.md

import axios from 'axios';

const API_URL = 'https://api.vesper.finance';

function connector(endpoint: string) {
  return {
    url: `${API_URL}/${endpoint}`,
    method: 'GET',
  };
}

/*
 * @returns the vesper loan rate object for the VSP pool
 * */
export async function getVesperApy() {
  try {
    // @dev we're waiting for whitelisting to be enabled on the API endpoint
    // const poolData = await axios(connector('pools'));
    // console.log(poolData.data);
    // return poolData.data;
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
}
