import axios from 'axios';

export async function getQuote(fromChain, toChain, fromToken, toToken, fromAmount, fromAddress) {
  await axios
    .get('https://li.quest/v1/quote', {
      params: {
        fromChain,
        toChain,
        fromToken,
        toToken,
        fromAmount,
        fromAddress,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw Error(error.response.data.message);
    });
}

export async function getStatus(bridge, fromChain, toChain, txHash) {
  const status = await axios.get('https://li.quest/v1/status', {
    params: {
      bridge,
      fromChain,
      toChain,
      txHash,
    },
  });
  return status.data;
}
