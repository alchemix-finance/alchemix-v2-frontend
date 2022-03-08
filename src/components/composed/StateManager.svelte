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

  function leet() {
    console.log(
      `%c
 ▄▄▄       ██▓     ▄████▄   ██░ ██ ▓█████  ███▄ ▄███▓ ██▓▒██   ██▒
▒████▄    ▓██▒    ▒██▀ ▀█  ▓██░ ██▒▓█   ▀ ▓██▒▀█▀ ██▒▓██▒▒▒ █ █ ▒░
▒██  ▀█▄  ▒██░    ▒▓█    ▄ ▒██▀▀██░▒███   ▓██    ▓██░▒██▒░░  █   ░
░██▄▄▄▄██ ▒██░    ▒▓▓▄ ▄██▒░▓█ ░██ ▒▓█  ▄ ▒██    ▒██ ░██░ ░ █ █ ▒
 ▓█   ▓██▒░██████▒▒ ▓███▀ ░░▓█▒░██▓░▒████▒▒██▒   ░██▒░██░▒██▒ ▒██▒
 ▒▒   ▓▒█░░ ▒░▓  ░░ ░▒ ▒  ░ ▒ ░░▒░▒░░ ▒░ ░░ ▒░   ░  ░░▓  ▒▒ ░ ░▓ ░
  ▒   ▒▒ ░░ ░ ▒  ░  ░  ▒    ▒ ░▒░ ░ ░ ░  ░░  ░      ░ ▒ ░░░   ░▒ ░
  ░   ▒     ░ ░   ░         ░  ░░ ░   ░   ░      ░    ▒ ░ ░    ░
      ░  ░    ░  ░░ ░       ░  ░  ░   ░  ░       ░    ░   ░    ░
                  ░

=============================[ v2 ]=================================

GitHub:   https://github.com/alchemix-finance
Twitter:  https://twitter.com/alchemixfi
Telegram: lmao no

Make sure you're running this on ${
        process.env.APP_URL ||
        'if you can read this, the site you are visiting right now is probably trying to scam you'
      }
We will never ask you for your private key or seedphrase.

========================[ DISCLAIMER ]==============================

All rights reserved, no guarantees given.
DeFi tools are not toys.
Use at your own risk.

=========================[ CREDITS ]================================

[ ICONS ]
* CC-BY, FontAwesome (https://fontawesome.com/)
  "globe", "speech bubbles"
* CC0 1.0, Simple Icons et al. (https://simpleicons.org/)
  "gitbook", "amp", "discord", "twitter", "github", "substack"

  `,
      'color: #F5C09A',
    );
  }

  async function initialize() {
    leet();
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
