import axios from 'axios';

export async function getTokenPriceInEth(_chain, _tokenAddress) {
  const urlBase = 'https://coins.llama.fi/prices/current/';
  const queryUrl = `${urlBase}${_chain}:${_tokenAddress}`;
  const ethData = await axios
    .get(`${urlBase}coingecko:ethereum`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
      return 0;
    });
  return axios
    .get(queryUrl)
    .then((response) => {
      const ethPrice = ethData.coins['coingecko:ethereum'].price;
      const tokenPrice = response.data.coins[`${_chain}:${_tokenAddress}`].price;
      return tokenPrice / ethPrice;
    })
    .catch((error) => {
      console.error(error);
      return 0;
    });
}
