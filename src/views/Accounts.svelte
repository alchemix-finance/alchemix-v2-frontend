<script>
import ViewContainer from '../components/elements/ViewContainer.svelte';
import PageHeader from '../components/elements/PageHeader.svelte';
import ContainerWithHeader from '../components/elements/ContainerWithHeader.svelte';
import Button from '../components/elements/Button.svelte';
import Metrics from '../components/composed/Metrics.svelte';
import CollateralDropdown from '../components/composed/CollateralDropdown.svelte';
import AccountsPageBarCharts from '../components/composed/AccountsPageBarCharts.svelte';
import AccountTable from '../components/composed/Table/AccountTable.svelte';
import metrics from '../stores/metrics';
</script>

<ViewContainer>
  <div slot="head" class="flex justify-between">
    <PageHeader pageIcon="vault_thin.svg" pageTitle="My Accounts" pageSubtitle="Your personal dashboard" />
  </div>

  <div class="w-full mb-8">
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6">
        <Metrics />
      </div>
    </ContainerWithHeader>
  </div>

  <div class="w-full mb-8">
    <ContainerWithHeader canToggle="{true}">
      <p slot="header" class="inline-block self-center">Aggregate</p>
      <div slot="body" class="px-4 pb-4 bg-grey15">
        <AccountsPageBarCharts />
      </div>
    </ContainerWithHeader>
  </div>

  <div class="w-full mb-8">
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 text-sm">Vaults</div>
      <div slot="body">
        <AccountTable />
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
