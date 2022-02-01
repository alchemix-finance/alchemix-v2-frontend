<script>
import { onMount } from 'svelte';

export let value;
export let type = 'string';
export let inputFilter = (filter) => true;

let _value;
let _inputRef;

const events = ['input', 'keydown', 'keyup', 'mousedown', 'mouseup', 'select', 'contextmenu', 'drop'];

function onEvent() {
  if (inputFilter(this.value)) {
    this.oldValue = _value;
    this.oldSelectionStart = this.selectionStart;
    this.oldSelectionEnd = this.selectionEnd;
  } else if (this.hasOwnProperty('oldValue')) {
    if (this.oldSelectionStart && this.oldSelectionEnd)
      _inputRef.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
    _value = this.oldValue;
  } else {
    _value = '';
  }
}

onMount(() => {
  events.forEach((event) => {
    _inputRef.addEventListener(event, onEvent);
  });

  return () => {
    events.forEach((event) => {
      _inputRef.removeEventListener(event, onEvent);
    });
  };
});

$: value = (() => {
  switch (type) {
    case 'number':
      return Number(_value);
    default:
      return _value;
  }
})();
</script>

<input {...$$props} bind:value="{_value}" bind:this="{_inputRef}" />
