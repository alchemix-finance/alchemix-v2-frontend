import axios from 'axios';

const subgraphUrl = 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2\n';

export async function getReserves() {
  return axios
    .post(subgraphUrl, {
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

// export async function getApy(aToken: string);
