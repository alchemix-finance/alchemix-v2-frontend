<script>
import { _ } from 'svelte-i18n';
import Wallet from './Wallet.svelte';
import { routerGuard } from '../../helpers/routerGuard.js';
</script>

<div class="relative flex items-center justify-between">
  <p
    class="flex flex-1 uppercase tracking-wider font-medium text-xs opacity-30 mb-4"
  >
    {$_('wallet')}
  </p>
</div>
<Wallet />

<p class="uppercase tracking-wider font-medium text-xs opacity-30 my-4">
  {$_('navigation')}
</p>
<ul>
  <li class="mb-5 cursor-pointer" on:click="{() => routerGuard('accounts')}">
    <span>{$_('my')} {$_('account')}</span>
  </li>
  <li class="mb-5 cursor-pointer" on:click="{() => routerGuard('vaults')}">
    <span>{$_('vaults')}</span>
  </li>
  <li class="mb-5 cursor-pointer" on:click="{() => routerGuard('transmuter')}">
    <span>{$_('transmuter')}</span>
  </li>
  <li class="mb-5 cursor-pointer" on:click="{() => routerGuard('farms')}">
    <span>{$_('farms')}</span>
  </li>
  <li class="cursor-pointer" on:click="{() => routerGuard('governance')}">
    <span>{$_('governance')}</span>
  </li>
</ul>
