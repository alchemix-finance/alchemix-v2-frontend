<script>
export let value;
export let error;

/**
 * @dev default validator
 * @param {() => []} validator function
 */
export let validator = (val) => [val, undefined];
/**
 * @dev used to modify the element properties
 * @param value {any}
 * @param error {string}
 * @param node {HTMLElement}
 */
export let classModifier = (value, error, node) => '';

let _value;
let _inputRef;

$: value = validator(_value ?? '')[0];
$: error = validator(_value ?? '')[1];
</script>

<input
  {...$$props}
  class="{$$props.class} {classModifier(value, error, _inputRef)}"
  bind:value="{_value}"
  bind:this="{_inputRef}"
/>
