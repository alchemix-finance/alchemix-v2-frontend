<script>
  import { _ } from 'svelte-i18n';
  import Button from '../../../elements/Button.svelte';
  import { BigNumber, utils } from 'ethers';
  import InputNumber from '../../../elements/inputs/InputNumber.svelte';
  import { getTokenDataFromBalances } from '@stores/v2/helpers';
  import { addressStore, balancesStore, networkStore } from '@stores/v2/alcxStore';
  import { claim, deposit, withdraw } from '@stores/v2/transmuterActions';
  import { signer } from '@stores/v2/derived';
  import { fetchBalanceByAddress, fetchTransmuterBySelector } from '@stores/v2/asyncMethods';
  import settings from '@stores/settings';

  export let transmuterData;

  const onDepositButton = async (tokenAddress, amountToDeposit, tokenDecimals) => {
    const _fAmountToDeposit = utils.parseUnits(utils.formatEther(amountToDeposit), tokenDecimals);

    await deposit(
      tokenAddress,
      _fAmountToDeposit,
      transmuterData.contractSelector,
      [$signer, $addressStore],
      $networkStore,
    ).then(() => {
      Promise.all([
        fetchBalanceByAddress(tokenAddress, [$signer]),
        fetchTransmuterBySelector(
          transmuterData.type,
          transmuterData.contractSelector,
          [$signer, $addressStore],
          $networkStore,
        ),
      ]).then(() => {
        inputDepositAmount = '';
        console.log(`[onDepositButton/deposit/finish]: Updated!`);
      });
    });
  };

  const onWithdrawButton = async (tokenAddress, amountToWithdraw, tokenDecimals) => {
    const _fAmountToWithdraw = utils.parseUnits(utils.formatEther(amountToWithdraw), tokenDecimals);

    await withdraw(
      _fAmountToWithdraw,
      transmuterData.contractSelector,
      [$signer, $addressStore],
      $networkStore,
    ).then(() => {
      Promise.all([
        fetchBalanceByAddress(tokenAddress, [$signer]),
        fetchTransmuterBySelector(
          transmuterData.type,
          transmuterData.contractSelector,
          [$signer, $addressStore],
          $networkStore,
        ),
      ]).then(() => {
        inputWithdrawAmount = '';
        console.log(`[onWithdrawButton/withdraw/finish]: Updated!`);
      });
    });
  };

  const onClaimButton = async (tokenAddress, amountToClaim, tokenDecimals) => {
    const _fAmountToClaim = utils.parseUnits(utils.formatEther(amountToClaim), tokenDecimals);

    await claim(
      _fAmountToClaim,
      transmuterData.contractSelector,
      [$signer, $addressStore],
      $networkStore,
    ).then(() => {
      Promise.all([
        fetchBalanceByAddress(tokenAddress, [$signer]),
        fetchTransmuterBySelector(
          transmuterData.type,
          transmuterData.contractSelector,
          [$signer, $addressStore],
          $networkStore,
        ),
      ]).then(() => {
        inputClaimAmount = '';
        console.log(`[onWithdrawButton/withdraw/finish]: Updated!`);
      });
    });
  };

  const fetchDataForToken = (address) => {
    return getTokenDataFromBalances(address, [$balancesStore]);
  };

  const useBigNumberForInput = (inputValue) => {
    if (inputValue === 0 || inputValue === '') {
      return BigNumber.from(0);
    }

    return utils.parseEther(`${inputValue}`);
  };

  const checkButtonState = (inputBN, maxBalance, balanceDecimals) => {
    const _balance = utils.parseEther(utils.formatUnits(maxBalance, balanceDecimals));

    return inputBN.gt(BigNumber.from(0)) && _balance.gte(inputBN);
  };

  let inputDepositAmount = 0;
  let inputWithdrawAmount = 0;
  let inputClaimAmount = 0;

  $: synthTokenData = fetchDataForToken(transmuterData.synthAddress);
  $: underlyingTokenData = fetchDataForToken(transmuterData.underlyingTokenAddress);

  $: inputDepositBN = useBigNumberForInput(inputDepositAmount);
  $: inputWithdrawBN = useBigNumberForInput(inputWithdrawAmount);
  $: inputClaimBN = useBigNumberForInput(inputClaimAmount);
</script>

{#if transmuterData}
  <div
    class="flex flex-col lg:flex-row justify-evenly gap-4 border-b {$settings.invertColors
      ? 'border-grey10inverse'
      : 'border-grey10'}"
  >
    <div
      class="p-4 flex flex-col space-y-4 w-full rounded {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}"
    >
      <label for="depositInput" class="text-sm text-lightgrey10">
        {$_('available')}: {utils.formatUnits(synthTokenData.balance, synthTokenData.decimals)}
        {synthTokenData.symbol}
      </label>
      <div
        class="flex rounded border {$settings.invertColors
          ? 'bg-grey3inverse border-grey3inverse'
          : 'bg-grey3 border-grey3'}"
      >
        <div class="w-full">
          <InputNumber
            id="depositInput"
            placeholder="~0.00 {synthTokenData.symbol}"
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
            on:clicked="{() =>
              (inputDepositAmount = utils.formatUnits(synthTokenData.balance, synthTokenData.decimals))}"
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
        disabled="{!checkButtonState(inputDepositBN, synthTokenData.balance, synthTokenData.decimals)}"
        on:clicked="{() => onDepositButton(synthTokenData.address, inputDepositBN, synthTokenData.decimals)}"
      />
    </div>
    <div
      class="p-4 flex flex-col space-y-4 w-full rounded {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}"
    >
      <label for="withdrawInput" class="text-sm text-lightgrey10">
        {$_('table.withdrawable')}: {utils.formatUnits(
          transmuterData.unexchangedBalanceBN,
          synthTokenData.decimals,
        )}
        {synthTokenData.symbol}
      </label>
      <div
        class="flex rounded border {$settings.invertColors
          ? 'bg-grey3inverse border-grey3inverse'
          : 'bg-grey3 border-grey3'}"
      >
        <div class="w-full">
          <InputNumber
            id="withdrawInput"
            placeholder="~0.00 {synthTokenData.symbol}"
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
            on:clicked="{() =>
              (inputWithdrawAmount = utils.formatUnits(
                transmuterData.unexchangedBalanceBN,
                synthTokenData.decimals,
              ))}"
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
        disabled="{!checkButtonState(
          inputWithdrawBN,
          transmuterData.unexchangedBalanceBN,
          synthTokenData.decimals,
        )}"
        on:clicked="{() =>
          onWithdrawButton(synthTokenData.address, inputWithdrawBN, synthTokenData.decimals)}"
      />
    </div>
    <div
      class="p-4 flex flex-col space-y-4 w-full rounded {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}"
    >
      <label for="claimInput" class="text-sm text-lightgrey10">
        {$_('expanded.transmuted')}
        : {utils.formatUnits(transmuterData.exchangedBalanceBN, underlyingTokenData.decimals)}
        {underlyingTokenData.symbol}
      </label>
      <div
        class="flex rounded border {$settings.invertColors
          ? 'bg-grey3inverse border-grey3inverse'
          : 'bg-grey3 border-grey3'}"
      >
        <div class="w-full">
          <InputNumber
            id="claimInput"
            placeholder="~0.00 {underlyingTokenData.symbol}"
            bind:value="{inputClaimAmount}"
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
            on:clicked="{() =>
              (inputClaimAmount = utils.formatUnits(
                transmuterData.exchangedBalanceBN,
                underlyingTokenData.decimals,
              ))}"
          />
          <Button
            label="CLEAR"
            width="w-max"
            fontSize="text-xs"
            textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
            backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
            borderSize="0"
            height="h-10"
            on:clicked="{() => (inputClaimAmount = '')}"
          />
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
        disabled="{!checkButtonState(
          inputClaimBN,
          transmuterData.exchangedBalanceBN,
          underlyingTokenData.decimals,
        )}"
        on:clicked="{() =>
          onClaimButton(underlyingTokenData.address, inputClaimBN, underlyingTokenData.decimals)}"
      />
    </div>
  </div>
{/if}
