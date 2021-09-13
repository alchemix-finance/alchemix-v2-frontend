<script>
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import LocaleWrapper from '../LocaleWrapper.svelte';
import Dropdown from '../../components/elements/Dropdown.svelte';
</script>

<Meta title="Inputs/Dropdown" component="{Dropdown}" />

<Template let:args>
  <LocaleWrapper>
    <Dropdown {...args}>
      <div slot="label">
        <p>This is the label of the dropdown</p>
      </div>
      <div slot="options">
        <ul>
          <li>Option 1</li>
          <li>Option 2</li>
        </ul>
      </div>
    </Dropdown>
  </LocaleWrapper>
</Template>

<Story name="Dropdown On Hover" id="DropdownOnHover" />
