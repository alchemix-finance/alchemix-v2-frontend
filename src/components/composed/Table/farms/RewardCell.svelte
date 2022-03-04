<script>
  export let rewards = [];
</script>

<div>
  {#each rewards as reward, i}
    <span>
      <img
        src="images/icons/{reward.iconName}.svg"
        alt="{reward.tokenName}"
        class="h-7 w-7 inline-block mr-1"
      />
      {reward.tokenName}
      {#if rewards.length > 1 && i + 1 < rewards.length}
        +
      {/if}
    </span>
  {/each}
</div>
