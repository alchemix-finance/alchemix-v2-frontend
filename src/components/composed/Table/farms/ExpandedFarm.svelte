<script>
import { utils } from 'ethers';
import Button from '../../../elements/Button.svelte';
import BalanceQuickSelect from '../../../composed/BalanceQuickSelect.svelte';
import getContract from '../../../../helpers/getContract';
import getUserGas from '../../../../helpers/getUserGas';
import { getProvider } from '../../../../helpers/walletManager';
import { setPendingWallet, setPendingTx, setSuccessTx, setError } from '../../../../helpers/setToast';

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
  if (depositAmount > token.balance) {
    setError('Trying to deposit more than available');
  } else {
    try {
      let tx;
      setPendingWallet();
      tx = await contract.deposit(poolId, amountToWei, {
        gasPrice: getUserGas(),
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
  if (withdrawAmount > stakedBalance) {
    setError('Trying to withdraw more than available');
  } else {
    try {
      let tx;
      setPendingWallet();
      tx = await contract.withdraw(poolId, amountToWei, {
        gasPrice: getUserGas(),
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
  try {
    let tx;
    setPendingWallet();
    tx = await contract.claim(poolId, {
      gasPrice: getUserGas(),
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

const setWithdrawValue = (event) => {
  // TODO if new value < 1 wei -> withdrawAmount = 1 wei
  withdrawAmount = (parseFloat(stakedBalance) / 100) * event.detail.value;
};
</script>

<div class="grid grid-cols-3 gap-8 pl-8 pr-4 py-4 border-b border-grey10">
  <div class="col-span-1 rounded bg-grey10 w-full flex flex-col">
    <p class="text-sm text-lightgrey10 self-start">Available</p>
    <div class="w-full self-center">
      <p>{token.balance} {token.symbol}</p>
    </div>
    <div class="w-full self-end">
      <input type="number" placeholder="0.0" bind:value="{depositAmount}" />
      <BalanceQuickSelect on:setInputValue="{setDepositValue}" />
      <Button label="Stake" on:clicked="{() => deposit()}" />
    </div>
  </div>

  <div class="col-span-1 rounded bg-grey10 w-full">
    <p class="text-sm text-lightgrey10">Staked</p>
    <p>{stakedBalance} {token.symbol}</p>
    <input type="number" placeholder="0.0" bind:value="{withdrawAmount}" />
    <BalanceQuickSelect on:setInputValue="{setWithdrawValue}" />
    <Button label="Withdraw" on:clicked="{() => withdraw()}" />
  </div>

  <div class="col-span-1 rounded bg-grey10 w-full flex flex-col justify-between">
    <div>
      <p class="text-sm text-lightgrey10">Rewards</p>
      <p>{unclaimedRewards} {reward}</p>
    </div>
    <Button label="Claim" on:clicked="{() => claim()}" />
  </div>
</div>
