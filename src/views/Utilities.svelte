<script>
  import { _ } from 'svelte-i18n';
  import { BarLoader } from 'svelte-loading-spinners';

  import settings from '@stores/settings';

  import ViewContainer from '@components/elements/ViewContainer.svelte';
  import PageHeader from '@components/elements/PageHeader.svelte';
  import Button from '@components/elements/Button.svelte';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';

  $: embedStats = $settings.embedStats;

  const openStatsPage = () => {
    window.open('https://alchemix-stats.com/', '_blank');
  };
</script>

<ViewContainer>
  <div slot="head" class="flex justify-between">
    <PageHeader
      pageIcon="alcx_thin.svg"
      pageTitle="{$_('utilities_page.title')}"
      pageSubtitle="{$_('utilities_page.subtitle')}"
    />
  </div>
  <ContainerWithHeader>
    <div
      slot="header"
      class="py-4 px-6 text-sm flex flex-col gap-2 lg:gap-0 lg:flex-row lg:justify-between lg:items-center"
    >
      <p class="text-left">{$_('utilities_page.community_widget_title')}</p>
    </div>
    <div slot="body" class="overflow-x-auto lg:overflow-x-hidden p-4">
      <p class="text-center text-sm">{$_('utilities_page.community_widget_explainer')}</p>
      <div>
        <Button
          label="{$_('utilities_page.community_widget_button_open', { values: { page: 'Alchemix Stats' } })}"
          borderSize="1"
          height="h-8"
          class="w-full lg:w-max"
          fontSize="text-md"
          on:clicked="{() => openStatsPage()}"
        >
          <svg
            slot="leftSlot"
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
  </ContainerWithHeader>
</ViewContainer>
