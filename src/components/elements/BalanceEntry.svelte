<script>
export let tokenSymbol;
export let tokenName;
export let tokenBalance;

// @dev truncates long balances to keep them readable
const truncateBalance = (balance) => {
  return balance.slice(0, -14) + '...';
};
</script>

<div class="flex mt-2 mb-2 flex-row">
  <img class="w-6 h-6 mr-2" alt="The logo of {tokenSymbol}" src="images/token-icons/{tokenSymbol}.png" />
  <div class="flex flex-col w-full">
    <div class="relative flex items-center justify-between text-sm">
      <p>{tokenSymbol}</p>
      <p>{truncateBalance(tokenBalance)}</p>
    </div>
    <p class="text-xs opacity-60">{tokenName}</p>
  </div>
</div>
