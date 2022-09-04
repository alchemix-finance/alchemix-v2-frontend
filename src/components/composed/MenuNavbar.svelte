<script lang="ts">
  import { sidebarSetup } from '@stores/sidebarSetup';
  import { _ } from 'svelte-i18n';
  import settings from '@stores/settings';
  import { routerGuard } from '@helpers/routerGuard';

  import navigationStore, { updatePath } from '@stores/navigation';
</script>

<div class="lg:hidden flex flex-col w-full fixed bottom-0 z-20 bg-grey20">
  <div class="border-t border-grey30">Network/Username/Thing</div>
  <div class="overflow-scroll flex flex-row justify-start border-t border-grey30 gap-2">
    {#each sidebarSetup() as navbarItem}
      <button
        on:click="{() => updatePath(navbarItem.path, (pathname) => routerGuard(pathname))}"
        class="flex-col flex w-56 gap-1 items-center p-2 hover:bg-grey15 {$navigationStore.currentPathname ===
        navbarItem.path
          ? ' bg-grey30'
          : ''}"
      >
        <img
          src="images/icons/{navbarItem.icon}"
          class="w-7 h-7 {$settings.invertColors ? 'invertIcons' : ''}"
          alt="{navbarItem.label}"
        />
        <span class="text-xs w-24">{$_(navbarItem.label)}</span>
      </button>
    {/each}
  </div>
</div>
