<script>
  export let rewards = [];
</script>

<div class="flex flex-row space-x-2 justify-center">
  {#each rewards as reward, i}
    <div class="flex flex-col space-y-1 items-center">
      <img src="./images/icons/{reward.iconName}.svg" alt="{reward.tokenName}" class="h-7 w-7 mx-auto" />
      <p class="text-center text-sm text-lightgrey10">
        {reward.tokenName}
      </p>
    </div>
    {#if rewards.length > 1 && i + 1 < rewards.length}
      <div>+</div>
    {/if}
  {/each}
</div>
