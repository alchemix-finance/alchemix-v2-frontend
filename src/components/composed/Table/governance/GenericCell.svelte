<script>
  export let value;
  export let state;
</script>

<div class="{state === 'closed' ? 'opacity-50' : 'opacity-100'}">
  {value}
</div>
