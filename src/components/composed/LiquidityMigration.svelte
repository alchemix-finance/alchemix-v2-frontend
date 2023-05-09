<script>
  import ContainerWithHeader from '@/components/elements/ContainerWithHeader.svelte';
  import Button from '@components/elements/Button.svelte';
  import ComplexInput from '@components/composed/Inputs/ComplexInput.svelte';
  import { BarLoader } from 'svelte-loading-spinners';

  import { calculateParams, beginMigration } from '@stores/v2/liquidityMigrator';
  import { signer } from '@stores/v2/derived';
  import settings from '@stores/settings';
  import { utils } from 'ethers';

  const tokenList = ['SLP'];
  const targetList = ['BALANCER', 'AURA'];

  let migrationInputAmount;
  let selectedTarget;
  // TODO: add debounce for receive value
  let timer;
  let calculatingParams = false;
  let estimateBalancer = '0';
  let estimateAura = '0';
  let migrationParams;

  const debounce = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!calculatingParams && migrationInputAmount !== '') {
        preflight();
      }
    }, 750);
  };

  const preflight = async () => {
    calculatingParams = true;
    try {
      const params = await calculateParams(selectedTarget === targetList[1], migrationInputAmount, $signer);
      migrationParams = params;
      estimateBalancer = utils.formatEther(params.amountBalancerLiquidityOut);
      estimateAura = utils.formatEther(params.amountAuraSharesMinimum);
      calculatingParams = false;
    } catch (e) {
      console.log('[preflight]:', e);
      calculatingParams = false;
    }
  };

  const migrateLiquidity = async () => {
    try {
      await calculateParams(selectedTarget === targetList[1], migrationInputAmount, $signer)
        .then(async (response) => {
          await beginMigration(response, $signer);
        })
        .finally(() => {
          console.log('[migrateLiquidity]: all done!');
          migrationInputAmount = null;
          selectedTarget = null;
        });
    } catch (e) {
      console.log('[migrateLiquidity]:', e);
    }
  };

  $: migrationInputAmount, debounce();
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
    {#if calculatingParams}
      <BarLoader color="{$settings.invertColors ? '#6C93C7' : '#F5C59F'}" />
    {:else}
      <Button
        borderColor="green4"
        backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
        hoverColor="green4"
        height="h-12"
        label="Migrate Liquidity"
        on:clicked="{() => migrateLiquidity()}"
      />
    {/if}
  </div>
</ContainerWithHeader>
