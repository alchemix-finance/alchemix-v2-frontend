<script>
import account from '../../stores/account';
import walletBalance from '../../stores/walletBalance';
import { BarLoader } from 'svelte-loading-spinners';
import BalanceEntry from '../elements/BalanceEntry.svelte';

let updateKey;

const randomKey = () => {
  updateKey = Math.floor(Math.random() * 1000000);
  console.log('randomKey generated', updateKey);
};

$: $walletBalance.tokens, randomKey();
</script>

{#if $account.loadingWalletBalance}
  <div class="flex justify-center">
    <BarLoader color="#F5C59F" />
  </div>
{:else}
  {#each $walletBalance.tokens as token (updateKey)}
    {#if token.balance !== '0.0'}
      <BalanceEntry tokenSymbol="{token.symbol}" tokenName="{token.name}" tokenBalance="{token.balance}" />
    {/if}
  {/each}
{/if}
