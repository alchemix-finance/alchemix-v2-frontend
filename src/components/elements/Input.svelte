<script>
import { createEventDispatcher } from 'svelte';

export let value;
export let error;
export let validator = (val) => [val, undefined];

const dispatch = createEventDispatcher();

let _value;
let _inputRef;

$: value = validator(_value ?? '')[0];
$: error = validator(_value ?? '')[1];

$: value,
  error,
  dispatch('update', {
    value: value,
    error: error,
    node: _inputRef,
  });
</script>

<input {...$$props} bind:value="{_value}" bind:this="{_inputRef}" />
