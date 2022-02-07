<script>
  // eslint-disable-next-line unused-export-let
  export let type;
  export let depositAmount;
  export let depositAsset;
  export let creditLimit;
  export let borrowAmount;
  export let borrowAsset;
</script>

<div class="flex space-x-8 justify-between border-b border-grey10 pl-8 pr-4 py-4">
  <div class="grow-0 flex flex-col w-max rounded bg-grey10 whitespace-nowrap">
    <p class="text-sm text-lightgrey10 self-start">Deposited</p>
    <div class="w-full self-center">
      <p>{depositAmount} {depositAsset}</p>
    </div>
  </div>

  <div class="grow-0 flex flex-col w-max rounded bg-grey10 whitespace-nowrap">
    <p class="text-sm text-lightgrey10 self-start">Credit Limit</p>
    <div class="w-full self-center">
      <p>{creditLimit} {borrowAsset}</p>
    </div>
  </div>

  <div class="grow-0 flex flex-col w-max rounded bg-grey10 whitespace-nowrap">
    <p class="text-sm text-lightgrey10 self-start">Loan Amount</p>
    <div class="w-full self-center">
      <p>{borrowAmount} {borrowAsset}</p>
    </div>
  </div>

  <div class="grow flex flex-col w-full rounded bg-grey10">
    <p class="text-sm text-lightgrey10 self-start">$action</p>
  </div>
</div>
