<script>
import { onMount } from 'svelte';
import { utils } from 'ethers';
import ContainerWithHeader from '../../../elements/ContainerWithHeader.svelte';
import ToggleSwitch from '../../../elements/ToggleSwitch.svelte';
import Button from '../../../elements/Button.svelte';
import InputNumber from '../../../elements/inputs/InputNumber.svelte';
import Dropdown from '../../../elements/Dropdown.svelte';

let riskAccepted = false;
let token = 'alUSD';
let allowance;
let eoa;
let eoaValid = false;
let eoaVerified = false;
let showError = false;
let rng;

const setToken = (tokenName) => {
  token = tokenName;
};

const setRiskAccepted = (event) => {
  riskAccepted = event.detail.value;
};

const verifyAddress = (event) => {
  try {
    eoaValid = utils.getAddress(eoa);
    showError = false;
    eoaVerified = event.detail.value;
  } catch {
    eoaValid = false;
    showError = true;
    rng = Math.floor(Math.random() * 100000);
  }
};

const submitApproval = () => {
  alert('yeeeeet the baby');
};
</script>

<ContainerWithHeader>
  <div slot="header" class="p-4 text-sm flex justify-center">
    <p class="inline-block">Add Permissions for an EOA</p>
  </div>
  <div slot="body" class="p-4 flex flex-col space-y-4">
    <div class="w-full">
      <label class="text-lightgrey10 text-sm">Debt Token</label>
      <Dropdown>
        <div
          slot="label"
          class="h-20 px-3 py-1 flex items-center text-opacity-50 hover:text-opacity-100 select-none text-xl rounded overflow-hidden border border-lightgrey20 text-white2 bg-grey10 hover:bg-grey1"
        >
          <p class="mr-3 w-full text-center">{token}</p>
          <p>▾</p>
        </div>
        <ul class="w-full" slot="options">
          <li class="cursor-pointer h-14 px-3 py-1 hover:bg-grey10" on:click="{() => setToken('alUSD')}">
            <p class="text-center text-opacity-50 hover:text-opacity-100 h-14 w-full">alUSD</p>
          </li>
          <li class="cursor-pointer h-14 px-3 py-1 hover:bg-grey10" on:click="{() => setToken('alETH')}">
            <p class="text-center text-opacity-50 hover:text-opacity-100 h-14 w-full">alETH</p>
          </li>
        </ul>
      </Dropdown>
    </div>
    <div class="w-full">
      <label class="text-lightgrey10 text-sm">Target EOA</label>
      <div class="flex bg-grey3 rounded border {showError ? 'border-red3' : 'border-grey3'} mb-4">
        <div class="w-full">
          <input
            type="text"
            id="targetEoa"
            placeholder="0xdeadbeef"
            class="w-full rounded appearance-none text-xl text-right h-20 p-4 bg-grey3"
            bind:value="{eoa}"
          />
        </div>
      </div>
    </div>
    <div class="w-full">
      <label class="text-lightgrey10 text-sm">Allowance Amount (Leave empty for infinite allowance)</label>
      <div class="flex bg-grey3 rounded border border-grey3 mb-4">
        <div class="w-full">
          <InputNumber
            id="allowance"
            placeholder="0.00"
            bind:value="{allowance}"
            class="w-full rounded appearance-none text-xl text-right h-20 p-4 bg-grey3"
          />
        </div>
      </div>
    </div>
    <ToggleSwitch
      label="I understand the risk associated with manually adding token approvals for any EOA and have verified that all data is correct."
      on:toggleChange="{setRiskAccepted}"
    />
    <Button
      label="Approve Token Allowance"
      borderColor="green4"
      backgroundColor="black1"
      hoverColor="green4"
      height="h-12"
      fontSize="text-md"
      disabled="{!riskAccepted}"
      on:clicked="{() => submitApproval()}"
    />
  </div>
</ContainerWithHeader>
