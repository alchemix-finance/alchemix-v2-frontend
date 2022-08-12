<script>
  import { utils, BigNumber } from 'ethers';
  import { getVaultCapacity } from '@stores/v2/vaultActions';
  import numeral from 'numeral';
  import { networkStore } from '@stores/v2/alcxStore';
  import settings from '@stores/settings';

  export let yieldTokenAddress;
  export let underlyingPerShare;
  export let vaultType;
  export let signer;
  export let decimals;
  export let symbol;
  export let capInfo;

  let capacity;

  const vaultCapacity = async () => {
    capacity = await getVaultCapacity(yieldTokenAddress, vaultType, [signer], $networkStore);
  };
  $: valueFormatted = numeral(
    utils.formatUnits(capacity?.limit.sub(capacity?.value) || BigNumber.from(0), decimals),
  ).format('0.00a');
  $: limitFormatted = numeral(utils.formatUnits(capacity?.limit || BigNumber.from(0), decimals)).format(
    '0.00a',
  );
  $: isFull = valueFormatted === limitFormatted;
  $: capInfo = { isFull, capacity };

  $: yieldTokenAddress, vaultCapacity();
  $: underlyingPerShare, vaultCapacity();
</script>

<div class="w-full self-start pt-2">
  <div class="relative">
    <div
      class="overflow-hidden h-2 text-xs flex rounded border {$settings.invertColors
        ? 'bg-bronze4inverse border-bronze1inverse'
        : 'bg-bronze4 border-bronze1'}"
    >
      <div
        class="shadow-none flex flex-col text-left whitespace-nowrap text-white justify-center {$settings.invertColors
          ? 'bg-bronze1inverse'
          : 'bg-bronze1'}"
        style="width: {100 - parseFloat(capacity?.percent.toString()) / 100 || 0}%"
      ></div>
    </div>
  </div>
</div>
<div class="flex flex-col items-center mt-2">
  <p class="text-sm text-lightgrey10">
    {#if isFull}
      Vault Full ({valueFormatted} {symbol})
    {:else}
      {valueFormatted} / {limitFormatted}
      {symbol}
    {/if}
  </p>
</div>
