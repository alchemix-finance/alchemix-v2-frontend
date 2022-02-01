<script>
export let value;
import Input from '../Input.svelte';
import { floatFilter } from '../../../helpers/inputHelpers';

let _value;

$: value = parseFloat(_value) || '';
</script>

<Input {...$$props} bind:value="{_value}" inputFilter="{floatFilter}" />
