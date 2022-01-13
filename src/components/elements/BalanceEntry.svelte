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

/*
 * @dev silly hack to check if a file exists because no server
 * @param filename the filename to check
 * @return file exists or not
 * */
const checkFileIcon = (filename) => {
  const xhr = new XMLHttpRequest();
  xhr.open('HEAD', `/images/token-icons/${filename}.png`, false);
  xhr.send();
  return xhr.status.toString() !== '404';
};

/*
 * @dev constructs the path for the img src
 * @param filename the filename to use
 * @returns the relative path
 * */
const getSource = (filename) => {
  const exists = checkFileIcon(filename);
  return `images/token-icons/${exists ? filename + '.png' : 'unknown.svg'}`;
};
</script>

<div class="flex mt-2 mb-2 flex-row opacity-50 hover:opacity-100">
  <img class="w-6 h-6 mr-2" alt="The logo of {tokenSymbol}" src="{getSource(tokenSymbol)}" />
  <div class="flex flex-col w-full">
    <div class="relative flex items-center justify-between text-sm">
      <p>{tokenSymbol}</p>
      <p>{truncateBalance(tokenBalance)}</p>
    </div>
    <p class="text-xs opacity-60">{tokenName}</p>
  </div>
</div>
