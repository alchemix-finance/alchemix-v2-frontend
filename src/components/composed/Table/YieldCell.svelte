<script>
  export let yieldRate = '0';
  export let bonusYield;
  export let bonusYieldRate;
  export let bonusYieldTokenSymbol;
</script>

<p class="text-center">{yieldRate}%</p>
{#if bonusYield}
  <p class="text-center text-sm text-lightgrey10">
    +{bonusYieldRate}% {bonusYieldTokenSymbol}
  </p>
{/if}
