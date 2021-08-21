<script>
import Wallet from './Wallet.svelte';
import { routerGuard } from '../../helpers/routerGuard.js';
</script>

<div class="relative flex items-center justify-between">
  <p
    class="flex flex-1 uppercase tracking-wider font-medium text-xs opacity-30 mb-4"
  >
    Wallet
  </p>
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
