import axios from 'axios';
import global from '../stores/global';

function connector(endpoint) {
  return {
    url: `https://api.zapper.fi/v1/${endpoint}?api_key=${process.env.ZAPPER_KEY}`,
    method: 'GET',
    headers: {
      Authorization: process.env.ZAPPER_KEY,
    },
  };
}

async function getFiatRates() {
  await axios(connector('fiat-rates'))
    .then((result) => {
      global.fiatRates = result.data;
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      console.log(global.fiatRates);
    });
}

async function getTokenPrices() {
  await axios(connector('prices'))
    .then((result) => {
      global.tokenPrices = result.data;
    })
    .catch((error) => {
      console.error(error);
    });
}

export { getFiatRates, getTokenPrices };
