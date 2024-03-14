<script>
  import numeral from 'numeral';

  export let hasBonus = false;
  export let bonusAmount = '0';
  export let limitedTime = false;
  export let distributionTimeAmount = '0';
  export let distributionTimeUnit = '';
  export let bonusToken = '';
  export let isPercentage = false;

  $: formattedBonusAmount = numeral(parseFloat(bonusAmount).toFixed(4)).format(
    isPercentage ? '0.00%' : '0.00a',
  );
</script>

{#if hasBonus}
  <p class="text-center">
    +{formattedBonusAmount}
    {bonusToken}
  </p>
  {#if limitedTime}
    <p class="text-center text-sm text-lightgrey10">
      {distributionTimeAmount}
      {distributionTimeUnit} left
    </p>
  {/if}
{:else}
  <p class="text-center">-</p>
{/if}
