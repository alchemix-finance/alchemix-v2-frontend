<script>
import ViewContainer from '../components/elements/ViewContainer.svelte';
import Metrics from '../components/composed/Metrics.svelte';
import CollateralDropdown from '../components/composed/CollateralDropdown.svelte';
import CollateralPieChart from '../components/composed/CollateralPieChart.svelte';
import DebtCreditPieChart from '../components/composed/DebtCreditPieChart.svelte';
import AccountTable from '../components/composed/Table/AccountTable.svelte';
import metrics from '../stores/metrics';
</script>

<style>
.min-w-page {
  /*  we may want to have a responsive design instead of this */
  min-width: 1025px;
}
</style>

<div>
  <Metrics />

  <ViewContainer>
    <div class="min-w-page">
      <div class="px-4">
        <div class="flex justify-between items-center mt-10 mb-14">
          <CollateralDropdown />

          <div class="flex justify-between">
            <div class="flex">
              <div class="font-alcxTitles mr-4">
                <span class="text-bronze1 mr-1">Current APY:</span>
                <span>{$metrics.account.APY}%</span>
              </div>
              <div class="font-alcxTitles">
                <span class="text-bronze1 mr-1">Estimated Maturity:</span>
                <span>{$metrics.account.estimatedMaturity}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TODO: Turn pie charts into bar charts -->
        <!--      <div class="flex">-->
        <!--        <div class="mr-4">-->
        <!--          <CollateralPieChart />-->
        <!--        </div>-->
        <!--        <div class="ml-4">-->
        <!--          <DebtCreditPieChart />-->
        <!--        </div>-->
        <!--      </div>-->
      </div>
    </div>

    <div class="mt-10 px-4">
      <AccountTable />
    </div>
  </ViewContainer>
</div>
