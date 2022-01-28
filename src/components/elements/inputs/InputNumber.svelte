<script>
export let value;

import Input from '../Input.svelte';

import { floatFilter } from '../../../helpers/inputHelpers';
</script>

<Input {...$$props} bind:value inputFilter="{floatFilter}" />
