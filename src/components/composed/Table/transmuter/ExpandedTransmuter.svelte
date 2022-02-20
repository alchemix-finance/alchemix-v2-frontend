<script>
  import { _ } from 'svelte-i18n';
  import { slide } from 'svelte/transition';
  import Button from '../../../elements/Button.svelte';
  import { BigNumber, utils } from 'ethers';
  import InputNumber from '../../../elements/inputs/InputNumber.svelte';
  import { getTokenDataFromBalances } from '@stores/v2/helpers';
  import { addressStore, balancesStore } from '@stores/v2/alcxStore';
  import { claim, deposit, withdraw } from '@stores/v2/transmuterActions';
  import { signer } from '@stores/v2/derived';
  import { fetchBalanceByAddress, fetchTransmuterBySelector } from '@stores/v2/asyncMethods';

  export let transmuterData;

  const onDepositButton = async (tokenAddress, amountToDeposit, tokenDecimals) => {
    const _fAmountToDeposit = utils.parseUnits(utils.formatEther(amountToDeposit), tokenDecimals);

    await deposit(tokenAddress, _fAmountToDeposit, transmuterData.contractSelector, [
      $signer,
      $addressStore,
    ]).then(() => {
      Promise.all([
        fetchBalanceByAddress(tokenAddress, [$signer]),
        fetchTransmuterBySelector(transmuterData.type, transmuterData.contractSelector, [
          $signer,
          $addressStore,
        ]),
      ]).then(() => {
        console.log(`[onDepositButton/deposit/finish]: Updated!`);
      });
    });
  };

  const onWithdrawButton = async (tokenAddress, amountToWithdraw, tokenDecimals) => {
    const _fAmountToWithdraw = utils.parseUnits(utils.formatEther(amountToWithdraw), tokenDecimals);

    await withdraw(_fAmountToWithdraw, transmuterData.contractSelector, [$signer, $addressStore]).then(() => {
      Promise.all([
        fetchBalanceByAddress(tokenAddress, [$signer]),
        fetchTransmuterBySelector(transmuterData.type, transmuterData.contractSelector, [
          $signer,
          $addressStore,
        ]),
      ]).then(() => {
        console.log(`[onWithdrawButton/withdraw/finish]: Updated!`);
      });
    });
  };

  const onClaimButton = async (tokenAddress, amountToClaim, tokenDecimals) => {
    const _fAmountToClaim = utils.parseUnits(utils.formatEther(amountToClaim), tokenDecimals);

    await claim(tokenAddress, _fAmountToClaim, transmuterData.contractSelector, [
      $signer,
      $addressStore,
    ]).then(() => {
      Promise.all([
        fetchBalanceByAddress(tokenAddress, [$signer]),
        fetchTransmuterBySelector(transmuterData.type, transmuterData.contractSelector, [
          $signer,
          $addressStore,
        ]),
      ]).then(() => {
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
  <div class="grid grid-cols-3 gap-8 pl-8 pr-4 py-4 border-b border-grey10" transition:slide>
    <div class="p-4 flex flex-col space-y-4">
      <label for="depositInput" class="text-sm text-lightgrey10">
        {$_('available')}: {utils.formatUnits(synthTokenData.balance, synthTokenData.decimals)}
        {synthTokenData.symbol}
      </label>
      <div class="flex bg-grey3 rounded border border-grey3">
        <div class="w-full">
          <InputNumber
            id="depositInput"
            placeholder="~0.00 {synthTokenData.symbol}"
            bind:value="{inputDepositAmount}"
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
            on:clicked="{() =>
              (inputDepositAmount = utils.formatUnits(synthTokenData.balance, synthTokenData.decimals))}"
          />
          <Button
            label="CLEAR"
            width="w-max"
            fontSize="text-xs"
            textColor="lightgrey10"
            backgroundColor="grey3"
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
        backgroundColor="black1"
        hoverColor="green4"
        height="h-12"
        fontSize="text-md"
        on:clicked="{() => onDepositButton(synthTokenData.address, inputDepositBN, synthTokenData.decimals)}"
      />
    </div>
    <div class="p-4 flex flex-col space-y-4">
      <label for="withdrawInput" class="text-sm text-lightgrey10">
        {$_('table.withdrawable')}: {utils.formatUnits(
          transmuterData.unexchangedBalanceBN,
          synthTokenData.decimals,
        )}
        {synthTokenData.symbol}
      </label>
      <div class="flex bg-grey3 rounded border border-grey3">
        <div class="w-full">
          <InputNumber
            id="withdrawInput"
            placeholder="~0.00 {synthTokenData.symbol}"
            bind:value="{inputWithdrawAmount}"
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
            textColor="lightgrey10"
            backgroundColor="grey3"
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
        backgroundColor="black1"
        hoverColor="green4"
        height="h-12"
        fontSize="text-md"
        on:clicked="{() =>
          onWithdrawButton(synthTokenData.address, inputWithdrawBN, synthTokenData.decimals)}"
      />
    </div>
    <div class="p-4 flex flex-col space-y-4">
      <label for="claimInput" class="text-sm text-lightgrey10">
        {$_('expanded.transmuted')}: {utils.formatUnits(
          transmuterData.exchangedBalanceBN,
          underlyingTokenData.decimals,
        )}
        {underlyingTokenData.symbol}
      </label>
      <div class="flex bg-grey3 rounded border border-grey3">
        <div class="w-full">
          <InputNumber
            id="claimInput"
            placeholder="~0.00 {underlyingTokenData.symbol}"
            bind:value="{inputClaimAmount}"
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
            textColor="lightgrey10"
            backgroundColor="grey3"
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
        backgroundColor="black1"
        hoverColor="green4"
        height="h-12"
        fontSize="text-md"
        on:clicked="{() =>
          onClaimButton(underlyingTokenData.address, inputClaimBN, underlyingTokenData.decimals)}"
      />
    </div>
  </div>
{/if}
