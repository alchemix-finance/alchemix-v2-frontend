<script>
  import { _ } from 'svelte-i18n';
  import { onMount } from 'svelte';
  import { utils, BigNumber } from 'ethers';
  import { getVaultCapacity } from '../../../stores/v2/vaultActions';
  import { numberShortener } from '../../../helpers/numberShortener';

  export let yieldTokenAddress;
  export let yieldPerShare;
  export let underlyingPerShare;
  export let vaultType;
  export let signer;
  export let decimals;
  export let symbol;

  let capacity;
  const vaultCapacity = async () => {
    capacity = await getVaultCapacity(yieldTokenAddress, vaultType, [signer]);
  };
  $: tokenFormatted = numberShortener(utils.formatUnits(capacity?.value || BigNumber.from(0), decimals));

  onMount(async () => {
    await vaultCapacity();
  });
</script>

<div class="flex flex-col items-center">
  <p>
    {tokenFormatted}
    {symbol}
  </p>
  <p class="text-sm text-lightgrey10">{capacity?.percent / 100}% {$_('available')}</p>
</div>
