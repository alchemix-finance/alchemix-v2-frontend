<script>
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import Toast from '../../components/elements/Toast.svelte';
</script>

<Meta
  title="Feedback/Toast"
  component="{Toast}"
  argTypes="{{
    closeOnMount: { control: 'boolean' },
    kind: { control: 'string' },
  }}"
/>

<Template let:args>
  <Toast {...args} />
</Template>

<Story name="Success" args="{{ closeOnMount: false }}" />
<Story name="Error" args="{{ kind: 'error', closeOnMount: false }}" />
