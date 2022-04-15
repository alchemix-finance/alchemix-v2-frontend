<script lang='ts'>
  import { addressStore, networkStore, tokensStore } from '@stores/v2/alcxStore';
  import { fullTokenList, signer } from '@stores/v2/derived';
  import {
    fetchAdaptersForVaultType,
    fetchAlchemistSentinelRole,
    fetchAllBalances,
    fetchAllVaultsBodies,
    fetchVaultDebt,
    fetchVaultDebtTokenAddress,
    fetchVaultRatio,
    fetchVaultTokens,
  } from 'src/stores/v2/asyncMethods';
  import { VaultTypes } from 'src/stores/v2/types';
  import { chainIds } from '@stores/v2/constants';
  import { vaultsLoading } from '@stores/v2/loadingStores';

  async function initialize(netId) {
    const execute = chainIds.filter((entry) => entry.id === netId)[0];

    let vaultTokens = [];
    execute.vaultTypes.forEach((type) => {
      vaultTokens.push(fetchVaultTokens(type, [$signer], netId));
    });
    await Promise.all([...vaultTokens]).then(() => {
      vaultsLoading.set(true);
    });

    await fetchAllBalances([$signer, $fullTokenList]);

    let vaultDebts = [];
    execute.vaultTypes.forEach((type) => {
      vaultDebts.push(fetchVaultDebt(type, [$addressStore, $signer], netId));
    });
    await Promise.all([...vaultDebts]);

    let vaultRatios = [];
    execute.vaultTypes.forEach((type) => {
      vaultDebts.push(fetchVaultRatio(type, [$signer], netId));
    });
    await Promise.all([...vaultRatios]);

    let tokenAddresses = [];
    execute.vaultTypes.forEach((type) => {
      tokenAddresses.push(fetchVaultDebtTokenAddress(type, [$signer], netId));
    });
    await Promise.all([...tokenAddresses]);

    let vaultBodies = [];
    execute.vaultTypes.forEach((type) => {
      vaultBodies.push(fetchAllVaultsBodies(type, [$signer, $tokensStore, $addressStore], netId));
    });
    await Promise.all([...vaultBodies]).then(() => {
      vaultsLoading.set(false);
    });

    await fetchAlchemistSentinelRole(VaultTypes.alUSD, [$signer, $addressStore], netId);

    let adapters = [];
    execute.vaultTypes.forEach((type) => {
      adapters.push(fetchAdaptersForVaultType(type, [$signer], netId));
    });
    await Promise.all([...adapters]);
  }

  $: if ($addressStore !== undefined && !!$networkStore) {
    console.log(`[StateManager]: Connected with address ${$addressStore}`);

    initialize($networkStore);
  }
</script>

<slot />
