<script>
import Button from '../elements/Button.svelte';
</script>

<input type="number" placeholder="0.0000" />

<div class="grid grid-cols-4 gap-2">
  <div class="col-span-1">
    <Button label="25%" />
  </div>
  <div class="col-span-1">
    <Button label="50%" />
  </div>
  <div class="col-span-1">
    <Button label="75%" />
  </div>
  <div class="col-span-1">
    <Button label="100%" />
  </div>
</div>
