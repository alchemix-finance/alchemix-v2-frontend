<script>
  import Button from '../../../elements/Button.svelte';
  import BalanceQuickSelect from '../../../composed/BalanceQuickSelect.svelte';

  export let farmConfig = {};

  const startTransaction = async () => {
    await alert('metamask tx started');
  };
</script>

<div class='grid grid-cols-3 gap-8 ml-8 mr-4'>

  <div class='col-span-1 rounded bg-grey10 w-full flex flex-col'>
    <p class='text-sm text-lightgrey10 self-start'>
      Available
    </p>
    <div class='w-full self-center'>
      <p>
        123,123.1234 sTwABCD
      </p>
    </div>
    <div class='w-full self-end'>
      <BalanceQuickSelect />
      <Button
        label='Stake'
        on:clicked={() => startTransaction()}
      />
    </div>
  </div>

  <div class='col-span-1 rounded bg-grey10 w-full'>
    <p class='text-sm text-lightgrey10'>
      Staked
    </p>
    <p>
      123,123.1234 sTwABCD
    </p>
    <BalanceQuickSelect />
    <Button
      label='Withdraw'
      on:clicked={() => startTransaction()}
    />
  </div>

  <div class='col-span-1 rounded bg-grey10 w-full'>
    <p class='text-sm text-lightgrey10'>
      Rewards
    </p>
    <p>
      123,123.1234 sTwABCD
    </p>
    <p>
      123,123.1234 sTwABCD
    </p>
    <Button
      label='Claim'
      on:clicked={() => startTransaction()}
    />
  </div>

</div>
