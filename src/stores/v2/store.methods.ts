import { rawStore, StoreType } from '@stores/v2/store';
import { VaultType } from '@stores/v2/types';
import supportedVaults from '@stores/v2/constants';
import { contractWrapper } from '@helpers/contractWrapper';
import { arrayDoubleCheck } from '@helpers/arrayHelpers';

/*
* export const fetchTokensForAlchemist = (contractAlUSD: ethers.Contract) =>
  Promise.all([contractAlUSD.getSupportedYieldTokens, contractAlUSD.getSupportedUnderlyingTokens]);

// TODO: This needs to be made more dynamic
export const makeTokensStore = (providerInstance: ReturnType<typeof makeProviderStore>) => {
  const alUSDYieldTokens = writable([]);
  const POOL_ADDRESSES = [...poolLookup.map((value) => value.address)];

  const { signer } = providerInstance;

  const yieldTokensALUSD = derived(
    [signer],
    ([$signer], _set) => {
      if ($signer) {
        let _tokens = [];

        const contractInstance = contractWrapper('AlchemistV2_alUSD', $signer).instance;

        Promise.all([contractInstance.getSupportedYieldTokens])
          .then(([supportedYieldTokens]) => {
            supportedYieldTokens.forEach((token) => {
              if (!arrayDoubleCheck(token, _tokens)) {
                _tokens.push(token);
              }
            });
          })
          .catch((error) => {
            console.error(`[makeTokensStore/ALUSDYieldTokens]: ${error}`);
            _set({ Value: undefined, Status: DerivedStatus.ERROR });
          });
      }

      return () => {
        _set({ Value: undefined, Status: DerivedStatus.LOADING });
      };
    },
    { ...DefaultDerivedState },
  );

  return {
    yieldTokensALUSD,
    allTokens: derived(
      [signer],
      ([$signer], _set) => {
        if ($signer) {
          let tokensAddresses = [...POOL_ADDRESSES];

          fetchTokensForAlchemist(contractWrapper('AlchemistV2_alUSD', $signer).instance)
            .then(([alusdYieldTokens, alusdUnderlyingTokens]) => {
              alusdYieldTokens.forEach((token) => {
                if (!arrayDoubleCheck(token, tokensAddresses)) {
                  tokensAddresses.push(token);
                }
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

* */

let localStore: StoreType = undefined;

rawStore.subscribe((s) => (localStore = s));

export const fetchTokensForVault = async (vaultType: VaultType) => {
  const { instance } = contractWrapper(
    supportedVaults[vaultType].alchemistContractSelector,
    localStore.provider.getSigner(),
  );

  //getSupportedYieldTokens, getSupportedUnderlyingTokens
  return Promise.all([instance.getSupportedYieldTokens, instance.getSupportedUnderlyingTokens])
    .then(([yTokens, uyTokens]) => {
      rawStore.update((store) => {
        const _store = store;

        yTokens.forEach((token) => {
          if (!arrayDoubleCheck(token, _store.tokens.value[vaultType].yieldTokens)) {
            _store.tokens.value[vaultType].yieldTokens.push(token);
          }
        });

        uyTokens.forEach((token) => {
          if (!arrayDoubleCheck(token, _store.tokens.value[vaultType].uyTokens)) {
            _store.tokens.value[vaultType].uyTokens.push(token);
          }
        });

        return _store;
      });
    })
    .catch((e) => {
      console.error(`[fetchTokensForVault]: ${e}`);
    });
};

export const fetchBalances = () => {};
