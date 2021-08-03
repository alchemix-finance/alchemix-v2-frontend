<script>
import Button from '../components/elements/Button.svelte';
import BorderContainer from '../components/elements/BorderContainer.svelte';
import AssetCard from '../components/elements/AssetCard.svelte';
import { connect } from '../helpers/walletManager';
import account from '../stores/account';
import { navigate } from 'svelte-routing';

const alAssets = [
  {
    name: 'Alchemix USD',
    ticker: 'alUSD',
    price: '0.99',
    currency: '$',
  },
  {
    name: 'Alchemix ETH',
    ticker: 'alETH',
    price: '2,171.88',
    currency: '$',
  },
  {
    name: 'Alchemix BTC',
    ticker: 'alBTC',
    price: '34,096.11',
    currency: '$',
  },
];

const startApplication = async () => {
  if (!$account.signer) {
    await connect().then(() => {
      navigate('/components', { replace: true });
    });
  } else {
    navigate('/components', { replace: true });
  }
};
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
  <BorderContainer width="w-60">
    <Button
      label="Enter Alchemix"
      fontSize="text-md"
      borderSize="1"
      on:clicked="{startApplication}"
    />
  </BorderContainer>
</div>
<div class="grid grid-cols-3 gap-14 mt-14">
  {#each alAssets as asset}
    <div class="col-span-1 justify-self-center">
      <AssetCard
        assetName="{asset.name}"
        assetTicker="{asset.ticker}"
        assetPrice="{asset.price}"
        currency="{asset.currency}"
      />
    </div>
  {/each}
</div>
