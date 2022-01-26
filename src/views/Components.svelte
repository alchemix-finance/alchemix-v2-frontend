<script>
/*
 * View to display all available element components
 * */
import ViewContainer from '../components/elements/ViewContainer.svelte';
import Button from '../components/elements/Button.svelte';
import BorderContainer from '../components/elements/BorderContainer.svelte';
import Toast from '../components/elements/Toast.svelte';
import CollateralPieChart from '../components/composed/CollateralPieChart.svelte';
import DebtCreditPieChart from '../components/composed/DebtCreditPieChart.svelte';
import Input from '../components/elements/Input.svelte';

import { inputErrorModifier, numericValidator, floatFilter } from '../helpers/inputHelpers';

let inputValue = '';
</script>

<ViewContainer>
  <div>
    {inputValue ?? ''}
    <Input bind:value="{inputValue}" placeholder="1" inputFilter="{floatFilter}" class="p-5 bg-black2" />

    <p class="">Labels</p>
    <h1>Container with border (non-styleable)</h1>
    <BorderContainer width="w-40">
      <span> This component will draw a rounded border around any content that exists in it's slot. </span>
      <br />
      <p>Multiple elements can be placed inside.</p>
    </BorderContainer>
    <hr />

    <h1>Buttons</h1>
    <p>Button with default values and a click listener</p>
    <Button on:clicked="{() => alert('clicked')}" />
    <p>Button with filled props and a click listener</p>
    <Button
      label="A very long custom label"
      borderColor="blue2"
      borderSize="2"
      hoverColor="blue1"
      textColor="red1"
      fontSize="text-lg"
      width="w-80"
      on:clicked="{() => alert('clicked second button')}"
    />
    <p>Disabled button</p>
    <Button
      borderColor="red1"
      backgroundColor="red1"
      disabled="{true}"
      on:clicked="{() => alert('impossible alert')}"
    />
    <p>Button with container</p>
    <BorderContainer>
      <Button />
    </BorderContainer>
    <hr />

    <p>Input Fields</p>

    <p>Input Groups</p>

    <Toast />
    <Toast kind="error" />

    <div class="flex">
      <div class="mr-4">
        <CollateralPieChart />
      </div>
      <div class="ml-4">
        <DebtCreditPieChart />
      </div>
    </div>
  </div>
</ViewContainer>
