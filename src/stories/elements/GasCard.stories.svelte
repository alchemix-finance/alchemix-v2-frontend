<script>
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import LocaleWrapper from '../LocaleWrapper.svelte';
import GasCard from '../../components/elements/GasCard.svelte';
</script>

<Meta title="Elements/GasCard" component="{GasCard}" />

<Template let:args>
  <LocaleWrapper>
    <GasCard {...args} />
  </LocaleWrapper>
</Template>

<Story name="GasCard" />
