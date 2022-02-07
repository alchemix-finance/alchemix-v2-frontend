<script>
  import { slide } from 'svelte/transition';
  import { utils } from 'ethers';
  import Button from '../../../elements/Button.svelte';
  import BalanceQuickSelect from '../../../composed/BalanceQuickSelect.svelte';
  import getContract from '../../../../helpers/getContract';
  import getUserGas from '../../../../helpers/getUserGas';
  import { getProvider } from '../../../../helpers/walletManager';
  import { setPendingWallet, setPendingTx, setSuccessTx, setError } from '../../../../helpers/setToast';
  import InputNumber from '../../../elements/inputs/InputNumber.svelte';

  export let poolId;
  export let token;
  export let stakedBalance;
  export let unclaimedRewards;
  export let reward;

  let depositAmount;
  let withdrawAmount;

  const contract = getContract('StakingPools');
  const provider = getProvider();

  const updateDepositAmount = (event) => {
    depositAmount = event.detail.value;
  };

  const deposit = async () => {
    const amountToWei = utils.parseEther(depositAmount.toString());
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    if (depositAmount > token.balance) {
      setError('Trying to deposit more than available');
    } else {
      try {
        let tx;
        setPendingWallet();
        tx = await contract.deposit(poolId, amountToWei, {
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
    }
  };

  const withdraw = async () => {
    const amountToWei = utils.parseEther(withdrawAmount.toString());
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    if (withdrawAmount > stakedBalance) {
      setError('Trying to withdraw more than available');
    } else {
      try {
        let tx;
        setPendingWallet();
        tx = await contract.withdraw(poolId, amountToWei, {
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
    }
  };

  const claim = async () => {
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    try {
      let tx;
      setPendingWallet();
      tx = await contract.claim(poolId, {
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

  const setDepositValue = (event) => {
    // TODO if new value < 1 wei -> depositAmount = 1 wei
    depositAmount = (parseFloat(token.balance) / 100) * event.detail.value;
  };

  const setMaxDeposit = () => {
    depositAmount = token.balance;
  };

  const clearDeposit = () => {
    depositAmount = '';
  };

  const setMaxWithdraw = () => {
    withdrawAmount = stakedBalance;
  };

  const clearWithdraw = () => {
    withdrawAmount = '';
  };

  const setWithdrawValue = (event) => {
    // TODO if new value < 1 wei -> withdrawAmount = 1 wei
    withdrawAmount = (parseFloat(stakedBalance) / 100) * event.detail.value;
  };

  console.log('TOKEN IN FARM', token);
</script>

<!-- NOTE -- the token object is not working at the moment so I had to put in placeholders for styling -->

<div class="grid grid-cols-3 gap-8 pl-8 pr-4 py-4 border-b border-grey10" transition:slide>
  <div class="p-4 flex flex-col space-y-4">
    <!-- <p class="text-sm text-lightgrey10 self-start">Available</p>
    <div class="w-full self-center">
      <p>{token.balance} {token.symbol}</p>
    </div> -->
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
      on:clicked="{() => deposit()}"
    />
  </div>
  <div class="p-4 flex flex-col space-y-4">
    <!-- <p class="text-sm text-lightgrey10 self-start">Available</p>
    <div class="w-full self-center">
      <p>{token.balance} {token.symbol}</p>
    </div> -->
    <label for="withdrawInput" class="text-sm text-lightgrey10">
      Available: {stakedBalance}
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
      on:clicked="{() => withdraw()}"
    />
  </div>
  <!-- old version for reference -->
  <!-- <div class="col-span-1 rounded bg-grey10 w-full">
    <p class="text-sm text-lightgrey10">Staked</p>
    <p>{stakedBalance} {token.symbol}</p>
    <input type="number" placeholder="0.0" bind:value="{withdrawAmount}" />
    <BalanceQuickSelect on:setInputValue="{setWithdrawValue}" />
    <Button label="Withdraw" on:clicked="{() => withdraw()}" />
  </div> -->
  <div class="p-4 flex flex-col space-y-4">
    <!-- <p class="text-sm text-lightgrey10 self-start">Available</p>
    <div class="w-full self-center">
      <p>{token.balance} {token.symbol}</p>
    </div> -->
    <label for="borrowInput" class="text-sm text-lightgrey10"> Rewards: </label>
    <div class="flex bg-grey3 rounded border border-grey3">
      <div class="w-full">
        <div class="w-full rounded appearance-none text-xl text-right h-full py-6 px-14 bg-grey3">
          {unclaimedRewards}
          {reward}
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
      on:clicked="{() => claim()}"
    />
  </div>
</div>
