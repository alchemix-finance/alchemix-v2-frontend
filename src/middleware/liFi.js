import axios from 'axios';

export async function getQuote(fromChain, toChain, fromToken, toToken, fromAmount, fromAddress) {
  const quote = await axios
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
    .catch((error) => {
      throw Error(error.response.data.message);
    });
  return quote.data;
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
