import axios from 'axios';

const apiUrl = 'https://stake.rocketpool.net/api/mainnet/network/stats';

function getApr(
  totalAtStake = 1e6,
  slotsTimeInSec = 12,
  slotsInEpoch = 32,
  baseRewardFactor = 64,
  averageNetworkPctOnline = 0.95,
  validatorUptime = 0.99,
  validatorDeposit = 32,
  effectiveBalanceIncrement = 1e9,
  weightDenominator = 64,
  proposerWeigth = 8,
) {
  const a = 315569088e-1 / (slotsTimeInSec * slotsInEpoch);
  const c = (effectiveBalanceIncrement * baseRewardFactor) / (totalAtStake * 1e9) ** 0.5;
  const d = ((validatorDeposit * 1e9) / effectiveBalanceIncrement) * c;
  const e = d * ((weightDenominator - proposerWeigth) / weightDenominator);
  const f = d * averageNetworkPctOnline * validatorUptime;
  const g = e * (1 - validatorUptime);
  return (a * (f - g)) / 1e9 / validatorDeposit;
}

export async function getVaultApr() {
  const api = await axios({
    url: apiUrl,
    method: 'GET',
  });
  const totalStake = api.data.ethStakingTotal;
  return (getApr(totalStake) * 1e3) / 10000;
}
