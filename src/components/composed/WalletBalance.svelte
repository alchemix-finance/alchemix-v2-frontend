<script>
import account from '../../stores/account';
import walletBalance from '../../stores/walletBalance';
import { BarLoader } from 'svelte-loading-spinners';
import BalanceEntry from '../elements/BalanceEntry.svelte';
</script>

<div class="mt-2 py-2 px-4 bg-grey10 rounded">
  {#if $account.loadingWalletBalance}
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
