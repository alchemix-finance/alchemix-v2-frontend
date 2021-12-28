<script>
import Button from '../../../elements/Button.svelte';
import BalanceQuickSelect from '../../../composed/BalanceQuickSelect.svelte';
import account from '../../../../stores/account';
import { genericAbi } from '../../../../stores/externalContracts';
import getUserGas from '../../../../helpers/getUserGas';
import getContract from '../../../../helpers/getContract';
import { getProvider } from '../../../../helpers/walletManager';
import { setPendingWallet, setPendingTx, setSuccessTx, setError } from '../../../../helpers/setToast';
import { ethers, providers, utils } from 'ethers';




export let transmuterConfig = {};
export let alToken;
export let underlyingToken;
export let transmuterContract;
export let exchangedBalance;
export let unexchangedBalance;
export let alTokenContract;
export let allowance;

let depositAmount;
let withdrawAmount;
let claimAmount;

const provider = getProvider();


const approve = async () => {
  const unlimitedAmount = ethers.constants.MaxUint256;
  try {
    let tx;
    setPendingWallet();
      tx = await alTokenContract.approve("0x530c3012E35893A248388177cCFF27C1cD349262", unlimitedAmount, {
        gasPrice: getUserGas(),
      });
      setPendingTx();
      await providers.once(tx.hash, (transaction) => {
        setSuccessTx(transaction.transactionHash);
      });
    } catch (e) {
      setError(e.message);
      console.debug(e);
    }
  }


const deposit = async () => {
  const amountToWei = utils.parseEther(depositAmount.toString());
  if (depositAmount > alToken.balance) {
    setError('Trying to deposit more than available');
  } else {
    try {
      let tx;
      setPendingWallet();
      tx = await transmuterContract.deposit(amountToWei, $account.address, {
        gasPrice: getUserGas(),
      });
      setPendingTx();
      await providers.once(tx.hash, (transaction) => {
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
  if (withdrawAmount > unexchangedBalance) {
    setError('Trying to withdraw more than available');
  } else {
    try {
      let tx;
      setPendingWallet();
      tx = await transmuterContract.withdraw(amountToWei, $account.address, {
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
  const amountToWei = utils.parseEther(claimAmount.toString());
  if (withdrawAmount > exchangedBalance) {
    setError('Trying to claim more than available');
  } else {
    try {
      let tx;
      setPendingWallet();
      tx = await transmuterContract.claim(amountToWei, $account.address, {
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


const startTransaction = async () => {
  await alert('metamask tx started');
};
</script>

<div class="grid grid-cols-3 gap-8 pl-8 pr-4 py-4 border-b border-grey10">
  <div class="col-span-1 rounded bg-grey10 w-full flex flex-col">
    <p class="text-sm text-lightgrey10 self-start">
      I have {underlyingToken.balance}
      {underlyingToken.symbol}.
    </p>
    <p></p>
    <div class="w-full self-center">
      <p>0 alUSD</p>
    </div>
    <div class="w-full self-end">
      <BalanceQuickSelect />
      {#if allowance < 1}
      <Button label="Approve" on:clicked="{approve}"/>
      {:else}
      <Button label="Deposit" on:clicked="{showModal}" />
      {/if}
    </div>
  </div>

  <div class="col-span-1 rounded bg-grey10 w-full">
    <p class="text-sm text-lightgrey10">Withdrawable</p>
    <p>150 alUSD</p>
    <BalanceQuickSelect />
    <Button label="Withdraw" on:clicked="{() => startTransaction()}" />
  </div>

  <div class="col-span-1 rounded bg-grey10 w-full flex flex-col justify-between">
    <p class="text-sm text-lightgrey10">Transmuted</p>
    <p>200 DAI</p>
    <BalanceQuickSelect />
    <Button label="Claim" on:clicked="{() => startTransaction()}" />
  </div>
</div>
