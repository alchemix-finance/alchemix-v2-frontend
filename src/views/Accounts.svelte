<script>
import Metrics from '../components/composed/Metrics.svelte';
import Dropdown from '../components/elements/Dropdown.svelte';
import CollateralPieChart from '../components/composed/CollateralPieChart.svelte';
import DebtCreditPieChart from '../components/composed/DebtCreditPieChart.svelte';
import metrics from '../stores/metrics';
</script>

<div>
  <Metrics />

  <div class="flex justify-between mt-8 mb-8">
    <Dropdown>
      <button slot="label">All</button>
      <ul slot="options" class="w-40">
        <li class="cursor-default h-8">
          <p class="text-center opacity-50">Collateral 1</p>
        </li>
        <li class="cursor-default h-8 border-b border-t border-grey10">
          <p class="text-center opacity-50">Collateral 2</p>
        </li>
        <li class="cursor-pointer h-8 hover:bg-grey10">
          <p class="text-center opacity-50">Collateral 2</p>
        </li>
      </ul>
    </Dropdown>
    <div class="flex">
      <div>Current APY: {$metrics.account.APY}%</div>
      <div>Estimated Maturity: {$metrics.account.estimatedMaturity}</div>
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
