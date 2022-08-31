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
</script>

<div
  class="relative border rounded w-full {$settings.invertColors
    ? 'bg-grey10inverse border-grey3inverse'
    : 'bg-grey10 border-grey3'}"
>
  <div class="flex flex-col p-2 mb-10">
    <p class="mb-2">{postData.title.slice(8)}</p>
    <div class="flex flex-row justify-between text-sm">
      <p class="text-lightgrey5">Created:</p>
      <p>{toDate(postData.created)}</p>
    </div>
    <div class="flex flex-row justify-between text-sm">
      <p class="text-lightgrey5">Last post:</p>
      <p>{toDate(postData.lastPost)}</p>
    </div>
    <div class="flex flex-row justify-between text-sm">
      <p class="text-lightgrey5">Posts:</p>
      <p>{postData.posts}</p>
    </div>
  </div>

  <div class="w-full p-2 absolute bottom-0">
    <Button
      label="Read {postData.title.slice(0, 8)}"
      borderColor="green4"
      backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
      hoverColor="green4"
      height="h-8"
      borderSize="1"
      fontSize="text-md"
      on:clicked="{() => openOnForum(postData.url)}"
    />
  </div>
</div>
