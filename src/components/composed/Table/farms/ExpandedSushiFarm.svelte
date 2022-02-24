<script>
  import { _ } from 'svelte-i18n';
  import { slide } from 'svelte/transition';
  import { utils, BigNumber } from 'ethers';
  import { getExternalContract } from '@helpers/getContract';
  import getUserGas from '@helpers/getUserGas';
  import { getProvider } from '@helpers/walletManager';
  import {
    setPendingWallet,
    setPendingApproval,
    setPendingTx,
    setSuccessTx,
    setError,
  } from '@helpers/setToast';
  import account from '@stores/account';
  import Button from '@components/elements/Button.svelte';
  import InputNumber from '@components/elements/inputs/InputNumber.svelte';
  import { getTokenAllowance } from '@helpers/getTokenData';
  import setTokenAllowance from '@helpers/setTokenAllowance';
  import { erc20Contract, externalContractWrapper } from '@helpers/contractWrapper';
  import { signer } from '@stores/v2/derived';
  import { addressStore } from '@stores/v2/alcxStore';

  export let token;
  export let stakedBalance;
  export let unclaimedAlcx;
  export let unclaimedSushi;
  export let slpBalance;

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
      const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
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
      const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
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
      const gas = utils.parseUnits(getUserGas().toString(), 'gwei');

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

  // const claim = async () => {
  //   const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
  //   try {
  //     setPendingWallet();
  //     const tx = await mcv2contract.harvest(0, $account.address, {
  //       gasPrice: gas,
  //     });
  //     setPendingTx();
  //     await provider.once(tx.hash, (transaction) => {
  //       setSuccessTx(transaction.transactionHash);
  //     });
  //   } catch (e) {
  //     setError(e.message);
  //     console.debug(e);
  //   }
  // };

  // let depositAmount;
  // let withdrawAmount;
  //
  // const mcv2contract = getExternalContract('SushiMasterchefV2');
  // const provider = getProvider();
  //
  // const setMaxDeposit = () => {
  //   depositAmount = utils.formatEther(slpBalance);
  // };
  // const clearDeposit = () => {
  //   depositAmount = '';
  // };
  // const deposit = async () => {
  //   const depositToWei = utils.parseEther(depositAmount.toString());
  //   const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
  //   const allowance = await getTokenAllowance(
  //     token.address,
  //     $account.address,
  //     mcv2contract.address,
  //     depositToWei,
  //   );
  //   if (depositToWei.gt(slpBalance)) {
  //     setError($_('toast.error_deposit_amount'));
  //   } else {
  //     try {
  //       if (!allowance) {
  //         setPendingApproval();
  //         await setTokenAllowance(token.address, mcv2contract.address);
  //       }
  //       setPendingWallet();
  //       const tx = await mcv2contract.deposit(0, depositToWei, $account.address, {
  //         gasPrice: gas,
  //       });
  //       setPendingTx();
  //       await provider.once(tx.hash, (transaction) => {
  //         setSuccessTx(transaction.transactionHash);
  //       });
  //       clearDeposit();
  //     } catch (e) {
  //       setError(e.message);
  //       console.debug(e);
  //     }
  //   }
  // };

  // const setMaxWithdraw = () => {
  //   withdrawAmount = utils.formatEther(stakedBalance.amount);
  // };
  // const clearWithdraw = () => {
  //   withdrawAmount = '';
  // };
  // const withdraw = async () => {
  //   const withdrawToWei = utils.parseEther(withdrawAmount.toString());
  //   const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
  //   if (withdrawToWei.gt(stakedBalance.amount)) {
  //     setError($_('toast.error_withdraw_amount'));
  //   } else {
  //     try {
  //       setPendingWallet();
  //       const tx = await mcv2contract.withdrawAndHarvest(0, withdrawToWei, $account.address, {
  //         gasPrice: gas,
  //       });
  //       setPendingTx();
  //       await provider.once(tx.hash, (transaction) => {
  //         setSuccessTx(transaction.transactionHash);
  //       });
  //       clearWithdraw();
  //     } catch (e) {
  //       setError(e.message);
  //       console.debug(e);
  //     }
  //   }
  // };

  //$: canClaim =
  //  parseFloat(utils.formatEther(unclaimedAlcx)) + parseFloat(utils.formatEther(unclaimedSushi)) > 0;
  //$: canWithdraw =
  //  !!withdrawAmount && parseFloat(withdrawAmount) !== 0 && stakedBalance.amount.gt(BigNumber.from(0));
  //$: canDeposit = !!depositAmount && parseFloat(depositAmount) !== 0 && token.balance > 0;
  //$: unclaimedAlcxFormatted = Math.floor(parseFloat(utils.formatEther(unclaimedAlcx))).toFixed(4);
  //$: unclaimedSushiFormatted = Math.floor(parseFloat(utils.formatEther(unclaimedSushi))).toFixed(4);

  //utils.formatEther(farm.userDeposit.amount)
</script>

<div class="grid grid-cols-3 gap-8 pl-8 pr-4 py-4 border-b border-grey10" transition:slide|local>
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
      {$_('available')}: {utils.formatEther(farm.userDeposit.amount)}
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
          on:clicked="{() => (inputWithdrawAmount = utils.formatEther(farm.userDeposit.amount))}"
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
      disabled="{!checkButtonState(withdrawAmountBN, farm.userDeposit.amount)}"
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
