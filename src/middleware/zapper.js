// see zapper documentation at https://api.zapper.fi/api/static/index.html

import axios from 'axios';
import global from '../stores/global';

let _global;

global.subscribe((val) => {
  _global = val;
});

/*
 * @dev generates connection payload for axios requests
 * @params endpoint the zapper endpoint as per their documentation
 * */
function connector(endpoint) {
  return {
    url: `https://api.zapper.fi/v1/${endpoint}?api_key=${process.env.ZAPPER_KEY}`,
    method: 'GET',
    headers: {
      Authorization: process.env.ZAPPER_KEY,
    },
  };
}

// @dev retrieves the fiat conversion rates
async function getFiatRates() {
  await axios(connector('fiat-rates'))
    .then((result) => {
      _global.fiatRates = result.data;
      global.set({ ..._global });
    })
    .catch((error) => {
      console.error(error);
    });
}

// @dev retrieves all available token prices
async function getTokenPrices() {
  await axios(connector('prices'))
    .then((result) => {
      _global.tokenPrices = result.data;
      global.set({ ..._global });
    })
    .catch((error) => {
      console.error(error);
    });
}

export { getFiatRates, getTokenPrices };
