<script lang="ts">
  import { addressStore, balancesStore, tokensStore, vaultsStore } from '@stores/v2/alcxStore';
  import { fullTokenList, signer } from '@stores/v2/derived';
  import { BigNumber } from 'ethers';
  import {
    fetchAllBalances,
    fetchAllVaultsBodies,
    fetchBalanceByAddress,
    fetchVaultDebtToken,
    fetchVaultDebt,
    fetchVaultRatio,
    fetchVaultTokens,
  } from 'src/stores/v2/asyncMethods';
  import { updateAllVaultBody } from 'src/stores/v2/methods';
  import { VaultTypes } from 'src/stores/v2/types';

  import { vaultsLoading } from '@stores/v2/loadingStores';

  async function initialize() {
    await fetchVaultTokens(VaultTypes.alUSD, [$signer]);

    vaultsLoading.set(true);

    await fetchAllBalances([$signer, $fullTokenList]);

    await fetchVaultDebt(VaultTypes.alUSD, [$addressStore, $signer]);

    await fetchVaultRatio(VaultTypes.alUSD, [$signer]);

    await fetchVaultDebtToken(VaultTypes.alUSD, [$signer]);

    await fetchAllVaultsBodies(VaultTypes.alUSD, [$signer, $tokensStore, $addressStore]);

    vaultsLoading.set(false);
  }

  $: if ($addressStore !== undefined) {
    console.log(`[StateManager]: Connected with address ${$addressStore}`);

    initialize();
  }
</script>

<slot />
