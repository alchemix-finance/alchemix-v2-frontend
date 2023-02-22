<script>
  export let tokenSymbol;
  export let tokenName;
  export let tokenBalance;
  export let tokenAddress;
  export let tokenDecimals;
  let tokenIcon = './images/token-icons/unknown.svg';

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
    xhr.open('HEAD', `./images/token-icons/${filename}.svg`);
    xhr.responseType = 'blob';
    xhr.send();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 404) {
        if (xhr.response && xhr.response.type === 'image/svg+xml')
          tokenIcon = `./images/token-icons/${filename + '.svg'}`;
      }
    };
  };

  $: tokenSymbol, getSource(tokenSymbol);

  const addToken = async () => {
    try {
      // need to suppress error since we're dealing with injected elements
      // eslint-disable-next-line no-undef
      await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: `https://alchemix.fi${tokenIcon}`,
          },
        },
      });
    } catch (error) {
      console.warn('User aborted wallet action to add a token');
    }
  };
</script>

<div
  class="flex mt-2 mb-2 flex-row opacity-50 hover:opacity-100 hover:cursor-pointer"
  on:click="{() => addToken()}"
>
  <img class="w-6 h-6 mr-2" alt="The logo of {tokenSymbol}" src="{tokenIcon}" />
  <div class="flex flex-col w-full">
    <div class="relative flex items-center justify-between text-sm">
      <p>{tokenSymbol}</p>
      <p>{truncateBalance(tokenBalance)}</p>
    </div>
    <p class="text-xs opacity-60">{tokenName}</p>
  </div>
</div>
