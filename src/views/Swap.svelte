<script>
  import { slide } from 'svelte/transition';
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import ViewContainer from '@components/elements/ViewContainer.svelte';
  import PageHeader from '@components/elements/PageHeader.svelte';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';
  import Button from '@components/elements/Button.svelte';
  import { getQuote, getStatus } from '@middleware/liFi';
  import { bridge, toCanonical } from '@helpers/multichain';
  import { BarLoader } from 'svelte-loading-spinners';
  import { addressStore, balancesStore, networkStore } from '@stores/v2/alcxStore';
  import { signer } from '@stores/v2/derived';
  import { getTokenDataFromBalancesBySymbol } from '@stores/v2/helpers';
  import InputNumber from '@components/elements/inputs/InputNumber.svelte';
  import { chainIds } from '@stores/v2/constants';
  import settings from '@stores/settings';
  import multichainPendingTx from '@stores/multichainStore';
  import Dropdown from '@components/elements/Dropdown.svelte';
  import { switchChain } from '@helpers/walletManager';

  const goTo = (url) => {
    window.open(url, '_blank');
  };

  const supportedTokens = {
    gALCX: {
      name: 'gALCX',
      address: {
        ethereum: '0x93Dede06AE3B5590aF1d4c111BC54C3f717E4b35',
        fantom: {
          bridge: '0x4CbA8902ce48AB1d5eEa1920D65faeDB934B9916',
          canonical: '0x70F9fd19f857411b089977E7916c05A0fc477Ac9',
        },
      },
      selector: 'CrossChainCanonicalGALCX',
    },
    alUSD: {
      name: 'alUSD',
      address: {
        ethereum: '0xbc6da0fe9ad5f3b0d58160288917aa56653660e9',
        fantom: {
          bridge: '0xe5130d3dbfac6ae7d73a24d719762df74d8e4c27',
          canonical: '0xB67FA6deFCe4042070Eb1ae1511Dcd6dcc6a532E',
        },
      },
      selector: 'CrossChainCanonicalAlchemicTokenV2_alUSD',
    },
  };

  let selectedToken = 'gALCX';
  let fetchingQuote = false;
  let quoteReceived = false;
  let bridgeAmount;
  let estimateOutAmount = '0.00';
  let bridgeFees = '0.00';
  let timer;
  let toChain = chainIds.filter((chain) => chain.id !== $networkStore)[0];
  $: tokenBalanceRaw =
    getTokenDataFromBalancesBySymbol(selectedToken, [$balancesStore])?.balance || BigNumber.from(0);
  $: tokenBalance = utils.formatEther(tokenBalanceRaw);
  let step = 0;
  let processing = false;
  let txData;
  let approvalTarget;
  let tool;
  let pendingTx = false;
  let bridgeToken = '';
  let statusTimer;
  let autoCheck = false;
  let bridgeReceived = false;

  const setToChain = (_id) => {
    clear();
    toChain = chainIds.filter((chain) => chain.id === _id)[0];
  };

  const setToken = (token) => {
    if (token !== selectedToken) {
      selectedToken = token;
      clear();
    }
  };

  const setMax = () => {
    bridgeAmount = tokenBalance;
  };

  const clear = () => {
    if (!processing) {
      step = 0;
      bridgeAmount = '';
      estimateOutAmount = '0.00';
      bridgeFees = '0.00';
      quoteReceived = false;
      bridgeToken = '';
    }
  };

  const debounce = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (bridgeAmount !== '' && !pendingTx) {
        _getQuote();
      }
    }, 750);
  };

  const statusPing = () => {
    clearTimeout(statusTimer);
    statusTimer = setTimeout(async () => {
      await getStatus(
        $multichainPendingTx.bridge,
        $multichainPendingTx.fromChain,
        $multichainPendingTx.toChain,
        $multichainPendingTx.txHash,
      ).then((response) => {
        if (response.status !== 'DONE') {
          statusPing();
        } else {
          bridgeReceived = true;
        }
      });
    }, 10000);
  };

  $: bridgeAmount, debounce();

  const _getQuote = async () => {
    fetchingQuote = true;
    const fromChain = chainIds.filter((chain) => chain.id === $networkStore)[0].legacyId;
    const amount = utils.parseEther(bridgeAmount.toString());
    const fromToken =
      fromChain === 1
        ? supportedTokens[selectedToken].address.ethereum
        : supportedTokens[selectedToken].address.fantom.bridge;
    const toToken =
      fromChain === 1
        ? supportedTokens[selectedToken].address.fantom.bridge
        : supportedTokens[selectedToken].address.ethereum;
    await getQuote(fromChain, toChain.legacyId, fromToken, toToken, amount.toString(), $addressStore)
      .then((_quote) => {
        quoteReceived = true;
        fetchingQuote = false;
        estimateOutAmount = utils.formatEther(BigNumber.from(_quote.estimate.toAmount));
        bridgeFees = utils.formatEther(BigNumber.from(_quote.includedSteps[0].estimate.feeCosts[0].amount));
        txData = _quote.transactionRequest;
        approvalTarget = _quote.estimate.approvalAddress;
        tool = _quote.tool;
        bridgeToken = toToken;
      })
      .catch((error) => {
        step = 0;
        fetchingQuote = false;
        console.error(error);
      });
  };

  const startBridge = async (txData) => {
    processing = true;
    step = 1;
    const fromChain = chainIds.filter((chain) => chain.id === $networkStore)[0].legacyId;
    const fromToken =
      fromChain === 1
        ? supportedTokens[selectedToken].address.ethereum
        : supportedTokens[selectedToken].address.fantom.bridge;
    await bridge(txData, fromToken, tokenBalanceRaw, approvalTarget, [$addressStore, $signer])
      .then((hash) => {
        $multichainPendingTx.bridge = tool;
        $multichainPendingTx.fromChain = fromChain;
        $multichainPendingTx.toChain = toChain.legacyId;
        $multichainPendingTx.txHash = hash;
        $multichainPendingTx.bridgeToken = bridgeToken;
        $multichainPendingTx.token = selectedToken;
        autoCheck = true;
        statusPing();
        step = 2;
      })
      .catch((error) => {
        step = 0;
        processing = false;
        console.error(error);
      });
  };

  const switchNetwork = async () => {
    await switchChain(chainIds.filter((chain) => chain.legacyId === $multichainPendingTx.toChain)[0].id)
      .then(() => {
        if (!bridgeReceived) step = 3;
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const swapToken = async () => {
    await toCanonical(
      $multichainPendingTx.bridgeToken,
      supportedTokens[$multichainPendingTx.token].selector,
      $multichainPendingTx.toChain,
      [$addressStore, $signer],
    )
      .then((txHash) => {
        console.log(txHash);
        step = 0;
        processing = false;
        txData = '';
        approvalTarget = '';
        tool = '';
        pendingTx = false;
        bridgeToken = '';
        autoCheck = false;
        bridgeReceived = false;
        $multichainPendingTx.txHash = undefined;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  $: onTargetNetwork =
    $multichainPendingTx.toChain === chainIds.filter((chain) => chain.id === $networkStore)[0].legacyId;
  $: if ($multichainPendingTx.bridge !== undefined && step === 0) pendingTx = true;
  $: if (pendingTx && !autoCheck) statusPing();
</script>

<ViewContainer>
  <div slot="head" class="flex justify-between">
    <PageHeader
      pageIcon="swap_med.svg"
      pageTitle="{$_('swap_page.title')}"
      pageSubtitle="{$_('swap_page.subtitle')}"
    />
  </div>

  <div class="w-full mb-8">
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 text-sm flex justify-between">
        <p class="inline-block self-center">{$_('transmuter_page.external_swaps')}</p>
      </div>
      <div slot="body" class="py-4 px-6 flex space-x-4">
        <Button on:clicked="{() => goTo('http://curve.fi')}" label="Curve" width="w-max" py="py-2">
          <img src="images/icons/crv.png" class="w-5 h-5" slot="leftSlot" />
        </Button>
        <Button on:clicked="{() => goTo('http://zapper.fi')}" label="Zapper" width="w-max" py="py-2">
          <img src="images/icons/zapper.png" class="w-5 h-5" slot="leftSlot" />
        </Button>
        <Button on:clicked="{() => goTo('http://paraswap.io')}" label="Paraswap" width="w-max" py="py-2">
          <img src="images/icons/paraswap.png" class="w-5 h-5" slot="leftSlot" />
        </Button>
      </div>
    </ContainerWithHeader>
  </div>

  <div class="w-full mb-8">
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 text-sm flex justify-between">
        <p class="inline-block self-center">{$_('swap_page.bridge')}</p>
      </div>
      <div slot="body" class="py-4 px-6 flex space-y-4 flex-col">
        {#if !pendingTx}
          <div
            class="relative flex flex-row w-full rounded border {$settings.invertColors
              ? 'border-grey3inverse bg-grey3inverse'
              : 'border-grey3 bg-grey3'}"
            transition:slide|local
          >
            <div class="flex items-center">
              <Dropdown>
                <div
                  slot="label"
                  class="flex flex-row space-x-4 items-center pl-4 pr-6 py-4 rounded border {$settings.invertColors
                    ? 'border-grey3inverse bg-grey3inverse'
                    : 'border-grey3 bg-grey3'}"
                >
                  <img src="/images/token-icons/{selectedToken}.svg" class="h-12 w-12" alt="Selected Token" />
                  <p>▾</p>
                </div>
                <ul slot="options" class="w-full">
                  {#each Object.entries(supportedTokens) as token}
                    <li
                      class="cursor-pointer h-8 border-t {$settings.invertColors
                        ? 'hover:bg-grey10inverse border-grey10inverse'
                        : 'hover:bg-grey10 border-grey10'}"
                      on:click="{() => setToken(token[1].name)}"
                    >
                      <p class="text-center text-opacity-50 hover:text-opacity-100 w-full">{token[1].name}</p>
                    </li>
                  {/each}
                </ul>
              </Dropdown>
            </div>

            <div
              class="flex justify-end rounded border w-full {$settings.invertColors
                ? 'border-grey3inverse bg-grey3inverse'
                : 'border-grey3 bg-grey3'}"
            >
              <div class="relative w-full">
                <p class="absolute text-sm p-2 left-2 pointer-events-none text-lightgrey10">
                  Available:
                  {tokenBalance}
                  {selectedToken}
                </p>
                <InputNumber
                  id="depositInput"
                  bind:value="{bridgeAmount}"
                  placeholder="0.00"
                  class=" rounded appearance-none text-xl w-full text-right h-full p-4 {$settings.invertColors
                    ? 'bg-grey3inverse'
                    : 'bg-grey3'}"
                />
              </div>
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
                  on:clicked="{() => clear()}"
                />
              </div>
            </div>
          </div>
          <div class="flex flex-row space-x-4 h-8" transition:slide|local>
            <p class="text-sm text-lightgrey10 min-w-max self-center">Target Network</p>
            <div
              on:click="{() => setToChain(toChain.legacyId === 1 ? '0xfa' : '0x1')}"
              class="rounded h-full w-max self-center flex flex-row items-center space-x-2 pl-2 pr-6 bg-{toChain.abiPath}"
            >
              <img src="/images/icons/{toChain.icon}.svg" alt="Network Icon" class="h-4" />
              <p>{toChain.abiPath.charAt(0).toUpperCase() + toChain.abiPath.slice(1)}</p>
            </div>
            <p class="pl-4 text-sm text-lightgrey10 min-w-max self-center">Bridge Fees</p>
            <div
              class="w-full rounded text-xl text-center flex p-4 {$settings.invertColors
                ? 'bg-grey3inverse'
                : 'bg-grey3'}"
            >
              <p class="self-center w-full text-sm text-lightgrey10 text-right">
                {bridgeFees}
                {selectedToken}
              </p>
            </div>
            <p class="pl-4 text-sm text-lightgrey10 min-w-max self-center">Receive</p>
            <div
              class="w-full rounded text-xl text-center flex p-4 {$settings.invertColors
                ? 'bg-grey3inverse'
                : 'bg-grey3'}"
            >
              <p class="self-center w-full text-sm text-lightgrey10 text-right">
                {estimateOutAmount}
                {selectedToken}
              </p>
            </div>
          </div>
        {/if}
        <div class="w-full flex flex-row space-x-4">
          <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}">
            <div class="w-full flex flex-row justify-between items-center">
              <p class="text-lg">Step 1: Bridge</p>
              {#if step > 1 || pendingTx}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#42B792"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  ></path>
                </svg>
              {/if}
            </div>
            <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
              Get a quote and send the desired token to Li.Fi's bridging service.
            </p>
            {#if processing || step > 1 || pendingTx}
              <div class="flex flex-row justify-center items-center h-12" transition:slide|local>
                <BarLoader
                  duration="{step === 1 ? '2.1s' : '0'}"
                  color="{step > 1 || pendingTx ? '#42B792' : $settings.invertColors ? '#6C93C7' : '#F5C59F'}"
                />
              </div>
            {:else if fetchingQuote}
              <div class="flex justify-center items-center my-4 h-12">
                <BarLoader color="{$settings.invertColors ? '#6C93C7' : '#F5C59F'}" />
              </div>
            {:else}
              <Button
                label="Bridge Token"
                disabled="{!quoteReceived}"
                borderColor="green4"
                backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
                hoverColor="green4"
                height="h-12"
                on:clicked="{() => startBridge(txData)}"
              />
            {/if}
          </div>

          <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}">
            <div class="w-full flex flex-row justify-between items-center">
              <p class="text-lg">Step 2: Wait</p>
              {#if step > 2 || bridgeReceived}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#42B792"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  ></path>
                </svg>
              {/if}
            </div>
            <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
              Wait patiently for the bridged token to appear in your wallet. This takes a while.
            </p>
            {#if pendingTx}
              <div class="flex flex-row justify-center items-center h-12" transition:slide|local>
                <BarLoader
                  duration="{step === 2 || !bridgeReceived ? '2.1s' : '0'}"
                  color="{step > 2 || bridgeReceived
                    ? '#42B792'
                    : $settings.invertColors
                    ? '#6C93C7'
                    : '#F5C59F'}"
                />
              </div>
            {/if}
          </div>

          <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}">
            <div class="w-full flex flex-row justify-between items-center">
              <p class="text-lg">Step 3: Change</p>
              {#if step > 3 || onTargetNetwork}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#42B792"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  ></path>
                </svg>
              {/if}
            </div>
            <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
              Set your wallet to the target network to continue with the last step.
            </p>
            {#if processing || step > 3 || (pendingTx && onTargetNetwork)}
              <div class="flex flex-row justify-center items-center h-12" transition:slide|local>
                <BarLoader
                  duration="{step === 3 ? '2.1s' : '0'}"
                  color="{step > 3 || onTargetNetwork
                    ? '#42B792'
                    : $settings.invertColors
                    ? '#6C93C7'
                    : '#F5C59F'}"
                />
              </div>
            {:else if (step === 3 && !processing) || pendingTx}
              <Button
                label="Change Network"
                disabled="{onTargetNetwork}"
                borderColor="green4"
                backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
                hoverColor="green4"
                height="h-12"
                on:clicked="{() => switchNetwork()}"
              />
            {/if}
          </div>

          <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}">
            <div class="w-full flex flex-row justify-between items-center">
              <p class="text-lg">Step 4: Swap</p>
              {#if step > 4}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#42B792"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  ></path>
                </svg>
              {/if}
            </div>
            <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
              Swap the bridge token for it's canonical counterpart on the target chain.
            </p>
            {#if processing}
              <div class="flex flex-row justify-center items-center h-12" transition:slide|local>
                <BarLoader
                  duration="{step === 4 ? '2.1s' : '0'}"
                  color="{step > 4 ? '#42B792' : $settings.invertColors ? '#6C93C7' : '#F5C59F'}"
                />
              </div>
            {:else if (step === 4 && !processing) || pendingTx}
              <Button
                label="Swap to Canonical"
                disabled="{!onTargetNetwork || !bridgeReceived}"
                borderColor="green4"
                backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
                hoverColor="green4"
                height="h-12"
                on:clicked="{() => swapToken()}"
              />
            {/if}
          </div>
        </div>
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
