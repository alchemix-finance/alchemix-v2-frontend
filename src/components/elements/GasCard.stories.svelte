<script>
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import GasCard from './GasCard.svelte';
</script>

<Meta title="Elements/GasCard" component="{GasCard}" />

<Template let:args>
  <GasCard {...args} />
</Template>

<Story name="GasCard" />
