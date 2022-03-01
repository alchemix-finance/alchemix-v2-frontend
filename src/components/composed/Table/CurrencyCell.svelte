<script>
  import global from '../../../stores/global';
  import settings from '../../../stores/settings';
  import { utils, BigNumber } from 'ethers';

  export let value;
  export let prefix;
  export let key;
  export let token;
  let normalizedValue;

  const normalize = () => {
    normalizedValue = new Intl.NumberFormat($settings.userLanguage.locale, {
      style: 'currency',
      currency: $settings.baseCurrency.symbol,
    }).format(parseFloat(((value || 0) * $global.conversionRate).toFixed(2)));
  };

  $: value, normalize();
  $: $settings, normalize();
  $: tokenFormatted = utils.formatUnits(
    token?.balance.mul(token?.perShare).div(BigNumber.from(10).pow(token?.decimals)) || 0,
    token?.decimals || 18,
  );
</script>

<div class="flex flex-col items-center">
  {#if token}<p>{tokenFormatted} {token.symbol}</p>{/if}
  <p class="{token ? 'text-sm text-lightgrey10' : ''}">
    {#if prefix}{prefix}{/if}{normalizedValue}
  </p>
</div>
