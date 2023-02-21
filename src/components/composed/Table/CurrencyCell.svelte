<script>
  import global from '../../../stores/global';
  import settings from '../../../stores/settings';
  import { tokenPriceStore } from '@stores/v2/alcxStore';
  import { utils } from 'ethers';
  import numeral from 'numeral';

  export let value;
  export let prefix;
  export let token;
  let normalizedValue;

  $: tokenPrice = $tokenPriceStore[token?.address.toLowerCase()]
    ? $tokenPriceStore[token?.address.toLowerCase()]['usd']
    : 1;
  $: tokenFormatted = utils.formatUnits(token?.balance || 0, token?.decimals || 18);

  const normalize = async () => {
    normalizedValue = new Intl.NumberFormat($settings.userLanguage.locale, {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat((tokenFormatted * tokenPrice).toFixed(2)));
  };
  $: value, normalize();
  $: $settings, normalize();
  $: $global, normalize();
</script>

<div class="flex flex-col items-center">
  {#if token}
    <p>
      {#if prefix}{prefix}{/if}{parseFloat(tokenFormatted) === 0
        ? tokenFormatted
        : numeral(parseFloat(tokenFormatted).toFixed(2)).format('0.00a')}
      {token.symbol}
    </p>{/if}
  <p class="{token ? 'text-sm text-lightgrey10' : ''}">
    {#if prefix}{prefix}{/if}{normalizedValue}
  </p>
</div>
