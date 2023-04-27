<script>
  import ContainerWithHeader from '@/components/elements/ContainerWithHeader.svelte';
  import Button from '@components/elements/Button.svelte';
  import ComplexInput from '@components/composed/Inputs/ComplexInput.svelte';

  import { migrateLiquidity } from '@stores/v2/liquidityMigrator';

  const tokenList = ['SUSHI'];
  const targetList = ['20WETH-80ALCX', 'aura20WETH-80ALCX-vault'];

  let migrationInputAmount;
  let selectedTarget;
  // TODO: add debounce for receive value
</script>

<ContainerWithHeader canToggle="{true}" isVisible="{true}">
  <div slot="header" class="text-sm flex flex-row justify-between">
    <p class="self-center">Liquidity Migration</p>
  </div>
  <div slot="body" class="flex flex-col space-y-4 p-4">
    <ComplexInput supportedTokens="{tokenList}" bind:inputValue="{migrationInputAmount}" />
    <ComplexInput
      inputValue="{migrationInputAmount}"
      supportedTokens="{targetList}"
      viewOnly="{true}"
      bind:selectedToken="{selectedTarget}"
    />
    <Button label="Migrate Liquidity" />
  </div>
</ContainerWithHeader>
