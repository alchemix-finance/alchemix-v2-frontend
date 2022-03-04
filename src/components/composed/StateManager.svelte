<script lang="ts">
  import { addressStore, tokensStore } from '@stores/v2/alcxStore';
  import { fullTokenList, signer } from '@stores/v2/derived';
  import {
    fetchAlchemistSentinelRole,
    fetchAllBalances,
    fetchAllVaultsBodies,
    fetchVaultDebt,
    fetchVaultDebtTokenAddress,
    fetchVaultRatio,
    fetchVaultTokens,
    fetchAdaptersForVaultType,
  } from 'src/stores/v2/asyncMethods';
  import { VaultTypes } from 'src/stores/v2/types';

  import { vaultsLoading } from '@stores/v2/loadingStores';

  async function initialize() {
    await fetchVaultTokens(VaultTypes.alUSD, [$signer]);
    await fetchVaultTokens(VaultTypes.alETH, [$signer]);

    vaultsLoading.set(true);

    await fetchAllBalances([$signer, $fullTokenList]);

    await fetchVaultDebt(VaultTypes.alUSD, [$addressStore, $signer]);
    await fetchVaultDebt(VaultTypes.alETH, [$addressStore, $signer]);

    await fetchVaultRatio(VaultTypes.alUSD, [$signer]);
    await fetchVaultRatio(VaultTypes.alETH, [$signer]);

    await fetchVaultDebtTokenAddress(VaultTypes.alUSD, [$signer]);
    await fetchVaultDebtTokenAddress(VaultTypes.alETH, [$signer]);

    await fetchAllVaultsBodies(VaultTypes.alUSD, [$signer, $tokensStore, $addressStore]);
    await fetchAllVaultsBodies(VaultTypes.alETH, [$signer, $tokensStore, $addressStore]);

    vaultsLoading.set(false);
    await fetchAlchemistSentinelRole(VaultTypes.alUSD, [$signer, $addressStore]);
    await fetchAdaptersForVaultType(VaultTypes.alUSD, [$signer]);
  }

  $: if ($addressStore !== undefined) {
    console.log(`[StateManager]: Connected with address ${$addressStore}`);

    initialize();
  }
</script>

<slot />
