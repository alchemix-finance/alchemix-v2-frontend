<script lang="ts">
  import { addressStore, balancesStore, tokensStore, vaultsStore } from '@stores/v2/alcxStore';
  import { fullTokenList, signer } from '@stores/v2/derived';
  import {
    fetchAllBalances,
    fetchAllVaultsBodies,
    fetchBalanceByAddress,
    fetchVaultDebt,
    fetchVaultRatio,
    fetchVaultTokens,
  } from 'src/stores/v2/asyncMethods';
  import { VaultTypes } from 'src/stores/v2/types';

  $: console.log($balancesStore);

  async function initialize() {
    await fetchVaultTokens(VaultTypes.alUSD, [$signer]);

    console.log($tokensStore);

    await fetchAllBalances([$signer, $fullTokenList]);

    await fetchVaultDebt(VaultTypes.alUSD, [$addressStore, $signer]);

    await fetchVaultRatio(VaultTypes.alUSD, [$signer]);

    console.log($vaultsStore[VaultTypes.alUSD]);

    await fetchAllVaultsBodies(VaultTypes.alUSD, [
      $signer,
      $tokensStore,
      $addressStore,
      $balancesStore,
      $vaultsStore,
    ]);

    console.log($vaultsStore);
  }

  $: if ($addressStore !== undefined) {
    console.log(`[StateManager]: Connected with address ${$addressStore}`);

    initialize();
  }
</script>

<slot />
