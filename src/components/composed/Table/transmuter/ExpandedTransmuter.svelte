<script>
  import { _ } from 'svelte-i18n';
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
      setError($_('toast.error_deposit_amount'));
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
      setError($_('toast.error_withdraw_amount'));
    } else {
      $tempTx.transmuter = transmuter;
      $tempTx.underlyingToken = underlyingToken;
      $tempTx.amountUnderlying = withdrawAmount;
      $tempTx.method = 'withdraw';
    }
  };

  const claim = async () => {
    if (claimAmount > exchangedBalance) {
      setError($_('toast.error_claim_amount'));
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
    depositAmount = '';
  };
  const clearWithdraw = () => {
    withdrawAmount = '';
  };
  const clearClaim = () => {
    claimAmount = '';
  };
</script>

<div class="grid grid-cols-3 gap-8 pl-8 pr-4 py-4 border-b border-grey10" transition:slide|local>
  <div class="p-4 flex flex-col space-y-4">
    <label for="depositInput" class="text-sm text-lightgrey10">
      {$_('available')}: {alTokenBalance}
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
      label="{$_('actions.deposit')}"
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
      {$_('table.withdrawable')}: {unexchangedBalance}
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
      label="{$_('actions.withdraw')}"
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
      {$_('expanded.transmuted')}: {exchangedBalance}
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
      label="{$_('actions.claim')}"
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
