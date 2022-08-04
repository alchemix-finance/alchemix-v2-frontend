<script>
  import { _ } from 'svelte-i18n';
  import ViewContainer from '@components/elements/ViewContainer.svelte';
  import PageHeader from '@components/elements/PageHeader.svelte';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';
  import Button from '@components/elements/Button.svelte';
  import secret from '@stores/secret';

  const unlock = () => {
    if (!$secret.unlocked) {
      new Audio('sounds/secret.mp3').play();
      $secret.unlocked = true;
    }
  };
</script>

<ViewContainer>
  <div slot="head" class="flex justify-between">
    <PageHeader pageIcon="qmark.svg" pageTitle="Quo vadis?" pageSubtitle="{$_('error_page.subtitle')}" />
  </div>
  <ContainerWithHeader>
    <div slot="header" class="py-4 px-6 flex space-x-4">
      <p class="inline-block self-center">{$_('error_page.headline')}</p>
    </div>
    <div slot="body" class="py-4 px-6">
      <p class="mb-4">{$_('error_page.options_blurb')}:</p>
      <ul class="flex flex-col space-y-4">
        <li>{$_('error_page.manually')}: <code>{window.location.href}</code></li>
        <li>
          <Button label="{$_('error_page.go_back')}" width="w-max" on:clicked="{() => history.back()}">
            <svg
              slot="leftSlot"
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
            </svg>
          </Button>
        </li>
        <li>
          <Button label="{$_('error_page.unlock')}" width="w-max" on:clicked="{() => unlock()}">
            <svg
              slot="leftSlot"
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </Button>
        </li>
      </ul>
    </div>
  </ContainerWithHeader>
</ViewContainer>
