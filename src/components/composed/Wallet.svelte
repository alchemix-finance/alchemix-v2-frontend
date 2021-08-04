<script>
import Button from '../elements/Button.svelte';
import BorderContainer from '../elements/BorderContainer.svelte';
import WalletBalance from './WalletBalance.svelte';
import account from '../../stores/account';
import * as jdenticon from 'jdenticon';
import { connect } from '../../helpers/walletManager';

$: icon = $account.signer ? jdenticon.toSvg($account.address, 16) : '';

/*
 * @dev truncates the long address string for better visuals
 * @param address the wallet address to truncate
 * @returns the truncated address
 * */
const truncateAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(-5, -1)}`;
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
    />
    <WalletBalance />
  {:else}
    <Button
      borderSize="1"
      label="Connect Wallet"
      uppercase="{true}"
      height="h-8"
      on:clicked="{connect}"
    />
  {/if}
</BorderContainer>
