<script>
  export let rewardAmount;
  export let rewardToken;
</script>

<div>
  {rewardAmount}
  {#if rewardToken}
    {rewardToken}
  {/if}
</div>
