import axios from 'axios';
import { updateTokenPrices } from '@stores/v2/methods';
import { chainIds } from '@stores/v2/constants';

function connector(endpoint, network, queryString) {
  return {
    url: `https://api.coingecko.com/api/v3/${endpoint}/${network}${queryString ? '?' + queryString : null}`,
    method: 'GET',
  };
}

export async function getTokenPrices(network, tokenAddress, currencies) {
  let geckoAssetId = 'ethereum';
  if (network !== 'ethereum') {
    try {
      const chainId = chainIds.filter((chain) => chain.abiPath === network)[0].legacyId;
      await axios.get('https://api.coingecko.com/api/v3/asset_platforms').then((result) => {
        geckoAssetId = result.data.filter(
          (item) =>
            item.id !== null &&
            item.id !== undefined &&
            (item.id.includes(network) || item.chain_identifier === chainId),
        )[0].id;
      });
    } catch (e) {
      console.error(e);
    }
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
