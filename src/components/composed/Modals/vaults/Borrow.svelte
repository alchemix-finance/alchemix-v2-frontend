<script>
// TODO if users have not deposited anything or maxDebt is 0, include a deposit input, craft a multitx

import { onMount } from 'svelte';
import { slide } from 'svelte/transition';
import { utils } from 'ethers';
import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
import Button from '../../../elements/Button.svelte';
import ToggleSwitch from '../../../elements/ToggleSwitch.svelte';
import tempTx from '../../../../stores/tempTx';

import InputNumber from '../../../elements/inputs/InputNumber.svelte';

export let debtToken;
export let maxDebt;
export let currentDebt;

let availableAmount;
let borrowAmount;
let exportAndTransfer = false;
let targetWallet;
let targetWalletValid = false;
let showError = false;
let rng;
let targetWalletVerified = false;
let canBorrow = false;

const setExportAndTransfer = (event) => {
  exportAndTransfer = event.detail.value;
};

const verifyAddress = (event) => {
  try {
    targetWalletValid = utils.getAddress(targetWallet);
    showError = false;
    targetWalletVerified = event.detail.value;
  } catch {
    targetWalletValid = false;
    showError = true;
    rng = Math.floor(Math.random() * 100000);
  }
};

const updateValues = () => {
  const canBorrowPreFlight = borrowAmount <= maxDebt - currentDebt && borrowAmount > 0;
  if (exportAndTransfer) {
    if (!targetWallet) {
      rng = Math.floor(Math.random() * 100000);
      targetWalletVerified = false;
    }
    canBorrow = targetWalletVerified && canBorrowPreFlight;
  } else {
    targetWalletVerified = false;
    canBorrow = canBorrowPreFlight;
  }
};

const clearBorrow = () => {
  borrowAmount = '';
};

const setMaxBorrow = () => {
  borrowAmount = availableAmount;
};

const clearTarget = () => {
  targetWallet = '';
  rng = '';
  showError = false;
};

const mint = () => {
  $tempTx.amountBorrow = borrowAmount;
  $tempTx.targetAddress = targetWallet;
  $tempTx.method = 'mint';
};

onMount(() => {
  availableAmount = maxDebt - currentDebt;
});

$: borrowAmount, updateValues();
$: exportAndTransfer, updateValues();
$: targetWallet, updateValues();
$: targetWalletVerified, updateValues();
</script>

<ContainerWithHeader>
  <div slot="header" class="p-4 text-sm flex justify-between">
    <p class="inline-block">Borrow {debtToken.symbol}</p>
  </div>
  <div slot="body" class="p-4 flex flex-col space-y-4">
    {#if availableAmount === 0 && maxDebt > 0}
      <p>All loans already taken :(</p>
    {:else if maxDebt === 0}
      <p>You a broke ass hoe, bitch :(</p>
    {:else}
      <label for="borrowInput" class="text-sm text-lightgrey10">
        Available: {availableAmount}
        {debtToken.symbol}
      </label>
      <div class="flex bg-grey3 rounded border border-grey3">
        <div class="w-full">
          <InputNumber
            id="borrowInput"
            placeholder="~0.00 {debtToken.symbol}"
            bind:value="{borrowAmount}"
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
            on:clicked="{() => setMaxBorrow()}"
          />
          <Button
            label="CLEAR"
            width="w-max"
            fontSize="text-xs"
            textColor="lightgrey10"
            backgroundColor="grey3"
            borderSize="0"
            height="h-10"
            on:clicked="{() => clearBorrow()}"
          />
        </div>
      </div>

      <ToggleSwitch
        label="Transfer {debtToken.symbol} loan to different wallet"
        on:toggleChange="{setExportAndTransfer}"
      />
      {#if exportAndTransfer}
        <div class="w-full" transition:slide>
          <label class="text-lightgrey10 text-sm sr-only"> Target Wallet </label>
          <div class="flex bg-grey3 rounded border {showError ? 'border-red3' : 'border-grey3'} mb-4">
            <div class="w-full">
              <input
                type="text"
                id="targetWallet"
                placeholder="0xdeadbeef"
                class="w-full rounded appearance-none text-xl text-right h-20 p-4 bg-grey3"
                bind:value="{targetWallet}"
              />
            </div>
            <Button
              label="CLEAR"
              width="w-max"
              fontSize="text-xs"
              textColor="lightgrey10"
              backgroundColor="grey3"
              borderSize="0"
              on:clicked="{() => clearTarget()}"
            />
          </div>
          {#if showError}
            <p transition:slide class="text-red3 text-center text-sm mb-4">
              The provided address is not correct. Please check the input.
            </p>
          {/if}
          <ToggleSwitch
            label="I have verified the above address to be the correct recipient of my {debtToken.symbol} loan"
            on:toggleChange="{verifyAddress}"
            forceState="{rng}"
          />
        </div>
      {/if}
      <Button
        label="{exportAndTransfer ? 'Borrow and Transfer' : 'Borrow'}"
        borderSize="1"
        borderColor="green4"
        backgroundColor="black1"
        hoverColor="green4"
        height="h-12"
        fontSize="text-md"
        disabled="{!canBorrow}"
        on:clicked="{() => mint()}"
      />
    {/if}
  </div>
</ContainerWithHeader>
