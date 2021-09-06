<!--TODO: Make this component generic & pass all values as props -->
<script>
export let expandedRow;
</script>

<div class="flex">
  <div>{expandedRow.value}</div>
  <div>
    <div>Current Deposit</div>
    <div>$5,000</div>
  </div>
  <div>
    <div>Credit</div>
    <div>$3,750</div>
  </div>
  <div>
    <div>Debt</div>
    <div>$1,000</div>
  </div>
</div>
