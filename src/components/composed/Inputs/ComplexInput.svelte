<script>
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { BigNumber, utils } from 'ethers';
  import Dropdown from '@components/elements/Dropdown.svelte';
  import InputNumber from '@components/elements/inputs/InputNumber.svelte';
  import Button from '@components/elements/Button.svelte';
  import settings from '@stores/settings';
  import { balancesStore } from '@stores/v2/alcxStore';
  import { getTokenDataFromBalancesBySymbol } from '@stores/v2/helpers';

  export let supportedTokens;
  export let inputValue;
  export let externalMax;

  export let selectedToken;
  let tokenIcon = '/images/token-icons/unknown.svg';

  $: tokenData = getTokenDataFromBalancesBySymbol(selectedToken, [$balancesStore]);
  $: tokenBalanceRaw = tokenData?.balance || BigNumber.from(0);
  $: tokenDecimals = tokenData?.decimals || 18;
  $: tokenBalance = utils.formatUnits(
    !!externalMax && tokenBalanceRaw.gt(externalMax) ? externalMax : tokenBalanceRaw,
    tokenDecimals,
  );

  const setMax = () => {
    inputValue =
      !!externalMax && tokenBalanceRaw.gt(externalMax) ? utils.formatEther(externalMax) : tokenBalance;
  };

  const clear = () => {
    inputValue = '';
  };

  const setToken = (token) => {
    if (token !== selectedToken) {
      selectedToken = token;
      clear();
    }
  };

  const getSource = async (filename) => {
    if (!!filename) {
      const xhr = new XMLHttpRequest();
      xhr.open('HEAD', `/images/token-icons/${filename}.svg`);
      xhr.responseType = 'blob';
      xhr.send();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 404) {
          if (xhr.response && xhr.response.type === 'image/svg+xml')
            tokenIcon = `/images/token-icons/${filename + '.svg'}`;
        }
      };
    }
  };

  $: selectedToken, getSource(selectedToken);

  onMount(() => {
    if (!!!selectedToken) setToken(supportedTokens[0]);
  });
</script>

<div
  class="relative flex flex-row w-full rounded border {$settings.invertColors
    ? 'border-grey3inverse bg-grey3inverse'
    : 'border-grey3 bg-grey3'}"
>
  <div class="flex items-center">
    <!--  token selector  -->
    <Dropdown>
      <div
        slot="label"
        class="flex flex-row space-x-4 items-center pl-4 {supportedTokens.length > 1
          ? 'pr-6'
          : 'pr-2'} py-4 rounded border {$settings.invertColors
          ? 'border-grey3inverse bg-grey3inverse'
          : 'border-grey3 bg-grey3'}"
      >
        <img src="{tokenIcon}" class="h-12 w-12" alt="Selected Token {selectedToken}" />
        {#if supportedTokens.length > 1}
          <p>▾</p>
        {/if}
      </div>
      <ul slot="options" class="w-full">
        {#if supportedTokens.length > 1}
          {#each supportedTokens as token}
            <li
              class="cursor-pointer h-8 border-t {$settings.invertColors
                ? 'hover:bg-grey10inverse border-grey10inverse'
                : 'hover:bg-grey10 border-grey10'}"
              on:click="{() => setToken(token)}"
            >
              <p class="text-center text-opacity-50 hover:text-opacity-100 w-full">{token}</p>
            </li>
          {/each}
        {/if}
      </ul>
    </Dropdown>
  </div>
  <div
    class="flex justify-end rounded border w-full {$settings.invertColors
      ? 'border-grey3inverse bg-grey3inverse'
      : 'border-grey3 bg-grey3'}"
  >
    <div class="relative w-full">
      <!--   token balance   -->
      <p class="absolute text-sm p-2 left-2 pointer-events-none text-lightgrey10">
        {$_('balance')}:
        {tokenBalance}
        {selectedToken}
      </p>
      <!--   input field   -->
      <InputNumber
        bind:value="{inputValue}"
        placeholder="0.00"
        class="rounded appearance-none text-xl w-full text-right h-full p-4 {$settings.invertColors
          ? 'bg-grey3inverse'
          : 'bg-grey3'}"
      />
    </div>

    <!--   max/clear buttons   -->
    <div class="flex flex-col w-max">
      <Button
        label="{$_('max').toUpperCase()}"
        width="w-full"
        fontSize="text-xs"
        textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
        backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
        borderSize="0"
        height="h-10"
        on:clicked="{() => setMax()}"
      />
      <Button
        label="{$_('clear').toUpperCase()}"
        width="w-full"
        fontSize="text-xs"
        textColor="{$settings.invertColors ? 'lightgrey10inverse' : 'lightgrey10'}"
        backgroundColor="{$settings.invertColors ? 'grey3inverse' : 'grey3'}"
        borderSize="0"
        height="h-10"
        on:clicked="{() => clear()}"
      />
    </div>
  </div>
</div>
