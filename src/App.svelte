<script>
  // libraries
  import { onMount } from 'svelte';
  import { Router, Route } from 'svelte-routing';
  import { _ } from 'svelte-i18n';
  import Modal from '@components/elements/Modal.svelte';
  import StateManager from '@components/composed/StateManager.svelte';
  import settings from '@stores/settings';

  // middleware
  import { getGasPrices } from '@middleware/zapper';

  // composed components
  import HeaderBar from '@components/composed/HeaderBar.svelte';
  import SideBar from '@components/composed/SideBar.svelte';
  import Footer from '@components/composed/Footer.svelte';
  import Emergency from '@components/elements/Emergency.svelte';

  // router configuration and views
  import Landing from '@views/Landing.svelte';
  import Error from '@views/Error.svelte';
  // import Accounts from '@views/Accounts.svelte';
  import Vaults from '@views/Vaults.svelte';
  import Transmuter from '@views/Transmuter.svelte';
  import Farms from '@views/Farms.svelte';
  import Governance from '@views/Governance.svelte';
  import Settings from '@views/Settings.svelte';
  import Sentinel from '@views/Sentinel.svelte';
  import SecretCowLevel from '@views/SecretCowLevel.svelte';
  import Swap from '@views/Swap.svelte';
  // import { routerGuard } from '@helpers/routerGuard';
  import { networkStore } from '@stores/v2/alcxStore';
  import { chainIds } from '@stores/v2/constants';

  import { connect } from '@helpers/walletManager';
  import MenuNavbar from './components/composed/MenuNavbar.svelte';

  export let url = '';
  const deploymentUrl = window.location.host.split('.');
  let showBanner = false;
  if (deploymentUrl.filter((word) => word === 'staging').length !== 0) showBanner = true;

  // @dev to stop waste API request, stop the gas updates if needed
  let gasTimer;

  const preselect = JSON.parse(window.localStorage.getItem('connectedWallets')) || [];
  let walletChecked = false;

  function gasPriceUpdater() {
    gasTimer = window.setTimeout(async () => {
      try {
        await getGasPrices(
          null,
          chainIds.filter((entry) => entry.id === $networkStore)[0]?.abiPath || 'ethereum',
        );
        if (gasTimer !== 'stopped') gasPriceUpdater();
      } catch (e) {
        console.log('Error fetching gas prices from zapper', e);
      }
    }, 10000);
  }

  function gasIdle() {
    clearTimeout(gasTimer);
    gasTimer = 'stopped';
  }

  onMount(async () => {
    await Promise.all([getGasPrices()]);
    if (preselect.length > 0) {
      await connect(preselect);
      // if (location.pathname === '/') routerGuard('accounts');
    }
    walletChecked = true;
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
        import.meta.env.VITE_APP_URL ||
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
  });
</script>

<style>
  .regularBg {
    background: linear-gradient(171.08deg, #010101 -11.16%, #141921 6.1%, #0a0d11 49.05%, #000000 93.22%)
      no-repeat fixed;
    color: #f5f5f5;
  }

  .inverseBg {
    background: linear-gradient(171.08deg, #fefefe -11.16%, #ebe6de 6.1%, #f5f2ee 49.05%, #fff 93.22%)
      no-repeat fixed;
    color: #0a0a0a;
  }
</style>

<svelte:window on:blur="{gasIdle}" on:focus="{gasPriceUpdater}" />
<div class="{$settings.invertColors ? 'inverseBg' : 'regularBg'} min-h-screen">
  <div class=" fixed inset-0 overflow-auto pb-10 lg:pb-0">
    <StateManager>
      <Modal>
        <Router url="{url}">
          <div class="grid grid-cols-12 font-alcxFlow">
            <div
              class="col-span-12 md:pl-8 md:pt-5 md:pb-5 {$settings.invertColors
                ? 'bg-grey30inverse border-grey5inverse'
                : 'bg-grey30 border-grey5'} border-b"
            >
              <HeaderBar />
            </div>
            {#if showBanner}
              <Emergency />
            {/if}

            <MenuNavbar />

            <div class="col-span-12 flex">
              <div class="pl-8 pr-9 pt-8 w-96 hidden lg:block">
                <SideBar />
              </div>
              <div class="border-l {$settings.invertColors ? 'border-grey5inverse' : 'border-grey5'} w-full">
                {#if walletChecked}
                  <!--                <Route path='/accounts' component='{Accounts}' />-->
                  <Route path="/vaults" component="{Vaults}" />
                  <Route path="/transmuter" component="{Transmuter}" />
                  <Route path="/swap" component="{Swap}" />

                  <Route path="/farms" component="{Farms}" />
                  <Route path="/governance" component="{Governance}" />
                  <Route path="/settings" component="{Settings}" />
                  <Route path="/" component="{Landing}" />
                  <Route path="/*" component="{Error}" />
                  <Route path="/sentinel" component="{Sentinel}" />
                  <Route path="/get-out" component="{SecretCowLevel}" />
                {/if}
              </div>
            </div>
            <!--          <div class="block lg:hidden col-span-12">-->
            <!--            <p class="text-center text-lg my-12">{$_('small_screen.title')}</p>-->
            <!--            <p class="text-center mb-12">-->
            <!--              {$_('small_screen.message')}-->
            <!--            </p>-->
            <!--          </div>-->
            <div
              class="col-span-12 pl-8 py-12 border-t {$settings.invertColors
                ? 'border-grey5inverse'
                : 'border-grey5'}"
            >
              <Footer />
            </div>
          </div>
        </Router>
      </Modal>
    </StateManager>
  </div>
</div>
