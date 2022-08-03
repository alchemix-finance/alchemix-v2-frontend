<script>
  import { _ } from 'svelte-i18n';
  import { slide } from 'svelte/transition';
  import { utils, BigNumber } from 'ethers';
  import Button from '../../../elements/Button.svelte';
  import settings from '@stores/settings';

  import {
    setPendingWallet,
    setPendingApproval,
    setPendingTx,
    setSuccessTx,
    setError,
  } from '@helpers/setToast';
  import InputNumber from '../../../elements/inputs/InputNumber.svelte';

  import { getTokenDataFromBalances } from '@stores/v2/helpers';
  import { addressStore, balancesStore } from '@stores/v2/alcxStore';
  import { contractWrapper, erc20Contract } from '@helpers/contractWrapper';
  import { signer } from '@stores/v2/derived';
  import { fetchBalanceByAddress, fetchInternalFarmByUuid } from '@stores/v2/asyncMethods';

  export let farm;
  export let farmType;

  const deposit = async (depositBN) => {
    try {
      const { instance: stakingInstance, address: stakingAddress } = await contractWrapper(
        'StakingPools',
        $signer,
        'ethereum',
      );
      const tokenContract = erc20Contract(farm.tokenAddress, $signer);

      const allowance = await tokenContract.allowanceOf($addressStore, stakingAddress);

      if (allowance.lt(depositBN)) {
        setPendingApproval();
        await tokenContract.approve(stakingAddress);
      }

      setPendingWallet();
      const tx = await stakingInstance.deposit(farm.poolId, depositBN);
      setPendingTx();

      await tx.wait().then((transaction) => {
        setSuccessTx(transaction.transactionHash);

        Promise.all([
          fetchInternalFarmByUuid(farm.uuid, farm.poolId, [$signer]),
          fetchBalanceByAddress(farm.tokenAddress, [$signer]),
        ]).then(() => {
          inputDepositAmount = '';
        });
      });
    } catch (error) {
      setError(error.message);
      console.debug(error);
    }
  };

  const withdraw = async (withdrawBN) => {
    try {
      const { instance: stakingInstance, address: stakingAddress } = await contractWrapper(
        'StakingPools',
        $signer,
        'ethereum',
      );
      setPendingWallet();

      const tx = await stakingInstance.withdraw(farm.poolId, withdrawBN);

      setPendingTx();

      await tx.wait().then((transaction) => {
        setSuccessTx(transaction.transactionHash);

        Promise.all([
          fetchInternalFarmByUuid(farm.uuid, farm.poolId, [$signer]),
          fetchBalanceByAddress(farm.tokenAddress, [$signer]),
        ]).then(() => {
          inputWithdrawAmount = '';
        });
      });
    } catch (error) {
      setError(error.message);
      console.debug(error);
    }
  };

  const claim = async () => {
    try {
      const { instance: stakingInstance, address: stakingAddress } = await contractWrapper(
        'StakingPools',
        $signer,
        'ethereum',
      );
      setPendingWallet();

      const tx = await stakingInstance.claim(farm.poolId);

      await tx.wait().then((transaction) => {
        setSuccessTx(transaction.transactionHash);

        Promise.all([
          fetchInternalFarmByUuid(farm.uuid, farm.poolId, [$signer]),
          fetchBalanceByAddress(farm.tokenAddress, [$signer]),
        ]);
      });
    } catch (error) {
      setError(error.message);
      console.debug(error);
    }
  };

  const checkButtonState = (inputAmount, balance) => {
    return inputAmount.gt(0) && inputAmount.lte(balance) && balance.gt(BigNumber.from(0));
  };

  const useBigNumberForInput = (inputValue) => {
    if (inputValue === 0 || inputValue === '') {
      return BigNumber.from(0);
    }

    return utils.parseEther(`${inputValue}`);
  };

  let inputDepositAmount = '';
  let inputWithdrawAmount = '';

  $: inputDepositBN = useBigNumberForInput(inputDepositAmount);
  $: inputWithdrawBN = useBigNumberForInput(inputWithdrawAmount);

  const getTokenInfo = (farm) => {
    if (farm) {
      return getTokenDataFromBalances(farm.tokenAddress, [$balancesStore]);
    }
  };

  $: tokenInfo = getTokenInfo(farm);
</script>

{#if farm}
  <div
    class="grid grid-cols-3 gap-8 pl-8 pr-4 py-4 border-b {$settings.invertColors
      ? 'border-grey10inverse'
      : 'border-grey10'}"
    transition:slide
  >
    <div
      class="p-4 flex flex-col space-y-4 rounded {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}"
    >
      <label for="borrowInput" class="text-sm text-lightgrey10">
        {$_('available')}: {utils.formatEther(tokenInfo.balance)}
        {farm.tokenSymbol}
      </label>
      <div
        class="flex rounded border {$settings.invertColors
          ? 'border-grey3inverse bg-grey3inverse'
          : 'border-grey3 bg-grey3'}"
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
            on:clicked="{() => (inputDepositAmount = utils.formatEther(tokenInfo.balance || 0))}"
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
        disabled="{!checkButtonState(inputDepositBN, tokenInfo.balance)}"
        on:clicked="{() => deposit(inputDepositBN)}"
      />
    </div>
    <div
      class="p-4 flex flex-col space-y-4 rounded {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}"
    >
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
            on:clicked="{() => (inputWithdrawAmount = utils.formatEther(farm.userDeposit || 0))}"
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
        disabled="{!checkButtonState(inputWithdrawBN, farm.userDeposit)}"
        on:clicked="{() => withdraw(inputWithdrawBN)}"
      />
    </div>

    <div
      class="p-4 flex flex-col space-y-4 rounded {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}"
    >
      <label for="borrowInput" class="text-sm text-lightgrey10"> {$_('table.rewards')}: </label>
      <div
        class="flex rounded border {$settings.invertColors
          ? 'bg-grey3inverse border-grey3inverse'
          : 'bg-grey3 border-grey3'}"
      >
        <div class="w-full">
          <div
            class="w-full rounded appearance-none text-xl text-right h-full py-6 px-14 {$settings.invertColors
              ? 'bg-grey3inverse'
              : 'bg-grey3'}"
          >
            {utils.formatEther(farm.userUnclaimed[0])}
            {farm.rewards[0].tokenName}
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
        disabled="{!farm.userUnclaimed[0].gt(BigNumber.from(0))}"
        on:clicked="{() => claim()}"
      />
    </div>
  </div>
{/if}
