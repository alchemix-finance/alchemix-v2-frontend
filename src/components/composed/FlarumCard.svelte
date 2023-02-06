<script>
  import settings from '@stores/settings';

  import Button from '@components/elements/Button.svelte';

  export let postData;

  const toDate = (dateString) => {
    return new Date(dateString).toLocaleDateString($settings.userLanguage.locale);
  };

  const openOnForum = (url) => {
    window.open(url, '_blank');
  };

  const titleRegEx = (title) => {
    return title.match(/\[.*?]/g)[0];
  };
</script>

<div
  class="border rounded w-full flex flex-col {$settings.invertColors
    ? 'bg-grey10inverse border-grey3inverse'
    : 'bg-grey10 border-grey3'}"
>
  <div class="flex flex-col p-2 mb-10 w-52 lg:w-full flex-1">
    <p class="mb-2 text-xs lg:text-base flex-1">{titleRegEx(postData.title)}</p>
    <div class="flex flex-row justify-between text-xs lg:text-sm">
      <p class="text-lightgrey5">Created:</p>
      <p>{toDate(postData.created)}</p>
    </div>
    <div class="flex flex-row justify-between text-xs lg:text-sm">
      <p class="text-lightgrey5">Last post:</p>
      <p>{toDate(postData.lastPost)}</p>
    </div>
    <div class="flex flex-row justify-between text-xs lg:text-sm">
      <p class="text-lightgrey5">Posts:</p>
      <p>{postData.posts}</p>
    </div>
  </div>

  <div class="w-full p-1">
    <Button
      label="Read {titleRegEx(postData.title)}"
      borderColor="green4"
      backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
      hoverColor="green4"
      height="h-8"
      borderSize="1"
      class="text-xs lg:text-md"
      on:clicked="{() => openOnForum(postData.url)}"
    />
  </div>
</div>
