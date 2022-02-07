<script>
  import * as jdenticon from 'jdenticon';

  export let hash;
  export let bgColor = 'red1';

  $: pfp = jdenticon.toSvg(hash || {}, 24);
</script>

<div class="flex flex-row relative">
  <div class="rounded-full overflow-hidden">
    {@html pfp}
  </div>
  <div
    class="absolute border-2 border-grey10 -bottom-0.5 -right-0.5 rounded-full w-2.5 h-2.5 bg-{bgColor}"
  ></div>
</div>
