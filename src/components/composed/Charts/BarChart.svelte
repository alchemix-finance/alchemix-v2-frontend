<script>
import Base from './Base.svelte';

export let className = '';
</script>

<div class="bg-grey10 px-16 py-8 rounded-md {className}">
  <Base {...$$props} type="bar" />
</div>
