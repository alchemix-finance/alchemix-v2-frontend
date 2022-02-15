<script>
  import account from '@stores/account';
  import walletBalance from '../../stores/walletBalance';
  import { BarLoader } from 'svelte-loading-spinners';
  import BalanceEntry from '../elements/BalanceEntry.svelte';

  import { balancesStore } from '@stores/v2/alcxStore';
  import { BigNumber, ethers } from 'ethers';
</script>

{#if $balancesStore.length <= 0}
  <div class="flex justify-center">
    <BarLoader color="#F5C59F" />
  </div>
{:else}
  {#each $balancesStore as tokenEntry}
    {#if tokenEntry.balance.gt(BigNumber.from(0))}
      <BalanceEntry
        tokenSymbol="{tokenEntry.symbol}"
        tokenName="{tokenEntry.name}"
        tokenBalance="{ethers.utils.formatUnits(tokenEntry.balance, tokenEntry.decimals)}"
      />
    {/if}
  {/each}
{/if}
