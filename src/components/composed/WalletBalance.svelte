<script>
import { ethers } from 'ethers';
import externalContracts from '../../stores/externalContracts';
import account from '../../stores/account';
import walletBalance from '../../stores/walletBalance';
import { onMount } from 'svelte';
import { BarLoader } from 'svelte-loading-spinners';
import BalanceEntry from '../elements/BalanceEntry.svelte';

let loading = true;

// @dev iterates over all supported collaterals and populates state accordingly
const initBalances = async () => {
  ethers
    .getDefaultProvider()
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
      for (const token of externalContracts.tokens) {
        const contract = new ethers.Contract(
          token.address,
          token.abi,
          $account.signer,
        );
        const balance = ethers.utils.formatUnits(
          await contract.balanceOf($account.address),
          18,
        );
        const symbol = await contract.symbol();
        const name = await contract.name();
        $walletBalance.tokens = [
          ...$walletBalance.tokens,
          { symbol, name, balance },
        ];
      }
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
        <BalanceEntry
          tokenSymbol="{token.symbol}"
          tokenName="{token.name}"
          tokenBalance="{token.balance}"
        />
      {/if}
    {/each}
  {/if}
</div>
