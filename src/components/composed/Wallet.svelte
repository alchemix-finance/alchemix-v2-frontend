<script>
import { connect } from '../../helpers/walletManager';
import Button from '../elements/Button.svelte';
import BorderContainer from '../elements/BorderContainer.svelte';
import WalletBalance from './WalletBalance.svelte';
import AvatarWithIndicator from '../elements/AvatarWithIndicator.svelte';
import account from '../../stores/account';

/*
 * @dev truncates the long address string for better visuals
 * @param address the wallet address to truncate
 * @returns the truncated address
 * */
const truncateAddress = (address) => {
  return `${address.slice(0, 12)}...${address.slice(-11, -1)}`;
};
</script>

<BorderContainer>
  {#if $account.signer}
    <Button
      borderSize="1"
      label="{truncateAddress($account.address)}"
      uppercase="{true}"
      noHoverEffect="{true}"
      height="h-8"
    >
      <div slot="leftSlot">
        <AvatarWithIndicator hash="{$account.address}" connected="{true}" />
      </div>
    </Button>
    <WalletBalance />
  {:else}
    <Button
      borderSize="1"
      label="Connect Wallet"
      uppercase="{true}"
      height="h-8"
      on:clicked="{connect}"
    >
      <div slot="leftSlot">
        <AvatarWithIndicator />
      </div>
    </Button>
  {/if}
</BorderContainer>
