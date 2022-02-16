<script>
  import { onDestroy, onMount } from 'svelte';
  import { globalHistory } from 'svelte-routing/src/history';
  import { _ } from 'svelte-i18n';
  import Wallet from './Wallet.svelte';
  import { routerGuard } from '@helpers/routerGuard';
  import { sentinelStore } from '@stores/v2/alcxStore';

  const sidebarSetup = [
    {
      label: 'my_account',
      path: 'accounts',
      icon: 'vault_thick.svg',
    },
    {
      label: 'vaults',
      path: 'vaults',
      icon: 'yield_thick.svg',
    },
    {
      label: 'transmuter',
      path: 'transmuter',
      icon: 'transmuter_thick.svg',
    },
    {
      label: 'farms',
      path: 'farms',
      icon: 'farm_thick.svg',
    },
    {
      label: 'governance',
      path: 'governance',
      icon: 'alcx_thick.svg',
    },
    {
      label: 'sentinel',
      path: 'sentinel',
      icon: 'sentinel_thick.svg',
    },
  ];

  let pathname = window.location.pathname;
  let unsub;

  onMount(() => {
    unsub = globalHistory.listen(({ location }) => {
      pathname = location.pathname;
    });
  });

  onDestroy(() => {
    unsub();
  });
</script>

<div class="relative flex items-center justify-between">
  <p class="flex flex-1 uppercase tracking-wider font-medium text-xs opacity-30 mb-4">
    {$_('wallet')}
  </p>
</div>
<Wallet />

<p class="uppercase tracking-wider font-medium text-xs opacity-30 my-4">
  {$_('navigation')}
</p>
<ul>
  {#each sidebarSetup.filter((key) => key.label !== 'sentinel') as sidebarItem}
    <li
      class="p-4 rounded-xl mb-5 cursor-pointer flex justify-between transition-opacity {pathname.slice(1) ===
      `${sidebarItem.path}`
        ? 'bg-grey10 opacity-100'
        : 'opacity-40'} hover:bg-grey10 hover:opacity-100"
      on:click="{() => routerGuard(sidebarItem.path)}"
    >
      <span>{$_(sidebarItem.label)}</span>
      <img src="images/icons/{sidebarItem.icon}" class="w-6 h-6" />
    </li>
  {/each}
  {#each sidebarSetup.filter((key) => key.label === 'sentinel') as sidebarItem}
    {#if $sentinelStore}
      <li
        class="p-4 rounded-xl mb-5 cursor-pointer flex justify-between transition-opacity {pathname.slice(
          1,
        ) === `${sidebarItem.path}`
          ? 'bg-grey10 opacity-100'
          : 'opacity-40'} hover:bg-grey10 hover:opacity-100"
        on:click="{() => routerGuard(sidebarItem.path)}"
      >
        <span>{$_(sidebarItem.label)}</span>
        <img src="images/icons/{sidebarItem.icon}" class="w-6 h-6" />
      </li>
    {/if}
  {/each}
</ul>
