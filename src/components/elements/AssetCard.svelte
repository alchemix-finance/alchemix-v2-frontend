<script>
  export let assetName = 'Alchemix Asset';
  export let assetTicker = 'alASS';
  export let currency;
  export let assetIcon;
  export let zapper;
  export let assetPrice;

  let formattedNumber;

  $: assetPrice, (formattedNumber = new Intl.NumberFormat().format(assetPrice.toFixed(2)));
</script>

<div class="flex flex-col rounded-3xl bg-grey10 bg-opacity-30 border border-lightgrey20 p-8 pb-0">
  <p class="font-alcxTitles text-sm opacity-50">{assetName}</p>
  <p class="text-3xl">{assetTicker}</p>
  <p>
    <span class="text-base opacity-50">{currency || '$'}</span>
    <span class="text-3xl">{formattedNumber}</span>
  </p>
  <img
    src="images/icons/{assetIcon}"
    alt="The icon of {assetName}"
    class="w-max align-middle self-center my-20"
  />
</div>
