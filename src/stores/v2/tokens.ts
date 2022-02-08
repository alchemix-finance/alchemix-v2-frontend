import { poolLookup } from '@stores/stakingPools';
import { derived } from 'svelte/store';
import { makeProviderStore, provider } from '@stores/v2/accounts';
import { DefaultDerivedState, DerivedStatus } from '@helpers/storeHelpers';
import { ethers } from 'ethers';
import { contractWrapper } from '@helpers/contractWrapper';
import { arrayDoubleCheck } from '@helpers/arrayHelpers';

// async function initAlusdAlchemistTokens() {
//   const contract = getContract('AlchemistV2_alUSD');
//   const yieldTokens = await contract.getSupportedYieldTokens();
//   const underlyingTokens = await contract.getSupportedUnderlyingTokens();
//   const dupeCheck = (token) => tokenList.some((entry) => entry === token);
//   yieldTokens.forEach((token) => {
//     if (!dupeCheck(token)) {
//       _alusd.yieldTokens.push(token);
//       tokenList.push(token);
//     }
//   });
//   underlyingTokens.forEach((token) => {
//     if (!dupeCheck(token)) {
//       tokenList.push(token);
//     }
//   });
//   return true;
// }
// // @dev retrieves the tokens supported by the staking pools
// async function initPoolTokens() {
//   const contract = getContract('StakingPools');
//   _stakingPools.pools = ethers.BigNumber.from(await contract.poolCount()).toString();
//   const dupeCheck = (token) => tokenList.some((entry) => entry === token);
//   stakingPools.set({ ..._stakingPools });
//   poolLookup.forEach((pool) => {
//     if (!dupeCheck(pool.address)) {
//       tokenList.push(pool.address);
//     }
//   });
//   return true;
// }
// // @dev initializes the list of supported tokens
// async function initSupportedTokens() {
//   await initAlusdAlchemistTokens();
//   await initPoolTokens();
//   _account.loadingSupportedTokens = false;
//   account.set({ ..._account });
//   alusd.set({ ..._alusd });
//   return true;
// }

/*
* async (contract: ethers.Contract) => {
  const yieldTokens = await contract.getSupportedYieldTokens();
  const underlyingTokens = await contract.getSupportedUnderlyingTokens();

  return [yieldTokens, underlyingTokens];
};
* */

export const fetchTokensForAlchemist = (contractAlUSD: ethers.Contract) =>
  Promise.all([contractAlUSD.getSupportedYieldTokens, contractAlUSD.getSupportedUnderlyingTokens]);

export const makeTokensStore = (providerInstance: ReturnType<typeof makeProviderStore>) => {
  const POOL_ADDRESSES = [...poolLookup.map((value) => value.address)];

  const { signer } = providerInstance;

  return {
    tokenList: derived(
      [signer],
      ([$signer], _set) => {
        if ($signer) {
          let tokensAddresses = [...POOL_ADDRESSES];

          fetchTokensForAlchemist(contractWrapper('AlchemistV2_alUSD', $signer).instance)
            .then(([alusdYieldTokens, alusdUnderlyingTokens]) => {
              alusdYieldTokens.forEach((token) => {
                if (!arrayDoubleCheck(token, tokensAddresses)) tokensAddresses.push(token);
              });

              alusdUnderlyingTokens.forEach((token) => {
                if (!arrayDoubleCheck(token, tokensAddresses)) tokensAddresses.push(token);
              });

              _set({ Value: tokensAddresses, Status: DerivedStatus.LOADED });
            })
            .catch((error) => {
              console.error(`[fetchTokensForAlchemist/tokens]: ${error}`);
              _set({ Value: undefined, Status: DerivedStatus.ERROR });
            });
        }
        return () => {
          _set({ Value: undefined, Status: DerivedStatus.LOADING });
        };
      },
      { ...DefaultDerivedState },
    ),
  };
};

export const tokens = makeTokensStore(provider);
