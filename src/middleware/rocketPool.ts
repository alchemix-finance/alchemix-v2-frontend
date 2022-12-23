import axios from 'axios';

const apiUrl = 'https://api.rocketpool.net/api/mainnet/apr';

export async function getVaultApr() {
  const api = await axios({
    url: apiUrl,
    method: 'GET',
  });
  const totalStake = api.data.yearlyAPR;
  return totalStake / 100;
}
