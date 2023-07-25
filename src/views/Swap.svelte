<script lang="ts">
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import ViewContainer from '@components/elements/ViewContainer.svelte';
  import PageHeader from '@components/elements/PageHeader.svelte';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';
  import Button from '@components/elements/Button.svelte';
  import { getQuote, getStatus } from '@middleware/liFi';
  import { bridge, toCanonical, fromCanonical, bridgeBalance } from '@helpers/multichain';
  import { BarLoader } from 'svelte-loading-spinners';
  import { addressStore, balancesStore, networkStore } from '@stores/v2/alcxStore';
  import { signer } from '@stores/v2/derived';
  import { getTokenDataFromBalancesBySymbol } from '@stores/v2/helpers';
  import { chainIds } from '@stores/v2/constants';
  import settings from '@stores/settings';
  import multichainPendingTx from '@stores/multichainStore';
  import Dropdown from '@components/elements/Dropdown.svelte';
  import { setError } from '@helpers/setToast';
  import ComplexInput from '@components/composed/Inputs/ComplexInput.svelte';
  import { relayerFee, xcall } from '@middleware/connext';
  import ToggleSwitch from '@components/elements/ToggleSwitch.svelte';

  const supportedTokens = {
    alUSD: {
      name: 'alUSD',
      address: {
        ethereum: '0xbc6da0fe9ad5f3b0d58160288917aa56653660e9',
        arbitrum: '0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A',
        optimism: '0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A',
      },
    },
    alETH: {
      name: 'alETH',
      address: {
        ethereum: '0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6',
        arbitrum: '0x17573150d67d820542EFb24210371545a4868B03',
        optimism: '0x3E29D3A9316dAB217754d13b28646B76607c5f04',
      },
    },
  };

  const supportedNetworks = [
    { name: 'Ethereum', id: '0x1', abiPath: 'ethereum', icon: 'ethereum' },
    { name: 'Arbitrum', id: '0xa4b1', abiPath: 'arbitrum', icon: 'arbitrum' },
    {
      name: 'Optimism',
      id: '0xa',
      abiPath: 'optimism',
      icon: 'optimism',
    },
  ];

  let selectedToken = 'alUSD';
  let fetchingQuote = false;
  let quoteReceived = false;
  let bridgeAmount;
  let bridgeFees = '0.00';
  $: routerFees = Math.round(bridgeAmount * 0.0005 * 100) / 100 || '0.00';
  let timer;

  let toChain = supportedNetworks.filter((chain) => chain.id !== $networkStore)[0];
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
  let infiniteApproval = false;

  const switchApproval = () => {
    infiniteApproval = !infiniteApproval;
  };

  const setToChain = (_id) => {
    clear();
    toChain = chainIds.filter((chain) => chain.id === _id)[0];
  };

  const clear = () => {
    if (!processing) {
      step = 0;
      bridgeAmount = '';
      quoteReceived = false;
      bridgeToken = '';
      bridgeFees = '0.00';
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
    statusTimer = setInterval(async () => {
      await getStatus(
        $multichainPendingTx.bridge,
        $multichainPendingTx.fromChain,
        $multichainPendingTx.toChain,
        $multichainPendingTx.txHash,
      ).then((response) => {
        if (response.status === 'PENDING') bridgeReceived = true;
        if (response.status === 'DONE') {
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
          localStorage.removeItem('multichainPendingTx');
          clearInterval(statusTimer);
        }
      });
    }, 10000);
  };

  $: bridgeAmount, debounce();

  const _getQuote = async () => {
    fetchingQuote = true;
    const originChain = chainIds.filter((chain) => chain.id === $networkStore)[0].connextId;
    const targetChain = chainIds.filter((chain) => chain.id === toChain.id)[0].connextId;
    await relayerFee(originChain, targetChain, $addressStore)
      .then((result) => {
        bridgeFees = result;
        quoteReceived = true;
      })
      .catch((error) => {
        console.log(error);
        setError('Something went wrong', error);
      })
      .finally(() => {
        fetchingQuote = false;
      });
  };

  const startBridge = () => {
    const originChain = chainIds.filter((chain) => chain.id === $networkStore)[0];
    const targetChain = chainIds.filter((chain) => chain.id === toChain.id)[0];
    let direction;
    if (originChain.id === '0x1') direction = 'ETHL2';
    if (targetChain.id === '0x1') direction = 'L2ETH';
    if (originChain.id !== '0x1' && targetChain.id !== '0x1') direction = 'L2L2';
    console.log(direction);
    switch (direction) {
      case 'ETHL2':
        // ETH -> L2 xcall
        ethl2(originChain, targetChain);
        break;
      case 'L2ETH':
        // L2 -> ETH gateway
        break;
      case 'L2L2':
        // L2 -> L2 unwrap, xcall, wrap
        break;
      default:
        console.log('Invalid direction');
    }
  };

  const ethl2 = async (origin: object, target: object) => {
    const tokenAddress = supportedTokens[selectedToken].address[origin.abiPath];
    console.log('ethl2', origin, target, tokenAddress);

    await xcall(
      origin.connextId.toString(),
      target.connextId.toString(),
      tokenAddress,
      bridgeAmount,
      $signer,
      $addressStore,
      target.abiPath,
      infiniteApproval,
    )
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
        setError('Something went wrong', error);
      });
  };

  let unbridgedAssets = false;
  let unbridgedAddresses = [];
  const checkForBridgeAssets = async () => {
    Object.keys(supportedTokens).map(async (token) => {
      const chain = chainIds.filter((chain) => chain.id === $networkStore)[0];
      const bridgeToken = supportedTokens[token].address[chain.abiPath]?.bridge;
      if (bridgeToken !== undefined) {
        const balance = await bridgeBalance(bridgeToken, [$addressStore, $signer]);
        if (balance.gt(BigNumber.from(0))) {
          unbridgedAssets = true;
          unbridgedAddresses.push({ symbol: token, address: bridgeToken });
        }
      }
    });
  };

  const batchToCanonical = async (_tokens) => {
    _tokens.map(async (token, index) => {
      const canonicalToken = supportedTokens[token.symbol].selector;
      const chain = chainIds.filter((chain) => chain.id === $networkStore)[0];
      await toCanonical(token.address, canonicalToken, chain.legacyId, [$addressStore, $signer]);
      if (index + 1 === _tokens.length) {
        unbridgedAssets = false;
        localStorage.removeItem('multichainPendingTx');
      }
    });
  };

  $: onTargetNetwork =
    $multichainPendingTx.toChain === chainIds.filter((chain) => chain.id === $networkStore)[0].legacyId;
  $: if ($multichainPendingTx.bridge !== undefined && $multichainPendingTx.txHash !== undefined && step === 0)
    pendingTx = true;
  $: if (pendingTx && !autoCheck) statusPing();
  onMount(() => {
    if ($networkStore !== '0x1') checkForBridgeAssets();
  });
  // let targetNetworks;
  // const updateNetworks = () => {
  //   targetNetworks = chainIds
  //     .map((chain) => {
  //       if (supportedTokens[selectedToken].address.hasOwnProperty(chain.abiPath)) return chain;
  //     })
  //     .filter((chain) => !!chain);
  //   if (!targetNetworks.includes(toChain)) setToChain(targetNetworks[0].id);
  // };
  // $: selectedToken, updateNetworks();
</script>

<ViewContainer>
  <div slot="head" class="flex justify-between">
    <PageHeader
      pageIcon="swap_thin.svg"
      pageTitle="{$_('swap_page.title')}"
      pageSubtitle="{$_('swap_page.subtitle')}"
    />
  </div>

  {#if unbridgedAssets}
    <div
      class="border-y-1 mb-8 py-2 rounded text-sm border border-green4 {$settings.invertColors
        ? 'bg-green7 text-white2inverse'
        : 'bg-black2 text-white2'} flex flex-row justify-center space-x-4"
    >
      <div class="flex flex-row space-x-4">
        <p class="self-center">You need to swap your bridge assets</p>
        <Button
          label="Swap to canonical"
          width="w-max"
          on:clicked="{() => batchToCanonical(unbridgedAddresses)}"
        />
      </div>
    </div>
  {/if}

  <div class="w-full mb-8">
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 text-sm flex justify-between">
        <p class="inline-block self-center">{$_('swap_page.bridge')}</p>
      </div>
      <div slot="body" class="py-4 px-6 flex space-y-4 flex-col">
        {#if !pendingTx}
          <div transition:slide|local>
            <div class="flex flex-row space-x-8 pb-4">
              <div class="flex flex-col justify-between">
                <p class="text-sm text-lightgrey10 min-w-max pb-2">Target Network</p>

                <Dropdown>
                  <div
                    slot="label"
                    class="flex flex-row space-x-4 justify-between items-center px-4 py-4 w-full h-full rounded bg-{toChain.abiPath}"
                  >
                    <img src="./images/icons/{toChain.icon}.svg" alt="Network Icon" class="h-4" />
                    <p>{toChain.abiPath.charAt(0).toUpperCase() + toChain.abiPath.slice(1)}</p>
                    <p>▾</p>
                  </div>
                  <ul slot="options" class="w-full">
                    {#each supportedNetworks.filter((item) => item.id !== $networkStore) as chain}
                      <li
                        class="cursor-pointer h-8 border-t {$settings.invertColors
                          ? 'hover:bg-grey10inverse border-grey10inverse'
                          : 'hover:bg-grey10 border-grey10'}"
                        on:click="{() => setToChain(chain.id)}"
                      >
                        <p class="text-center text-opacity-50 hover:text-opacity-100 w-full">{chain.name}</p>
                      </li>
                    {/each}
                  </ul>
                </Dropdown>
              </div>
              <div class="flex flex-col w-full">
                <p class="text-sm text-lightgrey10 min-w-max flex-1">Estimated Router Fees</p>
                <div
                  class="w-full rounded text-xl text-center flex flex-1 p-4 {$settings.invertColors
                    ? 'bg-grey3inverse'
                    : 'bg-grey3'}"
                >
                  <p class="self-center w-full text-sm text-lightgrey10 text-right">
                    {routerFees}
                    {selectedToken}
                  </p>
                </div>
              </div>
              <div class="flex flex-col w-full">
                <p class="text-sm text-lightgrey10 min-w-max flex-1">Estimated Relayer Fees</p>
                <div
                  class="w-full rounded text-xl text-center flex flex-1 p-4 {$settings.invertColors
                    ? 'bg-grey3inverse'
                    : 'bg-grey3'}"
                >
                  <p class="self-center w-full text-sm text-lightgrey10 text-right">
                    {bridgeFees}
                    gwei
                  </p>
                </div>
              </div>
            </div>
            <div class="flex flex-col justify-between">
              <div class="flex flex-row justify-between  pb-2">
                <p class="text-sm text-lightgrey10 min-w-max">Token</p>

                <div class="flex flex-row space-x-4">
                  <p
                    class="flex-auto {$settings.invertColors
                      ? 'text-lightgrey10inverse'
                      : 'text-lightgrey10'} text-sm self-center"
                  >
                    {$_('approval')}:
                  </p>
                  <ToggleSwitch
                    label="{$_('exact')}"
                    secondLabel="{$_('infinite')}"
                    on:toggleChange="{() => switchApproval()}"
                  />
                </div>
              </div>
              <ComplexInput
                bind:inputValue="{bridgeAmount}"
                supportedTokens="{Object.entries(supportedTokens).map((entry) => {
                  return entry[1].name;
                })}"
                bind:selectedToken
                externalMax="{tokenBalanceRaw}"
              />
            </div>
          </div>

          <div class="flex flex-col lg:flex-row gap-4" transition:slide|local></div>
        {/if}

        <div class="w-full flex flex-col lg:flex-row gap-4">
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
              Find a route and send the desired token to Connext's bridging service.
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
                on:clicked="{() => startBridge()}"
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
        </div>
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
