import axios from 'axios';
import { reservesStore } from '@stores/aaveReserves';

const subgraphUrlEth = 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2';
const subgraphUrlOpt = 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-optimism';

let _reserves;
reservesStore.subscribe((val) => {
  _reserves = val;
});

export async function getReservesEth() {
  return axios
    .post(subgraphUrlEth, {
      query: `{
        reserves {
        name
        underlyingAsset
        
        liquidityRate 
        stableBorrowRate
        variableBorrowRate
        
        aEmissionPerSecond
        vEmissionPerSecond
        sEmissionPerSecond
        
        totalATokenSupply
        totalCurrentVariableDebt
      }
    }`,
    })
    .catch((error) => {
      throw Error(error);
    });
}

export async function getReservesOpt() {
  return axios.post(subgraphUrlOpt, {
    query: `{
        reserves {
          name
          underlyingAsset
          liquidityRate
          stableBorrowRate
          variableBorrowRate
          totalATokenSupply
          totalCurrentVariableDebt
          aToken {
            rewards {
              emissionsPerSecond
            }
          }
          vToken {
            rewards {
              rewardToken
              emissionsPerSecond
            }
          }
          price {
            priceInEth
          }
          decimals
      }
    }`,
  });
}

export async function getAaveApr(underlyingAsset: string) {
  const reserve = _reserves[0]
    .filter((reserve) => reserve.underlyingAsset.toLowerCase() === underlyingAsset.toLowerCase())
    .filter((entry) => entry.aEmissionPerSecond !== '0')[0];
  const RAY = 10 ** 27;
  return reserve.liquidityRate / RAY;
}

export async function getOptimismBonus(underlyingAsset: string) {}
