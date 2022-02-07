<script>
  import { _ } from 'svelte-i18n';
  import Button from '../components/elements/Button.svelte';
  import BorderContainer from '../components/elements/BorderContainer.svelte';
  import AssetCard from '../components/elements/AssetCard.svelte';
  import ViewContainer from '../components/elements/ViewContainer.svelte';
  import settings from '../stores/settings';
  import global from '../stores/global';
  import { routerGuard } from '../helpers/routerGuard.js';

  // TODO aggregate data from zapper
  const alAssets = [
    {
      name: 'Alchemix USD',
      ticker: 'alUSD',
      price: 0.0,
      icon: 'alusd_med.svg',
      color: 'bronze2',
    },
    {
      name: 'Alchemix ETH',
      ticker: 'alETH',
      price: 0.0,
      icon: 'aleth_med.svg',
      color: 'blue3',
    },
    {
      name: 'Alchemix Governance',
      ticker: 'ALCX',
      price: 0.0,
      icon: 'alcx_med.svg',
      color: 'bronze2',
    },
  ];
</script>

<ViewContainer>
  <div class="flex justify-center">
    <img
      src="images/alchemix_intro_logo.png"
      alt="The logo depicting the Alchemix project"
      class="w-40 h-40"
    />
  </div>
  <h1 class="text-center text-5xl font-extrabold mt-7">
    {$_('landing.intro_title')}
  </h1>
  <div class="flex justify-center">
    <p class="text-center mt-7 text-2xl max-w-xl">
      {$_('landing.intro_subtitle')}
    </p>
  </div>
  <div class="flex justify-center mt-14">
    <BorderContainer width="w-80">
      <Button
        label="{$_('landing.button_label')}"
        fontSize="text-md"
        borderSize="1"
        on:clicked="{() => routerGuard('accounts')}"
      >
        <img src="images/token-icons/ALCX.png" slot="leftSlot" class="w-6 h-6" alt="The Alchemix Logo" />
        <svg
          slot="rightSlot"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"
          ></path>
        </svg>
      </Button>
    </BorderContainer>
  </div>
  <div class="mt-14 flex justify-center space-x-14">
    {#each alAssets as asset}
      <div class="col-span-1 justify-self-center w-64">
        <AssetCard
          assetName="{asset.name}"
          assetTicker="{asset.ticker}"
          assetPrice="{$global.tokenPrices.find((token) => token.symbol === asset.ticker)?.price *
            $global.conversionRate}"
          currency="{$settings.baseCurrency?.ticker}"
          assetIcon="{asset.icon}"
          assetColor="{asset.color}"
        />
      </div>
    {/each}
  </div>
</ViewContainer>
