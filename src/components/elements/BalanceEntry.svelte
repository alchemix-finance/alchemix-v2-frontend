<script>
export let tokenSymbol;
export let tokenName;
export let tokenBalance;
let tokenIcon = '/images/token-icons/unknown.svg';

// @dev truncates long balances to keep them readable
const truncateBalance = (balance) => {
  const balanceSplit = balance.split('.');
  // return balance.slice(0, -14) + '...';
  const ellipse = balanceSplit[1].length > 4 ? '...' : '';
  const decimals = balanceSplit[1] === '0' ? '' : '.' + balanceSplit[1].slice(0, 4);
  return balanceSplit[0] + decimals + ellipse;
};

/*
 * @dev constructs the path for the img src
 * @param filename the filename to use
 * @returns the relative path
 * */
const getSource = async (filename) => {
  const xhr = new XMLHttpRequest();
  xhr.open('HEAD', `/images/token-icons/${filename}.png`);
  xhr.responseType = 'blob';
  xhr.send();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 404) {
      if (xhr.response && xhr.response.type === 'image/png')
        tokenIcon = `/images/token-icons/${filename + '.png'}`;
    }
  };
};

$: tokenSymbol, getSource(tokenSymbol);
</script>

<div class="flex mt-2 mb-2 flex-row opacity-50 hover:opacity-100">
  <img class="w-6 h-6 mr-2" alt="The logo of {tokenSymbol}" src="{tokenIcon}" />
  <div class="flex flex-col w-full">
    <div class="relative flex items-center justify-between text-sm">
      <p>{tokenSymbol}</p>
      <p>{truncateBalance(tokenBalance)}</p>
    </div>
    <p class="text-xs opacity-60">{tokenName}</p>
  </div>
</div>
