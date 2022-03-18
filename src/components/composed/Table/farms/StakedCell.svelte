<script>
  import { utils } from 'ethers';

  export let tokenSymbol;
  export let amount;
</script>

<div class="w-full">
  <p class="text-center">
    {utils.formatEther(amount)}
  </p>
  <p class="text-center">
    {tokenSymbol}
  </p>
</div>
