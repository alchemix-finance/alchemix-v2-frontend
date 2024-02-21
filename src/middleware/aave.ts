import axios from 'axios';
import { reservesStore } from '@stores/aaveReserves';
import { contractWrapper } from '@helpers/contractWrapper';
import { Signer, BigNumber } from 'ethers';

const subgraphUrlEth = 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2';
const subgraphUrlOpt = 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-optimism';
const subgraphUrlArb = 'https://api.thegraph.com/subgraphs/name/aave/protocol-v3-arbitrum';

let _reserves;
reservesStore.subscribe((val) => {
  _reserves = val;
});

function abortRequest(timeout) {
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), timeout || 0);
  return abortController.signal;
}

export async function getReservesEth() {
  let reserves;
  await axios
    .post(subgraphUrlEth, {
      signal: abortRequest(4000),
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
    .then((res) => {
      reserves = res;
    })
    .catch((error) => {
      throw Error(error);
    });
  return reserves;
}

export async function getReservesOpt() {
  let reserves;
  await axios
    .post(subgraphUrlOpt, {
      signal: abortRequest(4000),
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
    })
    .then((res) => {
      reserves = res;
    })
    .catch((error) => {
      throw Error(error);
    });
  return reserves;
}

export async function getReservesArb() {
  let reserves;
  await axios
    .post(subgraphUrlArb, {
      signal: abortRequest(4000),
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
    })
    .then((res) => {
      reserves = res;
    })
    .catch((error) => {
      throw Error(error);
    });
  return reserves;
}

export async function getAaveApr(underlyingAsset: string) {
  const reserve = [...new Set(_reserves.reduce((prev, next) => prev.concat(next), []))]
    .filter((reserve) => reserve['underlyingAsset'].toLowerCase() === underlyingAsset.toLowerCase())
    .filter((entry) => entry['aEmissionPerSecond'] !== '0')[0];
  const RAY = 10 ** 27;
  return reserve['liquidityRate'] / RAY;
}
