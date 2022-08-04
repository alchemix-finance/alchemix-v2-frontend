<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import ToggleSwitch from '../../components/elements/ToggleSwitch.svelte';
</script>

<Meta
  title="Inputs/Toggle"
  component="{ToggleSwitch}"
  argTypes="{{
    label: { control: 'string' },
  }}"
/>

<Template let:args>
  <ToggleSwitch {...args} />
</Template>

<Story name="Switch with Label" id="SwitchLabel" args="{{ label: 'Toggle Me' }}" />
<Story name="Switch without Label" id="SwitchNoLabel" />
