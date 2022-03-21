<script>
  import ContainerWithHeader from '@components/elements/ContainerWithHeader';
  import settings from '@stores/settings';
  import Button from '@components/elements/Button';
  import { BarLoader } from 'svelte-loading-spinners';
  import { liquidateLegacy, withdrawLegacy } from '@stores/v2/flashloanActions';
  import { signer } from '@stores/v2/derived';
  import { addressStore } from '@stores/v2/alcxStore';

  let mode = 0;
  let processing = false;

  const migration = async (targetAlchemist) => {
    processing = true;
    try {
      mode = 1;
      await liquidateLegacy(targetAlchemist, [$addressStore, $signer]);
      mode = 2;
      await withdrawLegacy(targetAlchemist, [$addressStore, $signer]);
      mode = 0;
    } catch (error) {
      mode = 0;
    }
    processing = false;
  };
</script>

<ContainerWithHeader canToggle="{true}" isVisible="{true}">
  <div class="text-sm flex flex-row justify-between" slot="header">
    <p class="self-center">Legacy Migration</p>
  </div>
  <div slot="body" class="flex flex-col space-y-4 p-4">
    <div class="w-full rounded p-4 {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}">
      <p class="mb-4">
        To make it as simple as possible to migrate your Legacy vault deposits into V2, Alchemix is providing
        a migration tool which enables you to transfer your position into V2 while staying as gas-cost
        efficient as possible.
      </p>
      <p class="mb-4">
        Your wallet will prompt you a few times to sign transactions that take care of the steps detailed
        below. Approvals might be required.
      </p>
      <p class="text-center font-bold mb-4">This requires liquidation of your Legacy position.</p>
      <div class="w-full flex flex-row space-x-4 justify-between h-12">
        <Button
          disabled="{processing}"
          label="Migrate from Legacy alUSD"
          borderColor="green4"
          backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
          hoverColor="green4"
          on:clicked="{() => migration(0)}"
        />
        <Button
          disabled="{processing}"
          label="Migrate from Legacy alETH"
          borderColor="green4"
          backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
          hoverColor="green4"
          on:clicked="{() => migration(1)}"
        />
      </div>
    </div>
    <div class="w-full flex flex-row space-x-4">
      <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}">
        <p class="text-lg">Step 1: Liquidating</p>
        <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
          First step is to liquidate your outstanding debt, if applicable.
        </p>
        <div class="flex flex-row justify-center">
          <BarLoader
            duration="{mode === 1 ? '2.1s' : '0'}"
            color="{$settings.invertColors ? '#6C93C7' : '#F5C59F'}"
          />
        </div>
      </div>
      <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}">
        <p class="text-lg">Step 2: Withdrawing</p>
        <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
          Second step withdraws your entire balance from V1.
        </p>
        <div class="flex flex-row justify-center">
          <BarLoader
            duration="{mode === 2 ? '2.1s' : '0'}"
            color="{$settings.invertColors ? '#6C93C7' : '#F5C59F'}"
          />
        </div>
      </div>
      <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}">
        <p class="text-lg">Step 3: Migrating</p>
        <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
          Third step flash-loans your balance into a deposit.
        </p>
        <div class="flex flex-row justify-center">
          <BarLoader
            duration="{mode === 3 ? '2.1s' : '0'}"
            color="{$settings.invertColors ? '#6C93C7' : '#F5C59F'}"
          />
        </div>
      </div>
    </div>
  </div>
</ContainerWithHeader>
