import axios from 'axios';

const apiUrl = 'https://api.frax.finance/v2/frxeth/summary/latest';

export async function getFraxApy() {
  await axios
    .get(apiUrl)
    .then((res) => {
      console.log(res.data);
      return res.data.sfrxethApr;
    })
    .catch((error) => {
      console.log(error);
      return '0';
    });
}
