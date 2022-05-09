import axios from 'axios';
import { updateTokenPrices } from '../stores/v2/methods';

function connector(endpoint, network, queryString) {
  return {
    url: `https://api.coingecko.com/api/v3/${endpoint}/${network}${queryString ? '?' + queryString : null}`,
    method: 'GET',
  };
}

export async function getTokenPrices(network, tokenAddress, currencies) {
  let geckoAssetId = 'ethereum';
  try {
    await axios.get('https://api.coingecko.com/api/v3/asset_platforms').then((result) => {
      geckoAssetId = result.data.filter(
        (item) => item.id !== null && item.id !== undefined && item.id.includes(network),
      )[0].id;
    });
  } catch (e) {
    console.error(e);
  }
  const queryString = `contract_addresses=${tokenAddress}&vs_currencies=${currencies
    .join(',')
    .toLowerCase()}`;
  await axios(connector('simple/token_price', geckoAssetId, queryString))
    .then((result) => {
      updateTokenPrices(result.data);
    })
    .catch((error) => {
      console.log(error);
    });
}
