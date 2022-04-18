<script>
  import { utils, BigNumber } from 'ethers';
  import { getVaultCapacity } from '@stores/v2/vaultActions';
  import numeral from 'numeral';
  import { networkStore } from '@stores/v2/alcxStore';

  export let yieldTokenAddress;
  export let underlyingPerShare;
  export let vaultType;
  export let signer;
  export let decimals;
  export let symbol;

  let capacity;
  const vaultCapacity = async () => {
    capacity = await getVaultCapacity(yieldTokenAddress, vaultType, [signer], $networkStore);
  };
  $: valueFormatted = numeral(utils.formatUnits(capacity?.value || BigNumber.from(0), decimals)).format(
    '0.00a',
  );
  $: limitFormatted = numeral(utils.formatUnits(capacity?.limit || BigNumber.from(0), decimals)).format(
    '0.00a',
  );

  $: yieldTokenAddress, vaultCapacity();
  $: underlyingPerShare, vaultCapacity();
</script>

<div class="w-full self-start pt-2">
  <div class="relative">
    <div class="overflow-hidden h-2 text-xs flex rounded bg-bronze4 border border-bronze1">
      <div
        class="shadow-none flex flex-col text-left whitespace-nowrap text-white justify-center bg-bronze1"
        style="width: {100 - parseFloat(capacity?.percent.toString()) / 100 || 0}%"
      ></div>
    </div>
  </div>
</div>
<div class="flex flex-col items-center mt-2">
  <p class="text-sm text-lightgrey10">
    {valueFormatted} / {limitFormatted}
    {symbol}
  </p>
</div>
