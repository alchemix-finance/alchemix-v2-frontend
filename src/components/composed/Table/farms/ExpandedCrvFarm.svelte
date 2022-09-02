<script>
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import { setError, setPendingApproval, setPendingTx, setPendingWallet } from '@helpers/setToast';
  import Button from '@components/elements/Button.svelte';
  import InputNumber from '@components/elements/inputs/InputNumber.svelte';
  import { erc20Contract, externalContractWrapper } from '@helpers/contractWrapper';
  import { signer } from '@stores/v2/derived';
  import getUserGas from '@helpers/getUserGas';
  import { addressStore } from '@stores/v2/alcxStore';

  export let farm;

  let inputDepositAmount = 0;
  let inputWithdrawAmount = 0;

  const checkButtonState = (inputAmount, balance) => {
    return inputAmount.gt(0) && balance.lte(inputAmount) && balance.gt(BigNumber.from(0));
  };

  const useBigNumberForInput = (inputValue) => {
    if (inputValue === 0 || inputValue === '') {
      return BigNumber.from(0);
    }

    return utils.parseEther(`${inputValue}`);
  };

  $: depositAmountBN = useBigNumberForInput(inputDepositAmount);
  $: withdrawAmountBN = useBigNumberForInput(inputWithdrawAmount);

  const deposit = async (inputAmount) => {
    try {
      const { instance: crvGaugeInstance, address: crvGaugeAddress } = await externalContractWrapper(
        'CurveGaugeDeposit',
        $signer,
        'ethereum',
      );
      const gas = utils.parseUnits(getUserGas().toString(), 'gwei');

      const lpTokenInstance = erc20Contract(farm.lpTokenAddress, signer);

      const allowance = await lpTokenInstance.allowanceOf($addressStore, crvGaugeAddress);

      if (allowance.lt(inputAmount)) {
        setPendingApproval();
        await lpTokenInstance.approve(crvGaugeAddress);
      }

      setPendingWallet();
      const tx = await crvGaugeInstance.deposit(inputAmount, { gasPrice: gas });
      setPendingTx();

      return await tx.wait().then(() => {});
    } catch (error) {
      setError(error.message, error);
      console.debug(error);
    }
  };

  const withdraw = async (inputAmount) => {
    try {
      const { instance: crvGaugeInstance, address: crvGaugeAddress } = await externalContractWrapper(
        'CurveGaugeDeposit',
        $signer,
        'ethereum',
      );
      const gas = utils.parseUnits(getUserGas().toString(), 'gwei');

      setPendingWallet();
      const tx = await crvGaugeInstance.withdraw(inputAmount, { gasPrice: gas });
      setPendingTx();

      return await tx.wait().then(() => {});
    } catch (error) {
      setError(error.message, error);
      console.debug(error);
    }
  };

  const claim = async () => {
    try {
      const { instance: crvGaugeInstance, address: crvGaugeAddress } = await externalContractWrapper(
        'CurveGaugeDeposit',
        $signer,
        'ethereum',
      );
      const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
      setPendingWallet();
      const tx = await crvGaugeInstance.claim_rewards($addressStore, $addressStore, {
        gasPrice: gas,
      });
      setPendingTx();

      return await tx.wait().then(() => {});
    } catch (error) {
      setError(error.message, error);
      console.debug(error);
    }
  };
</script>

<div class="grid grid-cols-3 gap-8 pl-8 pr-4 py-4">
  <div class="p-4 flex flex-col space-y-4">
    <label for="borrowInput" class="text-sm text-lightgrey10">
      {$_('available')}: {utils.formatEther(farm.tokenBalance)}
      {farm.tokenSymbol}
    </label>
    <div class="flex bg-grey3 rounded border border-grey3">
      <div class="w-full">
        <InputNumber
          id="borrowInput"
          placeholder="~0.00 {farm.tokenSymbol}"
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
          on:clicked="{() => (inputDepositAmount = utils.formatEther(farm.tokenBalance))}"
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
      disabled="{!checkButtonState(depositAmountBN, farm.tokenBalance)}"
      on:clicked="{() => deposit(depositAmountBN)}"
    />
  </div>

  <div class="p-4 flex flex-col space-y-4">
    <label for="withdrawInput" class="text-sm text-lightgrey10">
      {$_('available')}: {utils.formatEther(farm.userDeposit)}
      {farm.tokenSymbol}
    </label>
    <div class="flex bg-grey3 rounded border border-grey3">
      <div class="w-full">
        <InputNumber
          id="withdrawInput"
          placeholder="~0.00 {farm.tokenSymbol}"
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
          on:clicked="{() => (inputWithdrawAmount = utils.formatEther(farm.userDeposit))}"
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
      disabled="{!checkButtonState(withdrawAmountBN, farm.userDeposit)}"
      on:clicked="{() => withdraw(withdrawAmountBN)}"
    />
  </div>
  <div class="p-4 flex flex-col space-y-4">
    <label for="borrowInput" class="text-sm text-lightgrey10"> {$_('table.rewards')}: </label>
    <div class="flex bg-grey3 rounded border border-grey3">
      <div class="w-full flex flex-row">
        <div class="w-full rounded appearance-none text-xl text-right h-full py-3 px-14 bg-grey3">
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
      backgroundColor="black1"
      hoverColor="green4"
      height="h-12"
      fontSize="text-md"
      disabled="{!farm.userUnclaimed[0].gt(BigNumber.from(0)) ||
        !farm.userUnclaimed[1].gt(BigNumber.from(0))}"
      on:clicked="{() => claim()}"
    />
  </div>
</div>
