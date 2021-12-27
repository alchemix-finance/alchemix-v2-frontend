<script>
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import Deposit from '../../../../components/composed/Modals/vaults/Deposit.svelte';
import LocaleWrapper from '../../../LocaleWrapper.svelte';
import walletBalance from '../../../../stores/walletBalance';

const yieldToken = '0xdeadbeef';
const underlyingToken = '0xcafefeed';

walletBalance.set({
  tokens: [
    {
      address: '0xdeadbeef',
      symbol: 'yield',
      balance: '1337',
    },
    {
      address: '0xcafefeed',
      symbol: 'under',
      balance: '31337',
    },
  ],
});
</script>

<Meta
  title="Modals/Vault/Deposit"
  component="{Deposit}"
  argTypes="{{
    yieldToken: { controls: 'string' },
    underlyingToken: { controls: 'string' },
  }}"
/>

<Template let:args>
  <LocaleWrapper>
    <Deposit {...args} />
  </LocaleWrapper>
</Template>

<Story name="Deposit Yield Token" args="{{ yieldToken }}" />
<Story name="Deposit Underlying Token" args="{{ underlyingToken }}" />
<Story name="Deposit Both Token" args="{{ yieldToken, underlyingToken }}" />
