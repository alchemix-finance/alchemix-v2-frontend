<script>
import Button from '../components/elements/Button.svelte';
import BorderContainer from '../components/elements/BorderContainer.svelte';
import AssetCard from '../components/elements/AssetCard.svelte';
import Table from '../components/composed/Table.svelte';
import settings from '../stores/settings';
import global from '../stores/global';
import { routerGuard } from '../helpers/routerGuard.js';

// TODO aggregate data from contracts
const alAssets = [
  {
    name: 'Alchemix USD',
    ticker: 'alUSD',
    price: 0.99,
    icon: 'alusd.png',
    color: 'bronze2',
  },
  {
    name: 'Alchemix ETH',
    ticker: 'alETH',
    price: 2171.88,
    icon: 'aleth.png',
    color: 'blue3',
  },
  {
    name: 'Alchemix BTC',
    ticker: 'alBTC',
    price: 34096.11,
    icon: 'albtc.png',
    color: 'orange1',
  },
];
</script>

<div class="flex justify-center">
  <img
    src="images/alchemix_intro_logo.png"
    alt="The logo depicting the Alchemix project"
    class="w-40 h-40"
  />
</div>
<h1 class="text-center text-5xl font-extrabold mt-7">
  Take Out A Self-Repaying Loan
</h1>
<div class="flex justify-center">
  <p class="text-center mt-7 text-2xl max-w-xl">
    Increase capital efficiency by borrowing the future yield of your deposit
    today.
  </p>
</div>
<div class="flex justify-center mt-14">
  <BorderContainer width="w-80">
    <Button
      label="Enter Alchemix"
      fontSize="text-md"
      borderSize="1"
      on:clicked="{() => routerGuard('accounts')}"
    >
      <img
        src="images/token-icons/ALCX.png"
        slot="leftSlot"
        class="w-6 h-6"
        alt="The Alchemix Logo"
      />
      <svg
        slot="rightSlot"
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
      </svg>
    </Button>
  </BorderContainer>
</div>
<div class="grid grid-cols-3 gap-14 mt-14">
  {#each alAssets as asset}
    <div class="col-span-1 justify-self-center">
      <AssetCard
        assetName="{asset.name}"
        assetTicker="{asset.ticker}"
        assetPrice="{asset.price * $global.conversionRate}"
        currency="{$settings.baseCurrency?.ticker}"
        assetIcon="{asset.icon}"
        assetColor="{asset.color}"
      />
    </div>
  {/each}
</div>
<Table />
