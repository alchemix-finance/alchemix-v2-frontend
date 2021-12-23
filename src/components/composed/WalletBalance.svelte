<script>
import { ethers } from 'ethers';
import externalContracts from '../../stores/externalContracts';
import account from '../../stores/account';
import walletBalance from '../../stores/walletBalance';
import { onMount } from 'svelte';
import { BarLoader } from 'svelte-loading-spinners';
import BalanceEntry from '../elements/BalanceEntry.svelte';
import initBalance from '../../helpers/getWalletBalance';

let loading = true;
const debugging = Boolean(parseInt(process.env.DEBUG_MODE, 10));

// @dev iterates over all supported collaterals and populates state accordingly
const initBalances = async () => {
  ethers
    .getDefaultProvider(debugging ? process.env.LOCAL_NETWORK_URL : 'homestead')
    .getBalance($account.address)
    .then(async (balance) => {
      const ethBal = ethers.utils.formatUnits(balance, 18);
      $walletBalance.tokens = [
        ...$walletBalance.tokens,
        {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: ethBal,
        },
      ];
    })
    .then(async () => {
      await initBalance();
    })
    .finally(() => {
      loading = false;
    });
};

onMount(async () => {
  await initBalances();
});
</script>

<div class="mt-2 py-2 px-4 bg-grey10 rounded">
  {#if loading}
    <div class="flex justify-center">
      <BarLoader color="#F5C59F" />
    </div>
  {:else}
    {#each $walletBalance.tokens as token}
      {#if token.balance !== '0.0'}
        <BalanceEntry tokenSymbol="{token.symbol}" tokenName="{token.name}" tokenBalance="{token.balance}" />
      {/if}
    {/each}
  {/if}
</div>
