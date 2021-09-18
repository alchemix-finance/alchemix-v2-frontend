<script>
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import LocaleWrapper from '../LocaleWrapper.svelte';
import DropdownOnClick from '../../components/elements/DropdownOnClick.svelte';
</script>

<Meta title="Inputs/Dropdown" component="{DropdownOnClick}" />

<Template let:args>
  <LocaleWrapper>
    <DropdownOnClick {...args} />
  </LocaleWrapper>
</Template>

<Story
  name="Dropdown On Click"
  id="DropdownOnClickStory"
  args="{{ options: [{ name: 'Option 1' }, { name: 'Option 2' }] }}"
/>
