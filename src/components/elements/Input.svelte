<script>
export let value;
export let error;
export let validator = (val) => [val, undefined];

let _value;

$: value = validator(_value ?? '')[0];
$: error = validator(_value ?? '')[1];
</script>

<input {...$$props} bind:value="{_value}" />
