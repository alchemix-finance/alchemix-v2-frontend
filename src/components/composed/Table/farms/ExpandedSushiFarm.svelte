<script>
  import { slide } from 'svelte/transition';
  import { utils, BigNumber } from 'ethers';
  import { getExternalContract } from '@helpers/getContract';
  import Button from '@components/elements/Button.svelte';
  import InputNumber from '@components/elements/inputs/InputNumber.svelte';

  export let token;
  export let stakedBalance;
  export let unclaimedAlcx;
  export let unclaimedSushi;
  export let slpBalance;

  let depositAmount;
  let withdrawAmount;

  const mcv2contract = getExternalContract('SushiMasterchefV2');

  const setMaxDeposit = () => {
    depositAmount = utils.formatEther(slpBalance);
  };
  const clearDeposit = () => {
    depositAmount = '';
  };

  const setMaxWithdraw = () => {
    withdrawAmount = utils.formatEther(stakedBalance.amount);
  };
  const clearWithdraw = () => {
    withdrawAmount = '';
  };

  console.table($$props);

  $: unclaimedAlcxFormatted = Math.floor(parseFloat(utils.formatEther(unclaimedAlcx)));
  $: unclaimedSushiFormatted = Math.floor(parseFloat(utils.formatEther(unclaimedSushi)));
</script>

<div class="grid grid-cols-3 gap-8 pl-8 pr-4 py-4 border-b border-grey10" transition:slide>
  <div class="p-4 flex flex-col space-y-4">
    <label for="borrowInput" class="text-sm text-lightgrey10">
      Available: {token.balance}
      {token.symbol}
    </label>
    <div class="flex bg-grey3 rounded border border-grey3">
      <div class="w-full">
        <InputNumber
          id="borrowInput"
          placeholder="~0.00 {token.symbol}"
          bind:value="{depositAmount}"
          class="w-full rounded appearance-none text-xl text-right h-full p-4 bg-grey3"
        />
      </div>
      <div class="flex flex-col">
        <Button
          label="MAX"
          width="w-full"
          fontSize="text-xs"
          textColor="lightgrey10"
          backgroundColor="grey3"
          borderSize="0"
          height="h-10"
          on:clicked="{() => setMaxDeposit()}"
        />
        <Button
          label="CLEAR"
          width="w-max"
          fontSize="text-xs"
          textColor="lightgrey10"
          backgroundColor="grey3"
          borderSize="0"
          height="h-10"
          on:clicked="{() => clearDeposit()}"
        />
      </div>
    </div>
    <Button
      label="Deposit"
      borderSize="1"
      borderColor="green4"
      backgroundColor="black1"
      hoverColor="green4"
      height="h-12"
      fontSize="text-md"
      on:clicked="{() => deposit()}"
    />
  </div>

  <div class="p-4 flex flex-col space-y-4">
    <label for="withdrawInput" class="text-sm text-lightgrey10">
      Available: {stakedBalance.amount}
      {token.symbol}
    </label>
    <div class="flex bg-grey3 rounded border border-grey3">
      <div class="w-full">
        <InputNumber
          id="withdrawInput"
          placeholder="~0.00 {token.symbol}"
          bind:value="{withdrawAmount}"
          class="w-full rounded appearance-none text-xl text-right h-full p-4 bg-grey3"
        />
      </div>
      <div class="flex flex-col">
        <Button
          label="MAX"
          width="w-full"
          fontSize="text-xs"
          textColor="lightgrey10"
          backgroundColor="grey3"
          borderSize="0"
          height="h-10"
          on:clicked="{() => setMaxWithdraw()}"
        />
        <Button
          label="CLEAR"
          width="w-max"
          fontSize="text-xs"
          textColor="lightgrey10"
          backgroundColor="grey3"
          borderSize="0"
          height="h-10"
          on:clicked="{() => clearWithdraw()}"
        />
      </div>
    </div>
    <Button
      label="Withdraw"
      borderSize="1"
      borderColor="green4"
      backgroundColor="black1"
      hoverColor="green4"
      height="h-12"
      fontSize="text-md"
      on:clicked="{() => withdraw()}"
    />
  </div>
  <div class="p-4 flex flex-col space-y-4">
    <label for="borrowInput" class="text-sm text-lightgrey10"> Rewards: </label>
    <div class="flex bg-grey3 rounded border border-grey3">
      <div class="w-full flex flex-row">
        <div class="w-full rounded appearance-none text-xl text-right h-full py-3 px-14 bg-grey3">
          <p>
            {unclaimedAlcxFormatted}
            ALCX
          </p>
          <p class="mb-0">
            {unclaimedSushiFormatted}
            SUSHI
          </p>
        </div>
      </div>
    </div>
    <Button
      label="Claim"
      borderSize="1"
      borderColor="green4"
      backgroundColor="black1"
      hoverColor="green4"
      height="h-12"
      fontSize="text-md"
      on:clicked="{() => claim()}"
    />
  </div>
</div>
