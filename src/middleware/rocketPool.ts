import axios from 'axios';

const apiUrl = 'https://stake.rocketpool.net/api/network/stats';

function getApr(
  totalAtStake: number = 1e6,
  slotsTimeInSec: number = 12,
  slotsInEpoch: number = 32,
  baseRewardFactor: number = 64,
  averageNetworkPctOnline: number = 0.95,
  validatorUptime: number = 0.99,
  validatorDeposit: number = 32,
  effectiveBalanceIncrement: number = 1e9,
  weightDenominator: number = 64,
  proposerWeigth: number = 8,
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
  const apr = (getApr(totalStake) * 1e3) / 10000;
  return apr;
}
