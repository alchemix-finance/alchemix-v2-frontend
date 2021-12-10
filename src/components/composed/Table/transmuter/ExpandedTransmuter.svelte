<script>
import { modal } from '../../../../stores/modal';
import { bind } from '../../../elements/Modal.svelte';
import Modal from '../../../elements/Modal.svelte';
import Button from '../../../elements/Button.svelte';
import BalanceQuickSelect from '../../../composed/BalanceQuickSelect.svelte';

export let transmuterConfig = {};

const showModal = () => {
  // modal.set(bind(Modal, { title: 'Web3', message: 'Transaction pending' }));
  modal.set(Modal);
};

const startTransaction = async () => {
  await alert('metamask tx started');
};
</script>

<div class="grid grid-cols-3 gap-8 pl-8 pr-4 py-4 border-b border-grey10">
  <div class="col-span-1 rounded bg-grey10 w-full flex flex-col">
    <p class="text-sm text-lightgrey10 self-start">Available</p>
    <div class="w-full self-center">
      <p>123,123.1234 alUSD</p>
    </div>
    <div class="w-full self-end">
      <BalanceQuickSelect />
      <Button label="Deposit" on:clicked="{showModal}" />
    </div>
  </div>

  <div class="col-span-1 rounded bg-grey10 w-full">
    <p class="text-sm text-lightgrey10">Deposited</p>
    <p>123,123.1234 alUSD</p>
    <BalanceQuickSelect />
    <Button label="Withdraw" on:clicked="{() => startTransaction()}" />
  </div>

  <div class="col-span-1 rounded bg-grey10 w-full flex flex-col justify-between">
    <div>
      <p class="text-sm text-lightgrey10">Transmuted</p>
      <p>123,123.1234 DAI</p>
    </div>
    <Button label="Claim" on:clicked="{() => startTransaction()}" />
  </div>
</div>
