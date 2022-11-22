<script lang="ts">
  import { _ } from 'svelte-i18n';
  import * as jdenticon from 'jdenticon';

  import settings from '@stores/settings';
  import { utilities } from '@stores/utilities';

  import ViewContainer from '@components/elements/ViewContainer.svelte';
  import PageHeader from '@components/elements/PageHeader.svelte';
  import Button from '@components/elements/Button.svelte';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';

  $: embedStats = $settings.embedStats;

  const generateIdenticon = (hash: string) => {
    return jdenticon.toSvg(hash, 24);
  };

  const openPage = (url: string) => {
    window.open(url, '_blank');
  };
</script>

<ViewContainer>
  <div slot="head" class="flex justify-between">
    <PageHeader
      pageIcon="utilities_thin.svg"
      pageTitle="{$_('utilities_page.title')}"
      pageSubtitle="{$_('utilities_page.subtitle')}"
    />
  </div>
  <p class="text-center text-xs opacity-50 mb-6">{$_('utilities_page.community_widget_explainer')}</p>
  <div class="flex flex-row flex-wrap gap-4 w-full">
    {#each utilities as utility}
      <div class="border border-grey10 rounded bg-grey15 w-1/4">
        <p class="border-b border-grey10 px-4 py-2">{utility.label}</p>
        <div
          class="h-48 bg-cover"
          style="background-image: url('../images/screenshots/{utility.image}')"
        ></div>
        <div class="flex flex-row justify-between items-center px-4 py-2 border-t border-grey10">
          <div class="flex flex-row space-x-4">
            <div class="rounded-full overflow-hidden">
              {@html generateIdenticon(utility.author)}
            </div>
            <p>{utility.author}</p>
          </div>
          <Button
            on:clicked="{() => openPage(utility.url)}"
            label="{$_('utilities_page.community_widget_button_open')}"
            borderSize="1"
            height="h-8"
            class="w-full lg:w-max"
            fontSize="text-md"
            borderColor="bronze1"
          >
            <svg
              slot="rightSlot"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              ></path>
            </svg>
          </Button>
        </div>
      </div>
    {/each}
  </div>
</ViewContainer>
