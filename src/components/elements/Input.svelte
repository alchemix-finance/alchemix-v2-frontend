<script>
import { onMount } from 'svelte';

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

export let inputFilter = (filter) => true;

let _value;
let _inputRef;

const events = ['input', 'keydown', 'keyup', 'mousedown', 'mouseup', 'select', 'contextmenu', 'drop'];

onMount(() => {
  const onEvent = () => {
    if (inputFilter(_inputRef.value)) {
      _inputRef.oldValue = _value;
      _inputRef.oldSelectionStart = _inputRef.selectionStart;
      _inputRef.oldSelectionEnd = _inputRef.selectionEnd;
    } else if (_inputRef.hasOwnProperty('oldValue')) {
      _value = _inputRef.oldValue;
      _inputRef.setSelectionRange(_inputRef.oldSelectionStart, _inputRef.oldSelectionEnd);
    } else {
      _value = '';
    }
  };

  events.forEach((event) => {
    _inputRef.addEventListener(event, onEvent);
  });

  return () => {
    events.forEach((event) => {
      _inputRef.removeEventListener(event, onEvent);
    });
  };
});

$: value = validator(_value ?? '')[0];
$: error = validator(_value ?? '')[1];
</script>

<input
  {...$$props}
  class="{$$props.class} {classModifier(value, error, _inputRef)}"
  bind:value="{_value}"
  bind:this="{_inputRef}"
/>
