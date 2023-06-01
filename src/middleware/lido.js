// see documentation at https://docs.lido.fi/integrations/api

import axios from 'axios';

function connector() {
  return {
    url: 'https://eth-api.lido.fi/v1/protocol/steth/apr/last',
    method: 'GET',
  };
}

export async function getLidoApr() {
  try {
    const api = await axios(connector());
    return api.data.data.apr / 100;
  } catch (error) {
    console.error(`[lido/getLidoApr]: ${error}`);
    throw Error(error);
  }
}
