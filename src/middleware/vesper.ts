// see documentation at https://github.com/vesperfi/doc/blob/main/api/API.md

import axios from 'axios';

const API_URL = 'https://api.vesper.finance';

function connector(endpoint: string) {
  return {
    url: `${API_URL}/${endpoint}`,
    method: 'GET',
    crossDomain: true,
  };
}

/*
 * @returns the vesper loan rate object for the VSP pool
 * */
export async function getVesperApy() {
  try {
    const poolData = await axios(connector('pools'));
    console.log(poolData.data);
    return poolData.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}
