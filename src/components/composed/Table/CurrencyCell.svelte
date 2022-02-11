<script>
  import global from '../../../stores/global';
  import settings from '../../../stores/settings';

  export let value;
  export let prefix;
  export let key;
  let normalizedValue;

  const normalize = () => {
    console.log('settings', $settings);
    normalizedValue = new Intl.NumberFormat($settings.userLanguage.locale, {
      style: 'currency',
      currency: $settings.baseCurrency.symbol,
    }).format(parseFloat(((value || 0) * $global.conversionRate).toFixed(2)));
  };

  $: value, normalize();
  $: $settings, normalize();
</script>

{#if prefix}{prefix}{/if}{normalizedValue}
