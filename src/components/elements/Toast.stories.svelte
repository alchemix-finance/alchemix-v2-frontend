<script>
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import Toast from './Toast.svelte';
</script>

<Meta
  title="Elements/Toast"
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
