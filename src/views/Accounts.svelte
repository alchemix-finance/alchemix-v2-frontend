<script>
import Metrics from '../components/composed/Metrics.svelte';
import CollateralDropdown from '../components/composed/CollateralDropdown.svelte';
import CollateralPieChart from '../components/composed/CollateralPieChart.svelte';
import DebtCreditPieChart from '../components/composed/DebtCreditPieChart.svelte';
import metrics from '../stores/metrics';
</script>

<div>
  <Metrics />

  <div class="flex justify-between items-center my-6">
    <CollateralDropdown />

    <div class="flex justify-between">
      <div class="flex">
        <div>Current APY: {$metrics.account.APY}%</div>
        <div>Estimated Maturity: {$metrics.account.estimatedMaturity}</div>
      </div>
    </div>
  </div>

  <div class="flex">
    <div class="mr-4">
      <CollateralPieChart />
    </div>
    <div class="ml-4">
      <DebtCreditPieChart />
    </div>
  </div>
</div>
