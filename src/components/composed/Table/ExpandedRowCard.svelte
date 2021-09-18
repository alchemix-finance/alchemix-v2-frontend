<!--TODO: Make this component generic & pass all values as props -->
<script>
export let expandedRow;
</script>

<div class="border border-grey5 mx-8 rounded mt-4 mb-6 font-alcxTitles">
  <div class="flex px-10 py-8">
    <div class="mr-10">
      <div class="text-sm text-lightgrey10">Current Deposit</div>
      <div>{expandedRow.currentDeposit}</div>
    </div>
    <div class="mr-10">
      <div class="text-sm text-lightgrey10">Credit</div>
      <div>$3,750</div>
    </div>
    <div class="mr-10">
      <div class="text-sm text-lightgrey10">Debt</div>
      <div>$1,000</div>
    </div>
  </div>
</div>
