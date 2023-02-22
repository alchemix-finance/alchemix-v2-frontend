<script lang="ts">
  import { sidebarSetup } from '@stores/sidebarSetup';
  import { _ } from 'svelte-i18n';
  import settings from '@stores/settings';
  import { routerGuard } from '@helpers/routerGuard';

  import { sentinelStore, networkStore } from '@stores/v2/alcxStore';

  import navigationStore, { updatePath } from '@stores/navigation';
  import Wallet from './Wallet.svelte';
</script>

<div class="lg:hidden flex flex-col w-full fixed bottom-0 z-10 bg-grey20">
  <div class="border-t border-grey30">
    <Wallet />
  </div>
  <div class="overflow-scroll flex flex-row justify-start border-t border-grey30 gap-2">
    {#each sidebarSetup()
      .filter((key) => key.label !== 'sentinel')
      .filter((key) => key.label !== 'Cows')
      .filter((key) => key.supportedChains.includes($networkStore)) as navbarItem}
      <button
        on:click="{() => updatePath(navbarItem.path, (pathname) => routerGuard(pathname))}"
        class="flex-col flex w-56 gap-1 items-center p-2 hover:bg-grey15 {$navigationStore.currentPathname ===
        navbarItem.path
          ? ' bg-grey30'
          : ''}"
      >
        <img
          src="./images/icons/{navbarItem.icon}"
          class="w-7 h-7 {$settings.invertColors ? 'invertIcons' : ''}"
          alt="{navbarItem.label}"
        />
        <span class="text-xs w-24">{$_(navbarItem.label)}</span>
      </button>
    {/each}

    {#each sidebarSetup()
      .filter((key) => key.label === 'sentinel')
      .filter((key) => key.supportedChains.includes($networkStore)) as navbarItem}
      {#if $sentinelStore}
        <button
          on:click="{() => updatePath(navbarItem.path, (pathname) => routerGuard(pathname))}"
          class="flex-col flex w-56 gap-1 items-center p-2 hover:bg-grey15 {$navigationStore.currentPathname ===
          navbarItem.path
            ? ' bg-grey30'
            : ''}"
        >
          <img
            src="./images/icons/{navbarItem.icon}"
            class="w-7 h-7 {$settings.invertColors ? 'invertIcons' : ''}"
            alt="{navbarItem.label}"
          />
          <span class="text-xs w-24">{$_(navbarItem.label)}</span>
        </button>
      {/if}
    {/each}
  </div>
</div>
