<script>
// yield token address
// deposit amount uint256
// recipient
import { onMount } from 'svelte';
import BorderContainer from '../../../elements/BorderContainer.svelte';
import Button from '../../../elements/Button.svelte';
import BalanceQuickSelect from '../../../composed/BalanceQuickSelect';
import tempTx from '../../../../stores/tempTx';
import walletBalance from '../../../../stores/walletBalance';
// import getContract from '../../../../helpers/getContract';

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

onMount(() => {
  // const contract = getContract('AlchemistV2_alUSD');
  if (yieldToken) {
    const activeToken = $walletBalance.tokens.find((token) => token.address === yieldToken);
    yieldBalance = activeToken.balance;
    yieldSymbol = activeToken.symbol;
    console.log(activeToken);
  }
  if (underlyingToken) {
    const activeUnderlying = $walletBalance.tokens.find((token) => token.address === underlyingToken);
    underlyingBalance = activeUnderlying.balance;
    underlyingSymbol = activeUnderlying.symbol;
    console.log(activeUnderlying);
  }
  // console.log('is supported underlying', await contract.isSupportedUnderlyingToken(activeUnderlying.address));
});
</script>

<p class="text-center">alToken Icon large and sexy</p>

<p>Yield | Underlying | Combo</p>

{#if yieldToken}
  you have {yieldBalance}
  {yieldSymbol}<br />
{/if}
{#if underlyingToken}
  you have {underlyingBalance}
  {underlyingSymbol}<br />
{/if}

Deposit Amount:<br />
{#if yieldToken && underlyingToken}
  <BorderContainer>
    <input type="number" />
    <BalanceQuickSelect />
  </BorderContainer>
  <BorderContainer>
    <input type="number" />
    <BalanceQuickSelect />
  </BorderContainer>
{:else if yieldToken || underlyingToken}
  <BorderContainer>
    <input type="number" />
    <BalanceQuickSelect />
  </BorderContainer>
{/if}
<p>Loan Ratio: r% (props)</p>
Deposit Balance: n -> n+deposit<br />
Borrow Limit: x -> x+(deposit*(deposit/100*r))<br />

<Button
  label="Deposit"
  borderColor="green4"
  backgroundColor="black1"
  hoverColor="green4"
  on:clicked="{() => mockSave()}"
/>
