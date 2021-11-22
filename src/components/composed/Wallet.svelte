<script>
import { connect } from '../../helpers/walletManager';
import Button from '../elements/Button.svelte';
import BorderContainer from '../elements/BorderContainer.svelte';
import WalletBalance from './WalletBalance.svelte';
import AvatarWithIndicator from '../elements/AvatarWithIndicator.svelte';
import account from '../../stores/account';

/*
 * @dev returns ENS or truncates the long address string for better visuals
 * @param address the wallet address to truncate
 * @returns the formatted address
 * */
const resolveAddress = (address) => {
  return $account.ens || `${address.slice(0, 12)}...${address.slice(-11, -1)}`;
};

function openEtherscan() {
  window.open(`https://etherscan.io/address/${$account.address}`, '_blank');
}
</script>

<style>
.min-w-wallet {
  /*  prevent "connect wallet" button to wrap */
  min-width: 210px;
}
</style>

<div class="min-w-wallet">
  <BorderContainer>
    {#if $account.signer}
      <Button
        borderSize="1"
        label="{resolveAddress($account.address)}"
        uppercase="{true}"
        height="h-10"
        on:clicked="{openEtherscan}"
      >
        <div slot="leftSlot">
          <AvatarWithIndicator hash="{$account.address}" connected="{true}" />
        </div>
      </Button>
      <WalletBalance />
    {:else}
      <Button borderSize="1" label="Connect Wallet" uppercase="{true}" height="h-10" on:clicked="{connect}">
        <div slot="leftSlot">
          <AvatarWithIndicator />
        </div>
      </Button>
    {/if}
  </BorderContainer>
</div>
