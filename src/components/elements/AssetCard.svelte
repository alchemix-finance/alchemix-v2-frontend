<script>
import commaNumber from 'comma-number';

export let assetName = 'Alchemix Asset';
export let assetTicker = 'alASS';
export let assetPrice = 0.01;
export let currency = '$';
export let assetIcon = 'icon.png';
export let assetColor = 'bronze2';
</script>

<div class="flex flex-col w-80 rounded-3xl bg-grey10 bg-opacity-30 border border-lightgrey20 p-8 pb-0">
  <p class="font-alcxTitles text-sm opacity-50">{assetName}</p>
  <p class="text-3xl">{assetTicker}</p>
  <p>
    <span class="text-base opacity-50">{currency}</span>
    <span class="text-3xl">{commaNumber(assetPrice.toFixed(2))}</span>
  </p>
  <img
    src="images/asset-card-icons/{assetIcon}"
    alt="The icon of {assetName}"
    class="w-max align-middle self-center my-20"
  />
</div>
