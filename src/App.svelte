<script>
// libraries
import { onMount } from 'svelte';
import { Router, Route } from 'svelte-routing';
import Modal from 'svelte-simple-modal';

// middleware
import { getFiatRates, getGasPrices } from './middleware/zapper';

// composed components
import HeaderBar from './components/composed/HeaderBar.svelte';
import SideBar from './components/composed/SideBar.svelte';
import Footer from './components/composed/Footer.svelte';

// router configuration and views
import Landing from './views/Landing.svelte';
import Error from './views/Error.svelte';
import Components from './views/Components.svelte';
import Accounts from './views/Accounts.svelte';
import Vaults from './views/Vaults.svelte';
import Transmuter from './views/Transmuter.svelte';
import Farms from './views/Farms.svelte';
import Governance from './views/Governance.svelte';
import Settings from './views/Settings.svelte';

export let url = '';

// @dev to stop waste API request, stop the gas updates if needed
let gasTimer;

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
  await getFiatRates();
  await getGasPrices();
});
</script>

<svelte:window on:blur="{gasIdle}" on:focus="{gasPriceUpdater}" />

<Modal>
  <Router url="{url}">
    <div class="wrapper max-w-none grid grid-cols-12 font-alcxFlow">
      <div class="col-span-12 bg-grey30 pl-8 pt-5 pb-5 border-grey5 border-b">
        <HeaderBar />
      </div>
      <div class="col-span-12 flex">
        <div class="pl-8 pr-9 pt-8 w-96">
          <SideBar />
        </div>
        <div class="border-l border-grey5 w-full">
          <Route path="/components" component="{Components}" />
          <Route path="/accounts" component="{Accounts}" />
          <Route path="/vaults" component="{Vaults}" />
          <Route path="/transmuter" component="{Transmuter}" />
          <Route path="/farms" component="{Farms}" />
          <Route path="/governance" component="{Governance}" />
          <Route path="/settings" component="{Settings}" />
          <Route path="/" component="{Landing}" />
          <Route path="/*" component="{Error}" />
        </div>
      </div>
      <div class="col-span-12 pl-8 py-12 border-t border-grey5">
        <Footer />
      </div>
    </div>
  </Router>
</Modal>
