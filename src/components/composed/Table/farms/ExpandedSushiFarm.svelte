<script>
  import { _ } from 'svelte-i18n';
  import { slide } from 'svelte/transition';
  import { utils, BigNumber } from 'ethers';
  import { gasResolver } from '@helpers/getUserGas';
  import {
    setPendingWallet,
    setPendingApproval,
    setPendingTx,
    setSuccessTx,
    setError,
  } from '@helpers/setToast';
  import Button from '@components/elements/Button.svelte';
  import InputNumber from '@components/elements/inputs/InputNumber.svelte';

  import { erc20Contract, externalContractWrapper } from '@helpers/contractWrapper';
  import { signer } from '@stores/v2/derived';
  import { addressStore } from '@stores/v2/alcxStore';
  import settings from '@stores/settings';

  export let farm;

  let inputDepositAmount = 0;
  let inputWithdrawAmount = 0;

  const useBigNumberForInput = (inputValue) => {
    if (inputValue === 0 || inputValue === '') {
      return BigNumber.from(0);
    }

    return utils.parseEther(`${inputValue}`);
  };

  $: depositAmountBN = useBigNumberForInput(inputDepositAmount);
  $: withdrawAmountBN = useBigNumberForInput(inputWithdrawAmount);

  const { instance: masterchefInstance, address: masterchefAddress } = externalContractWrapper(
    'SushiMasterchefV2',
    $signer,
  );

  const deposit = async (amount) => {
    try {
      const gas = await gasResolver();
      const tokenContract = erc20Contract(farm.poolTokenAddress, $signer);

      const allowance = await tokenContract.allowanceOf($addressStore, masterchefAddress);

      if (allowance.lt(amount)) {
        setPendingApproval();
        await tokenContract.approve(farm.tokenAddress, masterchefAddress);
      }
      setPendingWallet();
      const tx = await masterchefInstance.deposit(0, amount, $addressStore, {
        gasPrice: gas,
      });
      setPendingTx();

      await tx.wait().then((transaction) => {
        setSuccessTx(transaction.transactionHash);
      });
    } catch (error) {
      setError(error.message);
      console.debug(error);
    }
  };

  const withdraw = async (amount) => {
    try {
      const tokenContract = erc20Contract(farm.poolTokenAddress, $signer);
      const gas = await gasResolver();
      const allowance = await tokenContract.allowanceOf($addressStore, masterchefAddress);

      if (allowance.lt(amount)) {
        setPendingApproval();
        await tokenContract.approve(farm.tokenAddress, masterchefAddress);
      }
      setPendingWallet();
      const tx = await masterchefInstance.withdrawAndHarvest(0, amount, $addressStore, {
        gasPrice: gas,
      });
      setPendingTx();

      await tx.wait().then((transaction) => {
        setSuccessTx(transaction.transactionHash);
      });
    } catch (error) {
      setError(error.message);
      console.debug(error);
    }
  };

  const claim = async () => {
    try {
      const gas = await gasResolver();

      setPendingWallet();
      const tx = await masterchefInstance.harvest(0, $addressStore, {
        gasPrice: gas,
      });
      setPendingTx();

      tx.wait().then((transaction) => {
        setSuccessTx(transaction.transactionHash);
      });
    } catch (error) {
      setError(error.message);
      console.debug(error);
    }
  };

  const checkButtonState = (inputAmount, balance) => {
    return inputAmount.gt(0) && balance.lte(inputAmount) && balance.gt(BigNumber.from(0));
  };
</script>

<div
  class="grid grid-cols-3 gap-8 pl-8 pr-4 py-4 border-b {$settings.invertColors
    ? 'border-grey10inverse'
    : 'border-grey10'}"
  transition:slide|local
>
  <div class="p-4 flex flex-col space-y-4">
    <label for="borrowInput" class="text-sm text-lightgrey10">
      {$_('available')}: {utils.formatEther(farm.tokenBalance)}
      {farm.tokenSymbol}
    </label>
    <div
      class="flex rounded border {$settings.invertColors
        ? 'bg-grey3inverse border-grey3inverse'
        : 'bg-grey3 border-grey3'}"
    >
      <div class="w-full">
        <InputNumber
          id="borrowInput"
          placeholder="~0.00 {farm.tokenSymbol}"
          bind:value="{inputDepositAmount}"
          class="w-full rounded appearance-none text-xl text-right h-full p-4 {$settings.invertColors
            ? 'bg-grey3inverse'
            : 'bg-grey3'}"
        />
      </div>
      <div class="flex flex-col">
        <Button
          label="MAX"
          width="w-full"
          fontSize="text-xs"
          textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
          backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
          borderSize="0"
          height="h-10"
          on:clicked="{() => (inputDepositAmount = utils.formatEther(farm.tokenBalance || 0))}"
        />
        <Button
          label="CLEAR"
          width="w-max"
          fontSize="text-xs"
          textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
          backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
          borderSize="0"
          height="h-10"
          on:clicked="{() => (inputDepositAmount = '')}"
        />
      </div>
    </div>
    <Button
      label="{$_('actions.deposit')}"
      borderSize="1"
      borderColor="green4"
      backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
      hoverColor="green4"
      height="h-12"
      fontSize="text-md"
      disabled="{!checkButtonState(depositAmountBN, farm.tokenBalance)}"
      on:clicked="{() => deposit(depositAmountBN)}"
    />
  </div>

  <div class="p-4 flex flex-col space-y-4">
    <label for="withdrawInput" class="text-sm text-lightgrey10">
      {$_('available')}: {utils.formatEther(farm.userDeposit)}
      {farm.tokenSymbol}
    </label>
    <div
      class="flex rounded border {$settings.invertColors
        ? 'bg-grey3inverse border-grey3inverse'
        : 'bg-grey3 border-grey3'}"
    >
      <div class="w-full">
        <InputNumber
          id="withdrawInput"
          placeholder="~0.00 {farm.tokenSymbol}"
          bind:value="{inputWithdrawAmount}"
          class="w-full rounded appearance-none text-xl text-right h-full p-4 {$settings.invertColors
            ? 'bg-grey3inverse'
            : 'bg-grey3'}"
        />
      </div>
      <div class="flex flex-col">
        <Button
          label="MAX"
          width="w-full"
          fontSize="text-xs"
          textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
          backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
          borderSize="0"
          height="h-10"
          on:clicked="{() => (inputWithdrawAmount = utils.formatEther(farm.userDeposit.amount || 0))}"
        />
        <Button
          label="CLEAR"
          width="w-max"
          fontSize="text-xs"
          textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
          backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
          borderSize="0"
          height="h-10"
          on:clicked="{() => (inputWithdrawAmount = '')}"
        />
      </div>
    </div>
    <Button
      label="{$_('actions.withdraw')}"
      borderSize="1"
      borderColor="green4"
      backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
      hoverColor="green4"
      height="h-12"
      fontSize="text-md"
      disabled="{!checkButtonState(withdrawAmountBN, farm.userDeposit.amount)}"
      on:clicked="{() => withdraw(withdrawAmountBN)}"
    />
  </div>
  <div class="p-4 flex flex-col space-y-4">
    <label for="borrowInput" class="text-sm text-lightgrey10"> {$_('table.rewards')}: </label>
    <div
      class="flex rounded border {$settings.invertColors
        ? 'bg-grey3inverse border-grey3inverse'
        : 'bg-grey3 border-grey3'}"
    >
      <div class="w-full flex flex-row">
        <div
          class="w-full rounded appearance-none text-xl text-right h-full py-3 px-14 {$settings.invertColors
            ? 'bg-grey3inverse'
            : 'bg-grey3'}"
        >
          <p>
            {utils.formatEther(farm.userUnclaimed[0])}
            {farm.rewards[0].tokenName}
          </p>
          <p class="mb-0">
            {utils.formatEther(farm.userUnclaimed[1])}
            {farm.rewards[1].tokenName}
          </p>
        </div>
      </div>
    </div>
    <Button
      label="{$_('actions.claim')}"
      borderSize="1"
      borderColor="green4"
      backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
      hoverColor="green4"
      height="h-12"
      fontSize="text-md"
      disabled="{!farm.userUnclaimed[0].gt(BigNumber.from(0)) ||
        !farm.userUnclaimed[1].gt(BigNumber.from(0))}"
      on:clicked="{() => claim()}"
    />
  </div>
</div>
