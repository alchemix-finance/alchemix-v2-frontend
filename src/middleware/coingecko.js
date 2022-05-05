import axios from 'axios';
import { updateTokenPrices } from '@stores/v2/methods';

function connector(endpoint, network, queryString) {
  return {
    url: `https://api.coingecko.com/api/v3/${endpoint}/${network}${queryString ? '?' + queryString : null}`,
    method: 'GET',
  };
}

export async function getTokenPrices(network, tokenAddress, currencies) {
  const queryString = `contract_addresses=${tokenAddress}&vs_currencies=${currencies
    .join(',')
    .toLowerCase()}`;
  await axios(connector('simple/token_price', network, queryString))
    .then((result) => {
      updateTokenPrices(result.data);
    })
    .catch((error) => {
      console.log(error);
    });
}
