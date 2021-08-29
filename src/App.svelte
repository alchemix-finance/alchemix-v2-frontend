<script>
// libraries
import { onMount } from 'svelte';
import { Router, Route } from 'svelte-routing';

// middleware
import { getFiatRates, getGasPrices } from './middleware/zapper';

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

<Router url="{url}">
  <Route path="/components" component="{Components}" />
  <Route path="/accounts" component="{Accounts}" />
  <Route path="/vaults" component="{Vaults}" />
  <Route path="/transmuter" component="{Transmuter}" />
  <Route path="/farms" component="{Farms}" />
  <Route path="/governance" component="{Governance}" />
  <Route path="/settings" component="{Settings}" />
  <Route path="/" component="{Landing}" />
  <Route path="/*" component="{Error}" />
</Router>
