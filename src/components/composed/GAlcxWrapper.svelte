<script>
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';
  import settings from '@stores/settings';
  import FarmNameCell from '@components/composed/Table/farms/FarmNameCell.svelte';
  import InputNumber from '@components/elements/inputs/InputNumber';
  import ToggleSwitch from '@components/elements/ToggleSwitch';
  import Button from '@components/elements/Button';
  import { getData, getAllowance, setAllowance, stake, unstake } from '@stores/v2/wrapperActions';
  import { addressStore, balancesStore } from '@stores/v2/alcxStore';
  import { signer } from '@stores/v2/derived';
  import { utils, BigNumber } from 'ethers';
  import { getTokenDataFromBalancesBySymbol } from '@stores/v2/helpers';
  import { vaultsLoading } from '@stores/v2/loadingStores';
  import { BarLoader } from 'svelte-loading-spinners';
  import { fetchBalanceByAddress } from '@stores/v2/asyncMethods';

  let unwrap = false;
  let totalSupply = BigNumber.from(0);
  let exchangeRate = BigNumber.from(1);
  let allowanceAmount = BigNumber.from(0);
  let userInput = '';
  let alcxData;
  let galcxData;

  const switchMode = () => {
    userInput = '';
    unwrap = !unwrap;
  };

  const initStake = async () => {
    const userInputBN = utils.parseEther(userInput.toString());
    await stake(userInputBN, allowanceAmount, $signer).then(() => {
      Promise.all([
        fetchBalanceByAddress(alcxData.address, [$signer]),
        fetchBalanceByAddress(galcxData.address, [$signer]),
        refreshData(),
      ]);
    });
  };

  const initUnstake = async () => {
    const userInputBN = utils.parseEther(userInput.toString());
    await unstake(userInputBN, $signer).then(() => {
      Promise.all([
        fetchBalanceByAddress(alcxData.address, [$signer]),
        fetchBalanceByAddress(galcxData.address, [$signer]),
        refreshData(),
      ]);
    });
  };

  const setMax = () => {
    userInput = unwrap ? utils.formatEther(galcxData.balance) : utils.formatEther(alcxData.balance);
  };

  const refreshData = async () => {
    userInput = '';
    unwrap = false;
    alcxData = undefined;
    galcxData = undefined;
    await initData();
  };

  const initData = async () => {
    const data = await getData($signer);
    totalSupply = data.supply;
    exchangeRate = data.exchangeRate;
    allowanceAmount = (await getAllowance([$addressStore, $signer])).allowance;
    alcxData = getTokenDataFromBalancesBySymbol('ALCX', [$balancesStore]);
    galcxData = getTokenDataFromBalancesBySymbol(data.symbol, [$balancesStore]);
  };

  $: wrappedSupply = totalSupply.mul(exchangeRate).div(BigNumber.from(10).pow(18));
  $: projectedGalcx = () => {
    if (userInput !== '') {
      return utils.formatEther(
        utils.parseEther(userInput.toString()).mul(BigNumber.from(10).pow(18)).div(exchangeRate),
      );
    }
  };
  $: projectedAlcx = () => {
    if (userInput !== '') {
      return utils.formatEther(
        utils.parseEther(userInput.toString()).mul(exchangeRate).div(BigNumber.from(10).pow(18)),
      );
    }
  };
  $: if (!$vaultsLoading) {
    initData();
  }
</script>

<ContainerWithHeader canToggle="{true}" isVisible="{true}">
  <div slot="header" class="text-sm flex flex-row justify-between">
    <div class="flex flex-row items-center space-x-4">
      <p>Wrapper</p>
    </div>
  </div>
  <div slot="body" class="py-4 px-6 flex space-y-8 flex-col">
    {#if $vaultsLoading}
      <div class="flex justify-center my-4">
        <BarLoader color="#F5C59F" />
      </div>
    {:else}
      <div class="flex flex-row space-x-8">
        <div
          class="flex flex-col space-y-4 p-4 rounded border w-full {$settings.invertColors
            ? 'border-grey10inverse bg-grey10inverse'
            : 'border-grey10 bg-grey10'}"
        >
          <div class="flex flex-row justify-between">
            <label for="depositInput" class="text-sm text-lightgrey10">
              {$_('available')}
              {unwrap
                ? `${utils.formatEther(galcxData?.balance || 0)} ${galcxData?.symbol || ''}`
                : `${utils.formatEther(alcxData?.balance || 0)} ${alcxData?.symbol || ''}`}
            </label>

            <ToggleSwitch
              useColor="{false}"
              label="Wrap"
              secondLabel="Unwrap"
              on:toggleChange="{() => switchMode()}"
            />
          </div>
          <div class="relative flex flex-row w-full">
            <div
              class="flex justify-end rounded border w-full {$settings.invertColors
                ? 'border-grey3inverse bg-grey3inverse'
                : 'border-grey3 bg-grey3'}"
            >
              <InputNumber
                id="depositInput"
                bind:value="{userInput}"
                placeholder="~0.00 {unwrap ? 'gALCX' : 'ALCX'}"
                class=" rounded appearance-none text-xl w-full text-right h-full p-4 {$settings.invertColors
                  ? 'bg-grey3inverse'
                  : 'bg-grey3'}"
              />
              <div class="flex flex-col w-max">
                <Button
                  label="MAX"
                  width="w-full"
                  fontSize="text-xs"
                  textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
                  backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
                  borderSize="0"
                  height="h-10"
                  on:clicked="{() => setMax()}"
                />
                <Button
                  label="CLEAR"
                  width="w-full"
                  fontSize="text-xs"
                  textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
                  backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
                  borderSize="0"
                  height="h-10"
                  on:clicked="{() => (userInput = '')}"
                />
              </div>
            </div>
          </div>
          <div class="flex flex-row space-x-4 h-8">
            <div
              class="w-full rounded text-xl text-center flex p-4 {$settings.invertColors
                ? 'bg-grey3inverse'
                : 'bg-grey3'}"
            >
              <p class="self-center w-full text-sm text-lightgrey10 text-right">
                {unwrap
                  ? `${projectedAlcx() || 0} ${alcxData?.symbol}`
                  : `${projectedGalcx() || 0} ${galcxData?.symbol}`}
              </p>
            </div>
          </div>
          {#if unwrap}
            <Button
              borderColor="red4"
              backgroundColor="{$settings.invertColors ? 'red5' : 'red2'}"
              hoverColor="red3"
              height="h-12"
              label="{$_('unwrap')}"
              on:clicked="{() => initUnstake()}"
            />
          {:else}
            <Button
              borderColor="green4"
              backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
              hoverColor="green4"
              height="h-12"
              label="{$_('wrap')}"
              on:clicked="{() => initStake()}"
            />
          {/if}
        </div>
        <div class="flex flex-col space-y-4">
          <div
            class="rounded {$settings.invertColors
              ? 'border-grey10inverse bg-grey10inverse'
              : 'border-grey10 bg-grey10'} w-full p-4"
          >
            <p class="mb-4">A liquid ALCX wrapper for single-sided staking.</p>
            <p class="text-sm mb-2">
              Wrap your ALCX into gALCX and have your ALCX work for you in the single sided staking pool while
              staying in control over your gALCX.
            </p>
            <p class="text-sm">Autocompounding increases the amount of ALCX you can unwrap per gALCX.</p>
          </div>

          <div
            class="flex flex-row justify-between space-x-6 rounded {$settings.invertColors
              ? 'border-grey10inverse bg-grey10inverse'
              : 'border-grey10 bg-grey10'} w-full p-4"
          >
            <div class="flex-col">
              <div class="text-bronze3 mr-2 uppercase text-sm whitespace-nowrap">gALCX Token Supply</div>
              <div class="flex">
                <div class="flex mr-2">{utils.formatEther(totalSupply)}</div>
              </div>
            </div>
            <div class="flex-col">
              <div class="text-bronze3 mr-2 uppercase text-sm whitespace-nowrap">Wrapped ALCX</div>
              <div class="flex">
                <div class="flex mr-2">{utils.formatEther(wrappedSupply)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</ContainerWithHeader>
