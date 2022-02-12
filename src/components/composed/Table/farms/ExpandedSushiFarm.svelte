<script>
  import { slide } from 'svelte/transition';
  import { utils, BigNumber } from 'ethers';
  import { getExternalContract } from '@helpers/getContract';
  import getUserGas from '@helpers/getUserGas';
  import { getProvider } from '@helpers/walletManager';
  import { setPendingWallet, setPendingTx, setSuccessTx, setError } from '@helpers/setToast';
  import account from '@stores/account';
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
  const provider = getProvider();

  const setMaxDeposit = () => {
    depositAmount = utils.formatEther(slpBalance);
  };
  const clearDeposit = () => {
    depositAmount = '';
  };
  const deposit = async () => {
    const depositToWei = utils.parseEther(depositAmount.toString());
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    if (depositToWei.gt(slpBalance)) {
      setError('Trying to deposit more than available');
    } else {
      try {
        setPendingWallet();
        const tx = await mcv2contract.deposit(0, depositToWei, $account.address, {
          gasPrice: gas,
        });
        setPendingTx();
        await provider.once(tx.hash, (transaction) => {
          setSuccessTx(transaction.transactionHash);
        });
        clearDeposit();
      } catch (e) {
        setError(e.message);
        console.debug(e);
      }
    }
  };

  const setMaxWithdraw = () => {
    withdrawAmount = utils.formatEther(stakedBalance.amount);
  };
  const clearWithdraw = () => {
    withdrawAmount = '';
  };
  const withdraw = async () => {
    const withdrawToWei = utils.parseEther(withdrawAmount.toString());
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    if (withdrawToWei.gt(stakedBalance.amount)) {
      setError('Trying to withdraw more than available');
    } else {
      try {
        setPendingWallet();
        const tx = await mcv2contract.withdrawAndHarvest(0, withdrawToWei, $account.address, {
          gasPrice: gas,
        });
        setPendingTx();
        await provider.once(tx.hash, (transaction) => {
          setSuccessTx(transaction.transactionHash);
        });
        clearWithdraw();
      } catch (e) {
        setError(e.message);
        console.debug(e);
      }
    }
  };

  const claim = async () => {
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    try {
      setPendingWallet();
      const tx = await mcv2contract.harvest(0, $account.address, {
        gasPrice: gas,
      });
      setPendingTx();
      await provider.once(tx.hash, (transaction) => {
        setSuccessTx(transaction.transactionHash);
      });
    } catch (e) {
      setError(e.message);
      console.debug(e);
    }
  };

  $: canClaim =
    parseFloat(utils.formatEther(unclaimedAlcx)) + parseFloat(utils.formatEther(unclaimedSushi)) > 0;
  $: canWithdraw =
    !!withdrawAmount && parseFloat(withdrawAmount) !== 0 && stakedBalance.amount.gt(BigNumber.from(0));
  $: canDeposit = !!depositAmount && parseFloat(depositAmount) !== 0 && token.balance > 0;
  $: unclaimedAlcxFormatted = Math.floor(parseFloat(utils.formatEther(unclaimedAlcx))).toFixed(4);
  $: unclaimedSushiFormatted = Math.floor(parseFloat(utils.formatEther(unclaimedSushi))).toFixed(4);
</script>

<div class="grid grid-cols-3 gap-8 pl-8 pr-4 py-4 border-b border-grey10" transition:slide|local>
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
      disabled="{!canDeposit}"
      on:clicked="{() => deposit()}"
    />
  </div>

  <div class="p-4 flex flex-col space-y-4">
    <label for="withdrawInput" class="text-sm text-lightgrey10">
      Available: {stakedBalance.amount.toString()}
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
      disabled="{!canWithdraw}"
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
      disabled="{!canClaim}"
      on:clicked="{() => claim()}"
    />
  </div>
</div>
