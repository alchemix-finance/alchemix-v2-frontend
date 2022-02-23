<script>
  // libraries
  import { onMount } from 'svelte';
  import { Router, Route } from 'svelte-routing';
  import { _ } from 'svelte-i18n';
  import Modal from '@components/elements/Modal.svelte';
  import StateManager from '@components/composed/StateManager.svelte';
  import network from '@stores/network';

  // middleware
  import { getFiatRates, getGasPrices, getTokenPrices } from '@middleware/zapper';

  // composed components
  import HeaderBar from '@components/composed/HeaderBar.svelte';
  import SideBar from '@components/composed/SideBar.svelte';
  import Footer from '@components/composed/Footer.svelte';
  import Emergency from '@components/elements/Emergency';

  // router configuration and views
  import Landing from './views/Landing.svelte';
  import Error from './views/Error.svelte';
  import Accounts from './views/Accounts.svelte';
  import Vaults from './views/Vaults.svelte';
  import Transmuter from './views/Transmuter.svelte';
  import Farms from './views/Farms.svelte';
  import Governance from './views/Governance.svelte';
  import Settings from './views/Settings.svelte';
  import Sentinel from './views/Sentinel.svelte';

  import { connect } from '@helpers/walletManager';

  export let url = '';

  // @dev to stop waste API request, stop the gas updates if needed
  let gasTimer;

  const preselect = window.localStorage.getItem('userWallet');
  let walletChecked = false;

  function gasPriceUpdater() {
    gasTimer = window.setTimeout(async () => {
      await getGasPrices();
      if (gasTimer !== 'stopped') gasPriceUpdater();
    }, 10000);
  }

  function gasIdle() {
    clearTimeout(gasTimer);
    gasTimer = 'stopped';
  }

  onMount(async () => {
    if (preselect !== null) {
      await connect(preselect);
    }
    walletChecked = true;
    await getGasPrices();
    await getFiatRates();
    await getTokenPrices();
  });
</script>

<svelte:window on:blur="{gasIdle}" on:focus="{gasPriceUpdater}" />

<StateManager>
  <Modal>
    <Router url="{url}">
      <div class="wrapper max-w-none grid grid-cols-12 font-alcxFlow">
        <div class="col-span-12 bg-grey30 pl-8 pt-5 pb-5 border-grey5 border-b">
          <HeaderBar />
        </div>
        {#if $network.id === 1}
          <Emergency />
        {/if}
        <div class="col-span-12 flex">
          <div class="pl-8 pr-9 pt-8 w-96 sm:hidden xl:block">
            <SideBar />
          </div>
          <div class="border-l border-grey5 w-full sm:hidden xl:block">
            {#if walletChecked}
              <Route path="/accounts" component="{Accounts}" />
              <Route path="/vaults" component="{Vaults}" />
              <Route path="/transmuter" component="{Transmuter}" />
              <Route path="/farms" component="{Farms}" />
              <Route path="/governance" component="{Governance}" />
              <Route path="/settings" component="{Settings}" />
              <Route path="/" component="{Landing}" />
              <Route path="/*" component="{Error}" />
              <Route path="/sentinel" component="{Sentinel}" />
            {/if}
          </div>
        </div>
        <div class="sm:block xl:hidden col-span-12">
          <p class="text-center text-lg my-12">{$_('small_screen.title')}</p>
          <p class="text-center mb-12">
            {$_('small_screen.message')}
          </p>
        </div>
        <div class="col-span-12 pl-8 py-12 border-t border-grey5">
          <Footer />
        </div>
      </div>
    </Router>
  </Modal>
</StateManager>
