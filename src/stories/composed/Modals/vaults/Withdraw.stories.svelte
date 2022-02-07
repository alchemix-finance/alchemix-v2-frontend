<script>
import { utils, BigNumber } from 'ethers';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import Withdraw from '../../../../components/composed/Modals/vaults/Withdraw.svelte';
import LocaleWrapper from '../../../LocaleWrapper.svelte';
import walletBalance from '../../../../stores/walletBalance';

const props = {
  yieldToken: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
  underlyingToken: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  loanRatio: utils.parseUnits('2.0', 18),
  borrowLimit: BigNumber.from('148508682229694948963'),
  userShares: utils.parseUnits('99.005828484942579537', 18),
  openDebtAmount: BigNumber.from('148508682229694948963').div(2),
  openDebtSymbol: 'alUSD',
  underlyingPricePerShare: utils.parseUnits('1.010041545333956048', 18),
  yieldPricePerShare: utils.parseUnits('0.999999999999999999', 18),
  vaultIndex: 0,
  yieldDecimals: 18,
  underlyingDecimals: 18,
  aggregateBalance: BigNumber.from('299999877789581007481'),
};

walletBalance.set({
  tokens: [
    {
      address: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
      symbol: 'yvDAI',
      balance: '0.0',
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      balance: '99779.206860148661822247',
    },
  ],
});
</script>

<Meta
  title="Modals/Vault/Withdraw"
  component="{Withdraw}"
  argTypes="{{
    ...props,
  }}"
/>

<Template let:args>
  <LocaleWrapper>
    <Withdraw {...args} />
  </LocaleWrapper>
</Template>

<Story
  id="WithdrawModal"
  name="Withdraw"
  args="{{
    ...props,
  }}"
/>
