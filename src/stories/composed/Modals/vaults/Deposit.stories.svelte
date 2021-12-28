<script>
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import Deposit from '../../../../components/composed/Modals/vaults/Deposit.svelte';
import LocaleWrapper from '../../../LocaleWrapper.svelte';
import walletBalance from '../../../../stores/walletBalance';

const yieldToken = '0xdeadbeef';
const underlyingToken = '0xcafefeed';
const loanRatio = '0.5';
const borrowLimit = '0.0';
const userDeposit = '0.0';

walletBalance.set({
  tokens: [
    {
      address: '0xdeadbeef',
      symbol: 'yvDAI',
      balance: '1337',
    },
    {
      address: '0xcafefeed',
      symbol: 'DAI',
      balance: '31337',
    },
  ],
});
</script>

<Meta
  title="Modals/Vault"
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

<Story
  id="DepositModal"
  name="Deposit"
  args="{{ yieldToken, underlyingToken, loanRatio, borrowLimit, userDeposit }}"
/>
