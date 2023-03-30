import axios from 'axios';

const apiUrl = 'https://api.frax.finance/pools';

export async function getFraxApy(token) {
  console.log(token);
  await axios
    .get(apiUrl)
    .then((res) => {
      console.log(res.data);
      console.log(res.data.filter((entry) => entry.lp_address === token));
      return '0';
    })
    .catch((error) => {
      console.log(error);
      return '0';
    });
}
