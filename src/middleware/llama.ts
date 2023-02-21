import axios from 'axios';

const urlBase = 'https://coins.llama.fi/prices/current/';

type token = {
  chain: string;
  address: string;
};

export async function getTokenPriceInEth(_chain, _tokenAddress) {
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

export async function getTokenPrice(_chain: string, _tokenAddresses: string[]) {
  const queryValues = _tokenAddresses.map((address) => `${_chain}:${address}`);
  const queryUrl = `${urlBase}${queryValues}`;
  await axios
    .get(queryUrl)
    .then((response) => {
      return response.data.coins[`${_chain}:${_tokenAddresses}`].price;
    })
    .catch((error) => {
      console.error(error);
      return 0;
    });
}
