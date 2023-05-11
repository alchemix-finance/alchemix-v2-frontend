<script>
  import ContainerWithHeader from '@/components/elements/ContainerWithHeader.svelte';
  import Button from '@components/elements/Button.svelte';
  import ComplexInput from '@components/composed/Inputs/ComplexInput.svelte';
  import { BarLoader } from 'svelte-loading-spinners';

  import { calculateParams, beginMigration } from '@stores/v2/liquidityMigrator';
  import { getTokenDataFromBalancesBySymbol } from '@stores/v2/helpers';
  import { signer } from '@stores/v2/derived';
  import { balancesStore, addressStore } from '@stores/v2/alcxStore';
  import settings from '@stores/settings';
  import { utils } from 'ethers';

  const tokenList = ['SLP'];
  const targetList = ['AURA', 'BALANCER'];

  let migrationInputAmount;
  let selectedTarget;
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
    estimateBalancer = '0';
    estimateAura = '0';
    try {
      const amountToBN = utils.parseEther(migrationInputAmount);
      const params = await calculateParams(selectedTarget === targetList[0], amountToBN, $signer);
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
      await beginMigration(migrationParams, $signer, $addressStore)
        .then((response) => {
          console.log(response);
        })
        .finally(() => {
          console.log('[migrateLiquidity]: all done!');
          migrationInputAmount = null;
          selectedTarget = null;
          estimateBalancer = '0';
          estimateAura = '0';
          migrationParams = null;
        });
    } catch (e) {
      console.log('[migrateLiquidity]:', e);
      migrationInputAmount = null;
      selectedTarget = null;
      estimateBalancer = '0';
      estimateAura = '0';
      migrationParams = null;
    }
  };

  $: migrationInputAmount, debounce();
  $: projectedAmount = selectedTarget === targetList[0] ? estimateAura : estimateBalancer;
  $: slpBalance = getTokenDataFromBalancesBySymbol(tokenList[0], [$balancesStore]);
</script>

<ContainerWithHeader canToggle="{true}" isVisible="{true}">
  <div slot="header" class="text-sm flex flex-row justify-between">
    <p class="self-center">Liquidity Migration</p>
  </div>
  <div slot="body" class="flex flex-col space-y-4 p-4">
    <ComplexInput supportedTokens="{tokenList}" bind:inputValue="{migrationInputAmount}" />
    <ComplexInput
      inputValue="{projectedAmount}"
      supportedTokens="{targetList}"
      viewOnly="{true}"
      bind:selectedToken="{selectedTarget}"
    />
    {#if calculatingParams}
      <div class="flex flex-row justify-center items-center h-12">
        <BarLoader color="{$settings.invertColors ? '#6C93C7' : '#F5C59F'}" />
      </div>
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
