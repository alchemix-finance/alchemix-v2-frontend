import axios from 'axios';
import { reservesStore } from '@stores/aaveReserves';
import { contractWrapper } from '@helpers/contractWrapper';
import { Signer, BigNumber } from 'ethers';

const API_KEY = 'f8818d0c3602050309827e81a1d5b844';
const subgraphUrlEth = `https://gateway-arbitrum.network.thegraph.com/api/${API_KEY}/subgraphs/id/8wR23o1zkS4gpLqLNU4kG3JHYVucqGyopL5utGxP2q1N`;
const subgraphUrlOpt = `https://gateway-arbitrum.network.thegraph.com/api/${API_KEY}/subgraphs/id/DSfLz8oQBUeU5atALgUFQKMTSYV9mZAVYp4noLSXAfvb`;
const subgraphUrlArb = `https://gateway-arbitrum.network.thegraph.com/api/${API_KEY}/subgraphs/id/DLuE98kEb5pQNXAcKFQGQgfSQ57Xdou4jnVbAEqMfy3B`;

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
