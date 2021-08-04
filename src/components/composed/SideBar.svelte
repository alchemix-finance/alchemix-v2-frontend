<script>
import { Link } from 'svelte-routing';
import Wallet from './Wallet.svelte';
import { connect, disconnect } from '../../helpers/walletManager';
import account from '../../stores/account';
import { navigate } from 'svelte-routing';
import Dropdown from '../elements/Dropdown.svelte';

/*
 * @dev verifies that user is logged in before switching to a new page
 * @params path the URL to navigate to
 * */
const routerGuard = async (path) => {
  if (!$account.signer) {
    await connect().then(() => {
      navigate(`/${path}`, { replace: true });
    });
  } else {
    navigate(`/${path}`, { replace: true });
  }
};
</script>

<div class="relative flex items-center justify-between">
  <p
    class="flex flex-1 uppercase tracking-wider font-medium text-xs opacity-30 mb-4"
  >
    Wallet
  </p>
  <div class="flex right-0 absolute inset-y-0 ">
    <Dropdown>
      <p class="opacity-30 hover:opacity-100" slot="label">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          ></path>
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      </p>
      <ul slot="options" class="w-40">
        <li class="cursor-default h-8">
          <p class="text-center opacity-50">Settings</p>
        </li>
        <li class="cursor-default h-8 border-b border-t border-grey10">
          <p class="text-center opacity-50">Help</p>
        </li>
        <li
          class="cursor-pointer h-8 hover:bg-grey10"
          on:click="{$account.signer ? disconnect : connect}"
        >
          <p class="text-center">
            {$account.signer ? 'Disconnect' : 'Connect'}
          </p>
        </li>
      </ul>
    </Dropdown>
  </div>
</div>
<Wallet />

<p class="uppercase tracking-wider font-medium text-xs opacity-30 my-4">
  Navigation
</p>
<ul>
  <li class="mb-5 cursor-pointer" on:click="{() => routerGuard('accounts')}">
    <span>My Account</span>
  </li>
  <li class="mb-5 cursor-pointer" on:click="{() => routerGuard('vaults')}">
    <span>Vaults</span>
  </li>
  <li class="mb-5 cursor-pointer" on:click="{() => routerGuard('transmuter')}">
    <span>Transmuter</span>
  </li>
  <li class="mb-5 cursor-pointer" on:click="{() => routerGuard('farms')}">
    <span>Farms</span>
  </li>
  <li class="cursor-pointer" on:click="{() => routerGuard('governance')}">
    <span>Governance</span>
  </li>
</ul>
