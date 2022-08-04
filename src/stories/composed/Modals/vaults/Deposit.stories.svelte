<script>
  import { utils, BigNumber } from 'ethers';
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import Deposit from '../../../../components/composed/Modals/vaults/Deposit.svelte';
  import LocaleWrapper from '../../../LocaleWrapper.svelte';
  import walletBalance from '../../../../stores/walletBalance';

  const props = {
    yieldToken: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
    underlyingToken: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    loanRatio: utils.parseUnits('2.0', 18),
    borrowLimit: BigNumber.from('148508682229694948963'),
    userDeposit: utils.parseUnits('99.005828484942579537', 18),
    underlyingDecimals: 18,
    yieldDecimals: 18,
    vaultIndex: 1,
  };

  walletBalance.set({
    tokens: [
      {
        address: '0xdA816459F1AB5631232FE5e97a05BBBb94970c95',
        symbol: 'yvDAI',
        balance: '1337.69',
      },
      {
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        symbol: 'DAI',
        balance: '31337.42',
      },
    ],
  });
</script>

<Meta
  title="Modals/Vault/Deposit"
  component="{Deposit}"
  argTypes="{{
    ...props,
  }}"
/>

<Template let:args>
  <LocaleWrapper>
    <Deposit {...args} />
  </LocaleWrapper>
</Template>

<Story id="DepositModal" name="Deposit" args="{{ ...props }}" />
