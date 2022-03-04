// see zapper documentation at https://api.zapper.fi/api/static/index.html

import axios from 'axios';
import global from '../stores/global';

let _global;

global.subscribe((val) => {
  _global = val;
});

/*
 * @dev generates connection payload for axios requests
 * @param endpoint the zapper endpoint as per their documentation
 * @param timeout optional parameter to limit request retries
 * */
function connector(endpoint, timeout) {
  return {
    url: `https://api.zapper.fi/v1/${endpoint}?api_key=${process.env.ZAPPER_KEY}&eip1559=true&network=ethereum`,
    method: 'GET',
    headers: {
      Authorization: process.env.ZAPPER_KEY,
    },
    timeout: timeout || 0,
  };
}

// @dev retrieves the fiat conversion rates
export async function getFiatRates() {
  await axios(connector('fiat-rates'))
    .then((result) => {
      _global.fiatRates = result.data;
      global.set({ ..._global });
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

// @dev retrieves all available token prices
export async function getTokenPrices() {
  await axios(connector('prices'))
    .then((result) => {
      _global.tokenPrices = result.data;
      global.set({ ..._global });
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

// @dev retrieves three levels of current gas prices
export async function getGasPrices(timeout) {
  await axios(connector('gas-price', timeout || 0))
    .then((result) => {
      _global.gasPrices = {
        standard: result.data.standard,
        fast: result.data.fast,
        instant: result.data.instant,
      };
      global.set({ ..._global });
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}
