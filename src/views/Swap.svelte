<script lang="ts">
  import { slide } from 'svelte/transition';
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber } from 'ethers';
  import ViewContainer from '@components/elements/ViewContainer.svelte';
  import PageHeader from '@components/elements/PageHeader.svelte';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';
  import Button from '@components/elements/Button.svelte';
  import { BarLoader } from 'svelte-loading-spinners';
  import { addressStore, balancesStore, networkStore } from '@stores/v2/alcxStore';
  import { signer } from '@stores/v2/derived';
  import { getTokenDataFromBalancesBySymbol } from '@stores/v2/helpers';
  import { chainIds } from '@stores/v2/constants';
  import settings from '@stores/settings';
  import Dropdown from '@components/elements/Dropdown.svelte';
  import { setError } from '@helpers/setToast';
  import ComplexInput from '@components/composed/Inputs/ComplexInput.svelte';
  import { relayerFee, xcall, statusCheck } from '@middleware/connext';
  import ToggleSwitch from '@components/elements/ToggleSwitch.svelte';
  import { connextReceipts } from '@stores/connextStore';

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
  let bridgeFees = '0';
  $: routerFees = Math.round(bridgeAmount * 0.0005 * 100) / 100 || '0.00';
  let timer;

  let toChain = supportedNetworks.filter((chain) => chain.id !== $networkStore)[0];
  $: tokenBalanceRaw =
    getTokenDataFromBalancesBySymbol(selectedToken, [$balancesStore])?.balance || BigNumber.from(0);
  $: tokenBalance = utils.formatEther(tokenBalanceRaw);
  let step = 0;
  let processing = false;
  let pendingTx = false;
  let bridgeToken = '';
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

    await xcall(
      origin.connextId.toString(),
      target.connextId.toString(),
      tokenAddress,
      utils.parseEther(bridgeAmount.toString()).toString(),
      $signer,
      $addressStore,
      target.abiPath,
      infiniteApproval,
      bridgeFees,
    )
      .then((result) => {
        $connextReceipts = [
          ...$connextReceipts,
          {
            originChain: origin.abiPath,
            destinationChain: target.abiPath,
            token: selectedToken,
            amount: bridgeAmount,
            txHash: result.transactionHash,
          },
        ];
      })
      .catch((error) => {
        console.log(error);
        setError('Something went wrong', error);
      })
      .finally(() => {
        clear();
      });
  };

  const getStatus = async (txHash: string, origin: string, destination: string) => {
    return await statusCheck(txHash, origin, destination);
  };

  const cleanStatus = (status: string) => {
    enum Status {
      'XCalled' = 'Pending',
      'Executed' = 'Success',
      'Reconciled' = 'Success',
      'CompletedFast' = 'Success',
      'CompletedSlow' = 'Success',
    }

    return Status[status];
  };

  const foo = '0xe045ad545c14c149b849a39bc3fd80632169d1215f82fff28dabca9980dea7ea';
  const openExplorer = (tx) => {
    window.open(`https://connextscan.io/tx/${tx}`, '_blank');
  };
</script>

<ViewContainer>
  <div slot="head" class="flex justify-between">
    <PageHeader
      pageIcon="swap_thin.svg"
      pageTitle="{$_('swap_page.title')}"
      pageSubtitle="{$_('swap_page.subtitle')}"
    />
  </div>

  <div class="w-full mb-8">
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 text-sm flex justify-between">
        <p class="inline-block self-center">{$_('swap_page.bridge')}</p>
      </div>
      <div slot="body" class="py-4 px-6 flex space-y-4 flex-col">
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
                {#if fetchingQuote}
                  <div class="flex w-full justify-center items-center">
                    <BarLoader color="{$settings.invertColors ? '#6C93C7' : '#F5C59F'}" />
                  </div>
                {:else}
                  <p class="self-center w-full text-sm text-lightgrey10 text-right">
                    {bridgeFees}
                    gwei
                  </p>
                {/if}
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

        <Button
          label="Bridge Token"
          disabled="{!quoteReceived}"
          borderColor="green4"
          backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
          hoverColor="green4"
          height="h-12"
          on:clicked="{() => startBridge()}"
        />
      </div>
    </ContainerWithHeader>
  </div>

  <div class="w-full mb-8">
    <ContainerWithHeader>
      <div
        slot="header"
        class="py-4 px-6 text-sm flex flex-col gap-2 lg:gap-0 lg:flex-row lg:justify-between lg:items-center"
      >
        <p class="text-left w-full">Bridge Receipts</p>
        <Button
          label="Clear"
          borderSize="1"
          width="w-max"
          height="h-8"
          fontSize="text-md"
          on:clicked="{() => ($connextReceipts.length = 0)}"
        />
      </div>
      <div class="py-4 px-6" slot="body">
        <div class="flex flex-col space-y-4">
          {#if $connextReceipts.length > 0}
            {#each $connextReceipts as receipt}
              <div
                class="flex flex-col space-y-4 border rounded p-4 w-full relative {$settings.invertColors
                  ? 'bg-grey10inverse border-grey3inverse'
                  : 'bg-grey10 border-grey3'}"
              >
                <div class="flex flex-row space-x-4 justify-between">
                  <div class="flex flex-col space-y-2 items-center">
                    <p class="text-sm text-lightgrey10">Route</p>
                    <div class="flex flex-row space-x-2 items-center">
                      <img
                        src="./images/icons/{receipt.originChain}.svg"
                        alt="Starting Network"
                        class="h-8"
                      />
                      <p class="pr-2">⏵</p>
                      <img
                        src="./images/icons/{receipt.destinationChain}.svg"
                        alt="Destination Network"
                        class="h-8"
                      />
                    </div>
                  </div>

                  <div class="flex flex-col space-y-2 items-center">
                    <p class="text-sm text-lightgrey10">Transfer Amount</p>
                    <p>{receipt.amount} {receipt.token}</p>
                  </div>

                  <div class="flex flex-col space-y-2 items-center">
                    <p class="text-sm text-lightgrey10">Status</p>
                    {#await getStatus(receipt.txHash, receipt.originChain, receipt.destinationChain)}
                      <p class="animate-pulse">¯\_(ツ)_/¯</p>
                    {:then status}
                      <p>{cleanStatus(status)}</p>
                    {/await}
                  </div>
                </div>
                <div class="flex flex-row justify-between items-center">
                  <p class="text-sm text-lightgrey10 w-full self-center">
                    Tx Hash: <span class="font-alcxMono">{receipt.txHash}</span>
                  </p>
                  <Button
                    label="Inspect"
                    borderSize="1"
                    width="w-max"
                    fontSize="text-sm"
                    on:clicked="{() => openExplorer(receipt.txHash)}"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 inline"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      slot="rightSlot"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      ></path>
                    </svg>
                  </Button>
                </div>
              </div>
            {/each}
          {:else}
            <p class="text-center text-sm">No receipts found.</p>
          {/if}
        </div>
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
