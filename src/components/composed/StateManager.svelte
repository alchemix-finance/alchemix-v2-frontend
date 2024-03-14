<script lang="ts">
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
  } from '@stores/v2/asyncMethods';
  import { VaultTypes } from '@stores/v2/types';
  import { chainIds } from '@stores/v2/constants';
  import { vaultsLoading } from '@stores/v2/loadingStores';
  import { resetStores } from '@stores/v2/methods';
  import { reservesStore } from '@stores/aaveReserves';
  import { getReservesEth, getReservesOpt, getReservesArb } from '@middleware/aave';
  import { vesperVaults } from '@stores/vesperVaults';
  import { getVesperData } from '@middleware/vesper';
  import { queryOpenProposals } from '@middleware/snapshot';

  let lastConnection = {
    chainId: '',
    address: '',
  };
  let initStarted = false;

  async function initialize(netId) {
    if (
      !initStarted &&
      $addressStore !== undefined &&
      netId !== lastConnection.chainId &&
      $signer !== undefined
    ) {
      vaultsLoading.set(true);

      await resetStores();
      initStarted = true;
      const execute = chainIds.filter((entry) => entry.id === netId)[0];

      const aaveReservesEth = await getReservesEth();
      if (aaveReservesEth?.data?.data?.reserves) {
        $reservesStore = [...$reservesStore, aaveReservesEth.data.data.reserves];
      }

      const aaveReservesOpt = await getReservesOpt();
      if (aaveReservesOpt?.data?.data?.reserves) {
        $reservesStore = [...$reservesStore, aaveReservesOpt.data.data.reserves];
      }

      const aaveReservesArb = await getReservesArb();
      if (aaveReservesArb?.data?.data?.reserves) {
        $reservesStore = [...$reservesStore, aaveReservesArb.data.data.reserves];
      }

      if (netId === '0x1') {
        const vesperVaultData = await getVesperData();
        if (vesperVaultData !== undefined) {
          $vesperVaults = [...vesperVaultData];
        }
      } else {
        const vesperVaultData = [];
      }

      let vaultTokens = [];
      execute.vaultTypes.forEach((type) => {
        vaultTokens.push(fetchVaultTokens(type, [$signer], netId));
      });
      await Promise.all([...vaultTokens]);

      await fetchAllBalances([$signer, $fullTokenList], netId);

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

      if (execute.vaultTypes.length > 0) {
        await fetchAlchemistSentinelRole(VaultTypes.alUSD, [$signer, $addressStore], netId);
      }

      let adapters = [];
      execute.vaultTypes.forEach((type) => {
        adapters.push(fetchAdaptersForVaultType(type, [$signer], netId));
      });
      await Promise.all([...adapters]).then(() => {
        lastConnection.chainId = netId;
        lastConnection.address = $addressStore;
        initStarted = false;
      });

      await queryOpenProposals();

      console.log(`[StateManager]: Connected with address ${$addressStore}`);
    }
  }

  async function onAddressStoreChange() {
    await initialize($networkStore);

    await fetchAllBalances([$signer, $fullTokenList], $networkStore);
  }

  $: $networkStore, initialize($networkStore);
  $: $addressStore, onAddressStoreChange();
</script>

<slot />
