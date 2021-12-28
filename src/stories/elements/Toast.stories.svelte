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
    title: { control: 'string' },
    subTitle: { control: 'string' },
    showSpinner: { control: 'boolean' },
    showOpenButton: { control: 'boolean' },
    showCloseButton: { control: 'boolean' },
    closeTimeoutMs: { control: 'number' },
    forceCloseToast: { control: 'boolean' },
    isOpen: { control: 'boolean' },
  }}"
/>

<Template let:args>
  <Toast {...args} />
</Template>

<Story name="Success" args="{{ kind: 'success', closeOnMount: false }}" />
<Story name="Pending" args="{{ kind: 'pending', closeOnMount: false }}" />
<Story name="Error" args="{{ kind: 'error', closeOnMount: false }}" />
