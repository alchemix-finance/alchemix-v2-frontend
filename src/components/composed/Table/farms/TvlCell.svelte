<script>
  import settings from '../../../../stores/settings';

  export let tvl;

  $: currency = $settings.baseCurrency.symbol?.toLowerCase();
  $: fiatPrice = new Intl.NumberFormat($settings.userLanguage.locale, {
    style: 'currency',
    currency,
  }).format(
    tvl
      ?.map((_tvl) => {
        const tokenPrice = _tvl.tokenPrice[currency];
        return parseFloat((_tvl.tvl * tokenPrice).toFixed(2));
      })
      .reduce((prev, curr) => prev + curr),
  );
</script>

<div class="flex flex-col items-center">
  <p>
    {fiatPrice}
  </p>
</div>
