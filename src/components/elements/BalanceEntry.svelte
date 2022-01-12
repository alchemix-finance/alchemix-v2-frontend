<script>
export let tokenSymbol;
export let tokenName;
export let tokenBalance;

// @dev truncates long balances to keep them readable
const truncateBalance = (balance) => {
  const balanceSplit = balance.split('.');
  // return balance.slice(0, -14) + '...';
  const ellipse = balanceSplit[1].length > 4 ? '...' : '';
  const decimals = balanceSplit[1] === '0' ? '' : '.' + balanceSplit[1].slice(0, 4);
  return balanceSplit[0] + decimals + ellipse;
};

$: tokenBalance, console.log('balance changed', tokenSymbol, tokenBalance);
</script>

<div class="flex mt-2 mb-2 flex-row opacity-50 hover:opacity-100">
  <img class="w-6 h-6 mr-2" alt="The logo of {tokenSymbol}" src="images/token-icons/{tokenSymbol}.png" />
  <div class="flex flex-col w-full">
    <div class="relative flex items-center justify-between text-sm">
      <p>{tokenSymbol}</p>
      <p>{truncateBalance(tokenBalance)}</p>
    </div>
    <p class="text-xs opacity-60">{tokenName}</p>
  </div>
</div>
