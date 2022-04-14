<script>
  import { BarLoader } from 'svelte-loading-spinners';
  import BalanceEntry from '../elements/BalanceEntry.svelte';
  import settings from '@stores/settings';

  import { balancesStore } from '@stores/v2/alcxStore';
  import { BigNumber, ethers } from 'ethers';
</script>

{#if $balancesStore.length <= 0}
  <div class='flex justify-center'>
    <BarLoader color="{$settings.invertColors ? '#6C93C7' : '#F5C59F'}" />
  </div>
{:else}
  {#each $balancesStore as tokenEntry}
    {#if tokenEntry.balance.gt(BigNumber.from(0))}
      <BalanceEntry
        tokenSymbol='{tokenEntry.symbol}'
        tokenName='{tokenEntry.name}'
        tokenAddress='{tokenEntry.address}'
        tokenDecimals='{tokenEntry.decimals}'
        tokenBalance='{ethers.utils.formatUnits(tokenEntry.balance, tokenEntry.decimals)}'
      />
    {/if}
  {/each}
{/if}
