<script>
import { onMount } from 'svelte';
export let value;
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
$: value = _value;
</script>

<input {...$$props} bind:value="{_value}" bind:this="{_inputRef}" />
