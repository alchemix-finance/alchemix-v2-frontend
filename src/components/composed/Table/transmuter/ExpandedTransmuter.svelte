<script>
import Button from '../../../elements/Button.svelte';
import BalanceQuickSelect from '../../../composed/BalanceQuickSelect.svelte';
import account from '../../../../stores/account';
import walletBalance from '../../../../stores/walletBalance';
import getUserGas from '../../../../helpers/getUserGas';
import { getProvider } from '../../../../helpers/walletManager';
import {
  setPendingWallet,
  setPendingTx,
  setSuccessTx,
  setError,
} from '../../../../helpers/setToast';
import { ethers, utils } from 'ethers';
import { genericAbi } from '../../../../stores/externalContracts';

export let transmuterConfig = {};
export let alToken;
export let underlyingToken;
export let transmuterContract;
export let exchangedBalance;
export let unexchangedBalance;
export let alTokenContract;
export let allowance;
export let underlyingTokenSymbol;
export let alTokenSymbol;

let depositAmount;
let withdrawAmount;
let claimAmount;

// const
const gas = utils.parseUnits(getUserGas().toString(), 'gwei')
const provider = getProvider();
const alTokenData = $walletBalance.tokens.find((userToken) => userToken.symbol === alTokenSymbol);
let alTokenBalance
if (alTokenData) {
  alTokenBalance = alTokenData.balance
  console.log("ATB", alTokenBalance)
}
console.log("altokenbal", alTokenData)
const approve = async () => {
  const unlimitedAmount = ethers.constants.MaxUint256;
  try {
    let tx;
    setPendingWallet();
    tx = await alTokenContract.approve(transmuterContract.address, unlimitedAmount, {
      gasPrice: gas,
    });
    setPendingTx();
    await provider.once(tx.hash, (transaction) => {
      setSuccessTx(transaction.transactionHash);
    });
  } catch (e) {
    setError(e.message);
    console.log(e);
  }
};

const deposit = async () => {
  const amountToWei = utils.parseEther(depositAmount.toString());
  if (allowance < amountToWei) {
    await approve();
  }

  if (depositAmount > alTokenBalance) {
    setError('Trying to deposit more than available');
  } else {
    try {
      let tx;
      setPendingWallet();
      tx = await transmuterContract.deposit(amountToWei, $account.address, {
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
  if (withdrawAmount > unexchangedBalance) {
    setError('Trying to withdraw more than available');
  } else {
    try {
      let tx;
      setPendingWallet();
      tx = await transmuterContract.withdraw(amountToWei, $account.address, {
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
  const amountToWei = utils.parseEther(claimAmount.toString());
  if (claimAmount > exchangedBalance) {
    setError('Trying to claim more than available');
  } else {
    try {
      let tx;
      setPendingWallet();
      tx = await transmuterContract.claim(amountToWei, $account.address, {
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
}
const startTransaction = async () => {
  await alert('metamask tx started');
};
</script>

<div class="grid grid-cols-3 gap-8 pl-8 pr-4 py-4 border-b border-grey10">
  <div class="col-span-1 rounded bg-grey10 w-full flex flex-col justify-between">
    <p class="text-sm text-lightgrey10 self-start">Available</p>
    <p></p>
    <div class="w-full self-center">
      <p>{alTokenBalance} {alTokenSymbol}</p>
    </div>
    <input type="number" bind:value="{depositAmount}" />
    <div class="w-full self-end">
      <BalanceQuickSelect on:setInputValue="{setDepositValue}" />
      <Button label="Deposit" on:clicked="{() => deposit()}" />
    </div>
  </div>

  <div class="col-span-1 rounded bg-grey10 w-full flex flex-col justify-between">
    <p class="text-sm text-lightgrey10">Withdrawable</p>
    <p>{unexchangedBalance} {alTokenSymbol}</p>
    <input type="number" bind:value="{withdrawAmount}" />
    <BalanceQuickSelect on:setInputValue="{setWithdrawValue}" />
    <Button label="Withdraw" on:clicked="{() => withdraw()}" />
  </div>

  <div class="col-span-1 rounded bg-grey10 w-full flex flex-col justify-between">
    <p class="text-sm text-lightgrey10">Transmuted</p>
    <p>{exchangedBalance} {underlyingTokenSymbol}</p>
    <input type="number" bind:value="{claimAmount}" />
    <BalanceQuickSelect on:setInputValue="{setClaimValue}" />
    <Button label="Claim" on:clicked="{claim}" />
  </div>
</div>
