<script>
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import LocaleWrapper from '../LocaleWrapper.svelte';
import GasCard from '../../components/elements/GasCard.svelte';
</script>

<Meta title="Stats/Gas Card" component="{GasCard}" />

<Template let:args>
  <LocaleWrapper>
    <GasCard {...args} />
  </LocaleWrapper>
</Template>

<Story
  name="Gas Card"
  id="GasCardStory"
  args="{{
    compactView: false,
    description: 'Standard',
    gasFee: {
      maxFeePerGas: 100,
      baseFeePerGas: 50,
      maxPriorityFeePerGas: 2,
    },
    cardColor: 'green2',
    isActive: true,
  }}"
/>
