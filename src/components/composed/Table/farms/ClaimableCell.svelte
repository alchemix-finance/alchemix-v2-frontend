<script>
  export let rewardAmount;
  export let rewardToken;
</script>

<div class="w-full">
  <p class="text-center">
    {rewardAmount}
  </p>
  {#if rewardToken}
    <p class="text-center">
      {rewardToken}
    </p>
  {/if}
</div>
