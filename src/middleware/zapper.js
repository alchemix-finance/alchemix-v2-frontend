// see zapper documentation at https://api.zapper.fi/api/static/index.html

import axios from 'axios';
import global from '../stores/global';
import tokenPrices from '../stores/tokenPrices';

let _global;
let _tokenPrices;

global.subscribe((val) => {
  _global = val;
});

tokenPrices.subscribe((val) => {
  _tokenPrices = val;
});

/*
 * @dev generates connection payload for axios requests
 * @param endpoint the zapper endpoint as per their documentation
 * @param timeout optional parameter to limit request retries
 * */
function connector(endpoint, timeout, network) {
  return {
    url: `https://api.zapper.fi/v1/${endpoint}?api_key=${process.env.ZAPPER_KEY}&eip1559=true&network=${network}`,
    method: 'GET',
    headers: {
      Authorization: process.env.ZAPPER_KEY,
    },
    timeout: timeout || 0,
  };
}

// @dev retrieves the fiat conversion rates
export async function getFiatRates() {
  await axios(connector('fiat-rates', null, 'ethereum'))
    .then((result) => {
      _global.fiatRates = result.data;
      global.set({ ..._global });
    })
    .catch((error) => {
      console.error(error);
      _global.fiatRates = { USD: 1 };
      global.set({ ..._global });
      throw error;
    });
}

// @dev retrieves all available token prices
export async function getTokenPrices(network) {
  await axios(connector('prices', null, network || 'ethereum'))
    .then((result) => {
      _global.tokenPrices = result.data;
      _tokenPrices = result.data;
      global.set({ ..._global });
      tokenPrices.set([..._tokenPrices]);
    })
    .catch((error) => {
      console.error(error);
      _global.tokenPrices = [];
      _tokenPrices = [];
      global.set({ ..._global });
      tokenPrices.set([..._tokenPrices]);
      throw error;
    });
}

// @dev retrieves three levels of current gas prices
export async function getGasPrices(timeout, network) {
  await axios(connector('gas-prices', timeout || 0, network || 'ethereum'))
    .then((result) => {
      _global.gasPrices = {
        eip1559: result.data.eip1559,
        standard: result.data.standard,
        fast: result.data.fast,
        instant: result.data.instant,
      };
      global.set({ ..._global });
    })
    .catch((error) => {
      console.error(error);
      _global.gasPrices = {
        standard: 0,
        fast: 0,
        instant: 0,
      };
      global.set({ ..._global });
      throw error;
    });
}
