import axios from 'axios';

const apiUrl = 'https://api.frax.finance/v2/frxeth/summary/latest';

export async function getFraxApy() {
  let apr;
  await axios
    .get(apiUrl)
    .then((res) => {
      apr = res.data.sfrxethApr / 100;
    })
    .catch((error) => {
      console.log(error);
      apr = null;
    });
  return apr;
}
