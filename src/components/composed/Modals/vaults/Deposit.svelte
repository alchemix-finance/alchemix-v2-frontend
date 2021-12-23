<script>
// yield token address
// deposit amount uint256
// recipient
import { onMount } from 'svelte';
import Button from '../../../elements/Button.svelte';
import BalanceQuickSelect from '../../../composed/BalanceQuickSelect';
import { getTokenBalance, getTokenSymbol } from '../../../../helpers/getTokenData';
import tempTx from '../../../../stores/tempTx';

export let yieldToken;
export let underlyingToken;

let yieldBalance;
let yieldSymbol;
let underlyingBalance;
let underlyingSymbol;

const mockSave = () => {
  console.log('ye');
  $tempTx.amount = 1;
  $tempTx.yieldToken = yieldToken;
  $tempTx.underlyingToken = underlyingToken;
  $tempTx.method = 'depositUnderlying';
};

onMount(async () => {
  yieldBalance = await getTokenBalance(yieldToken);
  yieldSymbol = await getTokenSymbol(yieldToken);
  underlyingBalance = await getTokenBalance(underlyingToken);
  underlyingSymbol = await getTokenSymbol(underlyingToken);
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
