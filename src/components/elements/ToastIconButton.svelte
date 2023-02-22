<script>
  export let icon;
  export let onClick;
</script>

<div
  class="rounded-full border border-darkgrey1 h-6 w-6 p-0.5 mr-3 flex justify-center items-center hover:cursor-pointer"
  on:click="{onClick}"
>
  <img src="./images/icons/{icon}.svg" alt="Open icon" class="w-3 h-3" />
</div>
