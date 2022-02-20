<script>
  export let state;
</script>

<div class="flex flex-row space-x-2">
  <div
    class="rounded-full {state === 'closed' ? 'bg-red3 opacity-75' : 'bg-green4'} w-2 h-2 self-center"
  ></div>
  <p class="{state === 'closed' ? 'opacity-50' : 'opacity-100'}">{state}</p>
</div>
