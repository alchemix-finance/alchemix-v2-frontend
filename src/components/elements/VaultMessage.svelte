<script>
  import Button from './Button.svelte';

  export let message = '';
  export let level = 0;
  export let linkTarget = '';
  export let linkLabel = '';

  const goTo = (url) => {
    window.open(url, '_blank');
  };

  const messageConfig = {
    0: {
      bgColor: 'blue1',
      borderColor: 'blue2',
      icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
    },
    1: {
      bgColor: 'orange1',
      borderColor: 'orange2',
      icon: 'M12 10.5v3.75m-9.303 3.376C1.83 19.126 2.914 21 4.645 21h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 4.88c-.866-1.501-3.032-1.501-3.898 0L2.697 17.626zM12 17.25h.007v.008H12v-.008z',
    },
    2: {
      bgColor: 'red1',
      borderColor: 'red3',
      icon: 'M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z',
    },
  };
</script>

<div
  class="flex flex-col space-y-4 p-2 pl-4 items-center w-full border text-grey15
    text-l rounded bg-{messageConfig[level].bgColor} border-{messageConfig[level].borderColor}"
>
  <div class="flex flex-row space-x-4">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-8 h-8"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="{messageConfig[level].icon}"></path>
    </svg>

    <p>{message}</p>
  </div>

  {#if linkTarget}
    <Button on:clicked="{() => goTo(linkTarget)}" label="{linkLabel}" py="py-2" class="w-full lg:w-max" />
  {/if}
</div>
