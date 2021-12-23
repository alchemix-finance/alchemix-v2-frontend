<script>
// yield token address
// deposit amount uint256
// recipient
import { onMount } from 'svelte';
import Button from '../../../elements/Button.svelte';
import BalanceQuickSelect from '../../../composed/BalanceQuickSelect';
import tempTx from '../../../../stores/tempTx';
import walletBalance from '../../../../stores/walletBalance';
import getContract from '../../../../helpers/getContract';

export let yieldToken;
export let underlyingToken;

let yieldBalance;
let yieldSymbol;
let underlyingBalance;
let underlyingSymbol;

const mockSave = () => {
  console.log('depositing 1 underlying');
  $tempTx.amount = 1;
  $tempTx.yieldToken = yieldToken;
  $tempTx.underlyingToken = underlyingToken;
  $tempTx.method = 'depositUnderlying';
};

onMount(async () => {
  const contract = getContract('AlchemistV2');
  const activeToken = $walletBalance.tokens.find((token) => token.address === yieldToken);
  const activeUnderlying = $walletBalance.tokens.find((token) => token.address === underlyingToken);
  yieldBalance = activeToken.balance;
  yieldSymbol = activeToken.symbol;
  underlyingBalance = activeUnderlying.balance;
  underlyingSymbol = activeUnderlying.symbol;
  console.log(activeToken);
  console.log(activeUnderlying);
  console.log('is supported underlying', await contract.isSupportedUnderlyingToken(activeUnderlying.address));
});
</script>

you have {yieldBalance}
{yieldSymbol}
you have {underlyingBalance}
{underlyingSymbol}
Deposit Amount:
<input type="number" />
<BalanceQuickSelect />

<Button
  label="Deposit"
  borderColor="green4"
  backgroundColor="black1"
  hoverColor="green4"
  on:clicked="{() => mockSave()}"
/>
