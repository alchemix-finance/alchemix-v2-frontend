<script>
  import { utils, BigNumber } from 'ethers';
  import { getVaultCapacity } from '../../../stores/v2/vaultActions';
  import numeral from 'numeral';

  export let yieldTokenAddress;
  export let underlyingPerShare;
  export let vaultType;
  export let signer;
  export let decimals;
  export let symbol;

  let capacity;
  const vaultCapacity = async () => {
    capacity = await getVaultCapacity(yieldTokenAddress, vaultType, [signer]);
  };
  $: valueFormatted = numeral(utils.formatUnits(capacity?.value || BigNumber.from(0), decimals)).format('0.00a');
  $: limitFormatted = numeral(utils.formatUnits(capacity?.limit || BigNumber.from(0), decimals)).format('0a');

  $: yieldTokenAddress, vaultCapacity()
  $: underlyingPerShare, vaultCapacity()

</script>

<div class='flex flex-col items-center mb-1'>
  <p>
    {valueFormatted} / {limitFormatted}
    {symbol}
  </p>
</div>
<div class="w-full self-start">
  <div class="relative">
    <div class="overflow-hidden h-2 text-xs flex rounded bg-bronze4 border border-bronze1">
      <div
        style="width: {100-parseFloat(capacity?.percent.toString())/100 || 0}%"
        class="shadow-none flex flex-col text-left whitespace-nowrap text-white justify-center bg-bronze1"
      ></div>
    </div>
  </div>
</div>
