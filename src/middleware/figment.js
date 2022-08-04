import axios from 'axios';

export async function getRpcUrl() {
  const connector = () => {
    return {
      url: `https://ethereum-mainnet--rpc.datahub.figment.io/apikey/${process.env.FIGMENT_KEY}`,
      methods: 'POST',
      headers: {
        Authorization: process.env.FIGMENT_KEY,
      },
    };
  };
  await axios(connector())
    .then((result) => {
      console.log(result);
      return result;
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}
