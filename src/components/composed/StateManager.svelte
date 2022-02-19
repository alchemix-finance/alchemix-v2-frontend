<script lang="ts">
  import { addressStore, tokensStore } from '@stores/v2/alcxStore';
  import { fullTokenList, signer } from '@stores/v2/derived';
  import {
    fetchAlchemistSentinelRole,
    fetchAllBalances,
    fetchAllVaultsBodies,
    fetchVaultApy,
    fetchVaultDebt,
    fetchVaultDebtTokenAddress,
    fetchVaultRatio,
    fetchVaultTokens,
  } from 'src/stores/v2/asyncMethods';
  import { VaultTypes } from 'src/stores/v2/types';

  import { vaultsLoading } from '@stores/v2/loadingStores';

  async function initialize() {
    await fetchVaultTokens(VaultTypes.alUSD, [$signer]);

    vaultsLoading.set(true);

    await fetchAllBalances([$signer, $fullTokenList]);

    await fetchVaultDebt(VaultTypes.alUSD, [$addressStore, $signer]);

    await fetchVaultRatio(VaultTypes.alUSD, [$signer]);

    await fetchVaultDebtTokenAddress(VaultTypes.alUSD, [$signer]);

    await fetchAllVaultsBodies(VaultTypes.alUSD, [$signer, $tokensStore, $addressStore]);

    vaultsLoading.set(false);
    await fetchAlchemistSentinelRole(VaultTypes.alUSD, [$signer, $addressStore]);
  }

  $: if ($addressStore !== undefined) {
    console.log(`[StateManager]: Connected with address ${$addressStore}`);

    initialize();
  }
</script>

<slot />
