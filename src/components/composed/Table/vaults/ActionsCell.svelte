<script>
  import { _ } from 'svelte-i18n';
  import Button from '@components/elements/Button.svelte';
  import Deposit from '@components/composed/Modals/vaults/Deposit.svelte';
  import Withdraw from '@components/composed/Modals/vaults/Withdraw.svelte';
  import settings from '@stores/settings';

  import { showModal } from '@stores/modal';

  export let borrowLimit;
  export let vault;

  const openDeposit = () =>
    showModal(Deposit, {
      vault,
      borrowLimit,
    });

  const openWithdraw = () =>
    showModal(Withdraw, {
      vault,
      borrowLimit,
    });
</script>

<div class="flex justify-between space-x-2">
  <Button
    label="{$_('actions.deposit')}"
    borderColor="green4"
    backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
    hoverColor="green4"
    on:clicked="{openDeposit}"
  />

  <Button
    label="{$_('actions.withdraw')}"
    borderColor="red4"
    backgroundColor="{$settings.invertColors ? 'red5' : 'red2'}"
    hoverColor="red3"
    solid="{false}"
    on:clicked="{openWithdraw}"
  />
</div>
