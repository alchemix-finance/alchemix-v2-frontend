<script>
import Input from '../Input.svelte';

import { floatFilter } from '../../../helpers/inputHelpers';
</script>

<Input {...$$props} inputFilter="{floatFilter}" />
