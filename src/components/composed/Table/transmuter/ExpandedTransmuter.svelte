<script>
import { slide } from 'svelte/transition';
import Button from '../../../elements/Button.svelte';
import walletBalance from '../../../../stores/walletBalance';
import tempTx from '../../../../stores/tempTx';
import getUserGas from '../../../../helpers/getUserGas';
import { setError } from '../../../../helpers/setToast';
import { utils } from 'ethers';

import InputNumber from '../../../elements/inputs/InputNumber.svelte';

export let alToken;
export let alTokenAllowance;
export let alTokenSymbol;
export let underlyingToken;
export let underlyingTokenSymbol;
export let exchangedBalance;
export let unexchangedBalance;
export let transmuter;
export let address;

let depositAmount;
let withdrawAmount;
let claimAmount;

// const
const format = utils.formatUnits;

const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
const alTokenData = $walletBalance.tokens.find((userToken) => userToken.address === alToken);
let alTokenBalance;
if (alTokenData) {
  alTokenBalance = alTokenData.balance;
  console.log('ATB', alTokenBalance);
}
console.log('altokenbal', alTokenData);

const deposit = () => {
  if (depositAmount > alTokenBalance) {
    setError('Trying to deposit more than available');
  } else {
    $tempTx.transmuter = transmuter;
    $tempTx.transmuterAddress = address;
    $tempTx.alTokenAllowance = alTokenAllowance;
    $tempTx.amountAlToken = depositAmount;
    $tempTx.alToken = alToken;
    $tempTx.method = 'deposit';
  }
};

const withdraw = async () => {
  if (withdrawAmount > unexchangedBalance) {
    setError('Trying to withdraw more than available');
  } else {
    $tempTx.transmuter = transmuter;
    $tempTx.underlyingToken = underlyingToken;
    $tempTx.amountUnderlying = withdrawAmount;
    $tempTx.method = 'withdraw';
  }
};

const claim = async () => {
  if (claimAmount > exchangedBalance) {
    setError('Trying to claim more than available');
  } else {
    $tempTx.transmuter = transmuter;
    $tempTx.underlyingToken = underlyingToken;
    $tempTx.amountUnderlying = claimAmount;
    $tempTx.method = 'claim';
  }
};

const setDepositValue = (event) => {
  // TODO if new value < 1 wei -> depositAmount = 1 wei
  depositAmount = (parseFloat(alTokenBalance) / 100) * event.detail.value;
};
const setWithdrawValue = (event) => {
  // TODO if new value < 1 wei -> withdrawAmount = 1 wei
  withdrawAmount = (parseFloat(unexchangedBalance) / 100) * event.detail.value;
};
const setClaimValue = (event) => {
  claimAmount = (parseFloat(exchangedBalance) / 100) * event.detail.value;
};

const setMaxDeposit = () => {
  depositAmount = alTokenBalance;
};
const setMaxWithdraw = () => {
  withdrawAmount = unexchangedBalance;
};
const setMaxClaim = () => {
  claimAmount = exchangedBalance;
};
const clearDeposit = () => {
  depositAmount = null;
};
const clearWithdraw = () => {
  withdrawAmount = null;
};
const clearClaim = () => {
  claimAmount = null;
};
const startTransaction = async () => {
  await alert('metamask tx started');
};
</script>

<div class="grid grid-cols-3 gap-8 pl-8 pr-4 py-4 border-b border-grey10" transition:slide>
  <div class="p-4 flex flex-col space-y-4">
    <label for="depositInput" class="text-sm text-lightgrey10">
      Available: {alTokenBalance}
      {alTokenSymbol}
    </label>
    <div class="flex bg-grey3 rounded border border-grey3">
      <div class="w-full">
        <InputNumber
          id="depositInput"
          placeholder="~0.00 {alTokenSymbol}"
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
      Withdrawable: {unexchangedBalance}
      {alTokenSymbol}
    </label>
    <div class="flex bg-grey3 rounded border border-grey3">
      <div class="w-full">
        <InputNumber
          id="withdrawInput"
          placeholder="~0.00 {alTokenSymbol}"
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
    <label for="claimInput" class="text-sm text-lightgrey10">
      Transmuted: {exchangedBalance}
      {underlyingTokenSymbol}
    </label>
    <div class="flex bg-grey3 rounded border border-grey3">
      <div class="w-full">
        <InputNumber
          id="claimInput"
          placeholder="~0.00 {underlyingTokenSymbol}"
          bind:value="{claimAmount}"
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
          on:clicked="{() => setMaxClaim()}"
        />
        <Button
          label="CLEAR"
          width="w-max"
          fontSize="text-xs"
          textColor="lightgrey10"
          backgroundColor="grey3"
          borderSize="0"
          height="h-10"
          on:clicked="{() => clearClaim()}"
        />
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
  <!-- <div class="col-span-1 rounded bg-grey10 w-full flex flex-col justify-between">
    <p class="text-sm text-lightgrey10 self-start">Available</p>
    <p></p>
    <div class="w-full self-center">
      <p>{alTokenBalance} {alTokenSymbol}</p>
    </div>
    <input class="my-2 p-2 text-md bg-grey3" type="number" bind:value="{depositAmount}" />
    <div class="w-full self-end">
      <BalanceQuickSelect on:setInputValue="{() => setDepositValue()}" />
      <Button label="Deposit" on:clicked="{() => deposit()}" />
    </div>
  </div>

  <div class="col-span-1 rounded bg-grey10 w-full flex flex-col justify-between">
    <p class="text-sm text-lightgrey10">Withdrawable</p>
    <p>{unexchangedBalance} {alTokenSymbol}</p>
    <input class="my-2 p-2 text-md bg-grey3" type="number" bind:value="{withdrawAmount}" />
    <BalanceQuickSelect on:setInputValue="{() => setWithdrawValue()}" />
    <Button label="Withdraw" on:clicked="{() => withdraw()}" />
  </div>

  <div class="col-span-1 rounded bg-grey10 w-full flex flex-col justify-between">
    <p class="text-sm text-lightgrey10">Transmuted</p>
    <p>{exchangedBalance} {underlyingTokenSymbol}</p>
    <input class="my-2 p-2 text-md bg-grey3" type="number" bind:value="{claimAmount}" />
    <BalanceQuickSelect on:setInputValue="{() => setClaimValue()}" />
    <Button label="Claim" on:clicked="{() => claim()}" />
  </div> -->
</div>
