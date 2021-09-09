<script>
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import LocaleWrapper from '../LocaleWrapper.svelte';
import BalanceEntry from '../../components/elements/BalanceEntry.svelte';
</script>

<Meta title="Stats/Balance Entry" component="{BalanceEntry}" />

<Template let:args>
  <LocaleWrapper>
    <BalanceEntry {...args} />
  </LocaleWrapper>
</Template>

<Story
  name="Balance Entry"
  id="BalanceEntryStory"
  args="{{
    tokenSymbol: 'alUSD',
    tokenName: 'Alchemix USD',
    tokenBalance: '123456789012345678901234567890',
  }}"
/>
