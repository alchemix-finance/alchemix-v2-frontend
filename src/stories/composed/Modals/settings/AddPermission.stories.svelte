<script>
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import LocaleWrapper from '../../../LocaleWrapper.svelte';
import AddPermission from '../../../../components/composed/Modals/settings/AddPermission.svelte';
</script>

<Meta title="Modals/Settings/AddPermission" component="{AddPermission}" argTypes="{{}}" />

<Template let:args>
  <LocaleWrapper>
    <AddPermission {...args} />
  </LocaleWrapper>
</Template>

<Story id="AddPermissionModal" name="AddPermission" />
