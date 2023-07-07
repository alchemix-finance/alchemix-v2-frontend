<script>
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { _ } from 'svelte-i18n';
  import { utils, BigNumber, ethers } from 'ethers';
  import ViewContainer from '@components/elements/ViewContainer.svelte';
  import PageHeader from '@components/elements/PageHeader.svelte';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';
  import Button from '@components/elements/Button.svelte';
  import VaultMessage from '@components/elements/VaultMessage.svelte';
  import { getQuote, getStatus } from '@middleware/liFi';
  import { bridge, toCanonical, fromCanonical, bridgeBalance } from '@helpers/multichain';
  import { BarLoader } from 'svelte-loading-spinners';
  import { addressStore, balancesStore, networkStore } from '@stores/v2/alcxStore';
  import { signer } from '@stores/v2/derived';
  import { getTokenDataFromBalancesBySymbol } from '@stores/v2/helpers';
  import { chainIDS, chainIds } from '@stores/v2/constants';
  import settings from '@stores/settings';
  import multichainPendingTx from '@stores/multichainStore';
  import Dropdown from '@components/elements/Dropdown.svelte';
  import { switchChain } from '@helpers/walletManager';
  import { setError, setPendingTx, setSuccessTx } from '@helpers/setToast';
  import ComplexInput from '@components/composed/Inputs/ComplexInput.svelte';
  import { contractWrapper } from '@helpers/contractWrapper';

  import crossChainCanonicalAbi from '@helpers/CrossChainCanonical';
  import { formatEther, parseEther } from 'ethers/lib/utils';

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
        arbitrum: {
          bridge: '0x026e91e4C3d35EB31a90FcdBF50313d0290Af3cb',
          canonical: '0x870d36B8AD33919Cc57FFE17Bb5D3b84F3aDee4f',
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
        arbitrum: {
          bridge: '0x2130d2a1e51112D349cCF78D2a1EE65843ba36e0',
          canonical: '0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A',
        },
        optimism: {
          bridge: '0xb2c22a9fb4fc02eb9d1d337655ce079a04a526c7',
          canonical: '0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A',
        },
      },
      selector: 'CrossChainCanonicalAlchemicTokenV2_alUSD',
    },
    alETH: {
      name: 'alETH',
      address: {
        ethereum: '0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6',
        optimism: {
          bridge: '0x1CcCA1cE62c62F7Be95d4A67722a8fDbed6EEcb4',
          canonical: '0x3E29D3A9316dAB217754d13b28646B76607c5f04',
        },
      },
      selector: 'CrossChainCanonicalAlchemicTokenV2_alETH',
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

  let quoteTry = 0;
  const _getQuote = async () => {
    fetchingQuote = true;
    const fromChain = chainIds.filter((chain) => chain.id === $networkStore)[0];
    const amount = utils.parseEther(bridgeAmount.toString());
    const fromToken =
      fromChain.legacyId === 1
        ? supportedTokens[selectedToken].address.ethereum
        : supportedTokens[selectedToken].address[fromChain.abiPath].bridge;
    const toToken =
      toChain.legacyId !== 1
        ? supportedTokens[selectedToken].address[toChain.abiPath].bridge
        : supportedTokens[selectedToken].address.ethereum;
    await getQuote(fromChain.legacyId, toChain.legacyId, fromToken, toToken, amount.toString(), $addressStore)
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
        // @dev stupid workaround for issues fetching arbitrum quotes
        if (quoteTry < 2) {
          quoteTry += 1;
          _getQuote();
        } else {
          quoteTry = 0;
          setError(
            toChain.id === $networkStore ? 'Target network is not different from current network' : error,
            error,
          );
        }
      });
  };

  const startBridge = async (txData, _targetNetwork) => {
    let fromToken;
    const fromChain = chainIds.filter((chain) => chain.id === $networkStore)[0];
    const amount = utils.parseEther(bridgeAmount.toString());
    if (_targetNetwork !== '0x1') processing = true;
    step = _targetNetwork === '0x1' ? 2 : 1;
    fromToken =
      fromChain.id === '0x1'
        ? supportedTokens[selectedToken].address.ethereum
        : supportedTokens[selectedToken].address[fromChain.abiPath].bridge;
    await bridge(txData, fromToken, amount, approvalTarget, [$addressStore, $signer])
      .then((hash) => {
        $multichainPendingTx.bridge = tool;
        $multichainPendingTx.fromChain = fromChain.legacyId;
        $multichainPendingTx.toChain = toChain.legacyId;
        $multichainPendingTx.txHash = hash;
        $multichainPendingTx.bridgeToken = bridgeToken;
        $multichainPendingTx.token = selectedToken;
        autoCheck = true;
        step = _targetNetwork === '0x1' ? 3 : 2;
        if (_targetNetwork === '0x1') processing = false;
        statusPing();
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
        if (!bridgeReceived) step = 2;
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const swapToken = async (targetNetwork) => {
    let chain;
    switch (targetNetwork) {
      case '0x1':
        processing = true;
        step = 1;
        chain = chainIds.filter((chain) => chain.id === $networkStore)[0];
        await fromCanonical(
          supportedTokens[selectedToken].address[chain.abiPath].bridge,
          supportedTokens[selectedToken].selector,
          chainIds.filter((chain) => chain.id === $networkStore)[0].legacyId,
          utils.parseEther(bridgeAmount.toString()),
          [$signer],
        )
          .then((txHash) => {
            console.log(txHash);
            startBridge(txData, '0x1');
          })
          .catch((error) => {
            console.error(error);
            step = 0;
            processing = false;
          });
        break;
      default:
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
            localStorage.removeItem('multichainPendingTx');
          })
          .catch((error) => {
            console.error(error);
          });
        break;
    }
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
  let targetNetworks;
  const updateNetworks = () => {
    targetNetworks = chainIds
      .map((chain) => {
        if (supportedTokens[selectedToken].address.hasOwnProperty(chain.abiPath)) return chain;
      })
      .filter((chain) => !!chain);
    if (!targetNetworks.includes(toChain)) setToChain(targetNetworks[0].id);
  };
  $: selectedToken, updateNetworks();

  let selected;
  let value = '';

  let alETH_Tokens = {
    [chainIDS.optimism]: {
      title: 'alETH',
      bridge: '0x1CcCA1cE62c62F7Be95d4A67722a8fDbed6EEcb4',
      canonical: '0x3E29D3A9316dAB217754d13b28646B76607c5f04',
      selector: 'CrossChainCanonicalAlchemicTokenV2_alETH',
    },
  };

  let gAlLCX_Tokens = {
    [chainIDS.fantom]: {
      title: 'gALCX',
      bridge: '0x4CbA8902ce48AB1d5eEa1920D65faeDB934B9916',
      canonical: '0x70F9fd19f857411b089977E7916c05A0fc477Ac9',
    },
    [chainIDS.arbitrium]: {
      title: 'gALCX',
      bridge: '0x026e91e4C3d35EB31a90FcdBF50313d0290Af3cb',
      canonical: '0x870d36B8AD33919Cc57FFE17Bb5D3b84F3aDee4f',
    },
  };

  let alUSD_Tokens = {
    [chainIDS.arbitrium]: {
      title: 'alUSD',
      bridge: '0x2130d2a1e51112D349cCF78D2a1EE65843ba36e0',
      canonical: '0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A',
      selector: 'CrossChainCanonicalAlchemicTokenV2_alUSD',
    },
    [chainIDS.optimism]: {
      title: 'alUSD',
      bridge: '0xb2c22a9fb4fc02eb9d1d337655ce079a04a526c7',
      canonical: '0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A',
      selector: 'CrossChainCanonicalAlchemicTokenV2_alUSD',
    },
    [chainIDS.fantom]: {
      title: 'alUSD',
      bridge: '0xe5130d3dbfac6ae7d73a24d719762df74d8e4c27',
      canonical: '0xB67FA6deFCe4042070Eb1ae1511Dcd6dcc6a532E',
      selector: 'CrossChainCanonicalAlchemicTokenV2_alUSD',
    },
  };

  $: console.log(selected);

  async function exchangeCanonicalForOld() {
    try {
      console.log(selected);
      const canonicalContract = new ethers.Contract(selected.canonical, crossChainCanonicalAbi, $signer);

      const amount = utils.parseEther(value);
      console.log(amount.toString());
      const tx = await canonicalContract.exchangeCanonicalForOld(selected.bridge, amount);

      setPendingTx();

      return await tx.wait().then((transaction) => {
        setSuccessTx(transaction.transactionHash);
      });
    } catch (error) {
      const message = error.data ? await error.data.message : error.message;
      setError(message, error);
      console.error(`[exchangeCanonicalForOld]:`, message);
    }
  }

  async function onMaxButtonHandle() {
    try {
      const canonicalContract = new ethers.Contract(selected.canonical, crossChainCanonicalAbi, $signer);

      const balanceOf = await canonicalContract.balanceOf($addressStore);

      value = formatEther(balanceOf);
    } catch (error) {
      const message = error.data ? await error.data.message : error.message;
      setError(message, error);
      console.error(`[onMaxButtonHandle]:`, message);
    }
  }
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
        <p class="inline-block self-center">Emergency Chainswap</p>
      </div>
      <div
        slot="body"
        class="py-4 px-6 flex flex-col lg:flex-row gap-4 max-h-44 overflow-y-visible lg:overflow-y-hidden"
      >
        <div class="flex flex-col">
          <div>
            <select class=" bg-black2 text-white2" bind:value="{selected}">
              {#if alUSD_Tokens[$networkStore]}
                <option value="{alUSD_Tokens[$networkStore]}">
                  {alUSD_Tokens[$networkStore].title}
                </option>
              {/if}

              {#if alETH_Tokens[$networkStore]}
                <option value="{alETH_Tokens[$networkStore]}">
                  {alETH_Tokens[$networkStore].title}
                </option>
              {/if}

              {#if gAlLCX_Tokens[$networkStore]}
                <option value="{gAlLCX_Tokens[$networkStore]}">
                  {gAlLCX_Tokens[$networkStore].title}
                </option>
              {/if}
            </select>

            <input class="border border-grey2 p-2 bg-black2 text-white2" bind:value type="text" />

            <button class="p-2 bg-grey3 border border-grey15 text-white2" on:click="{onMaxButtonHandle}"
              >MAX</button
            >
          </div>

          <button class="p-2 bg-grey3 border border-grey15 text-white2" on:click="{exchangeCanonicalForOld}"
            >Swap canonical tokens to old tokens</button
          >
        </div>
      </div>
    </ContainerWithHeader>
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
        <p class="inline-block self-center">{$_('transmuter_page.external_swaps')}</p>
      </div>
      <div
        slot="body"
        class="py-4 px-6 flex flex-col lg:flex-row gap-4 max-h-44 overflow-y-visible lg:overflow-y-hidden"
      >
        {#if $networkStore === '0xfa'}
          <Button
            on:clicked="{() => goTo('https://beets.fi/#/trade')}"
            label="Beethovenx"
            class="w-full lg:w-max"
            py="py-2"
          >
            <img
              src="./images/icons/beethovenx.svg"
              class="w-5 h-5"
              slot="leftSlot"
              alt="Logo of BeethovenX"
            />
          </Button>
        {/if}
        <Button on:clicked="{() => goTo('https://curve.fi')}" label="Curve" class="w-full lg:w-max" py="py-2">
          <img src="./images/icons/crv.png" class="w-5 h-5" slot="leftSlot" alt="Logo of Curve" />
        </Button>
        {#if $networkStore === '0xfa'}
          <Button
            on:clicked="{() => goTo('https://app.spiritswap.finance/#/exchange/swap/FTM/SPIRIT')}"
            label="SpiritSwap"
            class="w-full lg:w-max"
            py="py-2"
          >
            <img
              src="./images/icons/spiritswap.svg"
              class="w-5 h-5"
              slot="leftSlot"
              alt="Logo of SpiritSwap"
            />
          </Button>
          <Button
            on:clicked="{() => goTo('https://spooky.fi/#/swap')}"
            label="SpookySwap"
            class="w-full lg:w-max"
            py="py-2"
          >
            <img
              src="./images/icons/spookyswap.svg"
              class="w-5 h-5"
              slot="leftSlot"
              alt="Logo of SpookySwap"
            />
          </Button>
        {/if}
        <Button
          on:clicked="{() => goTo('http://app.paraswap.io')}"
          label="Paraswap"
          class="w-full lg:w-max"
          py="py-2"
        >
          <img src="./images/icons/paraswap.png" class="w-5 h-5" slot="leftSlot" alt="Logo of Paraswap" />
        </Button>
        {#if $networkStore === '0xa'}
          <Button
            on:clicked="{() => goTo('https://app.velodrome.finance/swap')}"
            label="Velodrome"
            class="w-full lg:w-max"
            py="py-2"
          >
            <img src="./images/icons/velodrome.svg" class="w-5 h-5" slot="leftSlot" alt="Logo of Velodrome" />
          </Button>
        {/if}
        <Button
          on:clicked="{() => goTo('http://zapper.fi')}"
          label="Zapper"
          class="w-full lg:w-max"
          py="py-2"
        >
          <img src="./images/icons/zapper.png" class="w-5 h-5" slot="leftSlot" alt="Logo of Zapper" />
        </Button>
      </div>
    </ContainerWithHeader>
  </div>

  <div class="w-full mb-8">
    <VaultMessage
      level="{1}"
      message="Swapping bridged assets for canonical tokens is currently paused due to the ongoing uncertainty with Multichain. See the announcement below."
      linkTarget="https://twitter.com/AlchemixFi/status/1664287170243497984"
      linkLabel="Swap pause announcement on Twitter"
    />
  </div>

  <div class="w-full mb-8">
    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 text-sm flex justify-between">
        <p class="inline-block self-center">{$_('swap_page.bridge')}</p>
      </div>
      <div slot="body" class="py-4 px-6 flex space-y-4 flex-col">
        {#if !pendingTx}
          <div transition:slide|local>
            <ComplexInput
              bind:inputValue="{bridgeAmount}"
              supportedTokens="{Object.entries(supportedTokens).map((entry) => {
                return entry[1].name;
              })}"
              bind:selectedToken
              externalMax="{tokenBalanceRaw}"
            />
          </div>

          <div class="flex flex-col lg:flex-row gap-4" transition:slide|local>
            <div class="flex gap-2">
              <p class="text-sm text-lightgrey10 min-w-max self-center">Target Network:</p>

              <Dropdown>
                <div
                  slot="label"
                  class="flex flex-row space-x-4 justify-between items-center px-2 w-full h-full rounded bg-{toChain.abiPath}"
                >
                  <img src="./images/icons/{toChain.icon}.svg" alt="Network Icon" class="h-4" />
                  <p>{toChain.abiPath.charAt(0).toUpperCase() + toChain.abiPath.slice(1)}</p>
                  <p>▾</p>
                </div>
                <ul slot="options" class="w-full">
                  {#each targetNetworks as chain}
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

            <div class="flex w-full gap-2">
              <p class="text-sm text-lightgrey10 min-w-max self-center flex-1">Bridge Fees:</p>
              <div
                class="w-full rounded text-xl text-center flex flex-1 p-4 {$settings.invertColors
                  ? 'bg-grey3inverse'
                  : 'bg-grey3'}"
              >
                <p class="self-center w-full text-sm text-lightgrey10 text-right">
                  {bridgeFees}
                  {selectedToken}
                </p>
              </div>
            </div>

            <div class="flex w-full gap-2">
              <p class="text-sm text-lightgrey10 min-w-max self-center flex-1">Receive:</p>
              <div
                class="w-full rounded text-xl text-center flex flex-1 p-4 {$settings.invertColors
                  ? 'bg-grey3inverse'
                  : 'bg-grey3'}"
              >
                <p class="self-center w-full text-sm text-lightgrey10 text-right">
                  {estimateOutAmount}
                  {selectedToken}
                </p>
              </div>
            </div>
          </div>
        {/if}
        {#if toChain.id !== '0x1'}
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
              <p
                class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}"
              >
                Get a quote and send the desired token to Li.Fi's bridging service.
              </p>
              {#if processing || step > 1 || pendingTx}
                <div class="flex flex-row justify-center items-center h-12" transition:slide|local>
                  <BarLoader
                    duration="{step === 1 ? '2.1s' : '0'}"
                    color="{step > 1 || pendingTx
                      ? '#42B792'
                      : $settings.invertColors
                      ? '#6C93C7'
                      : '#F5C59F'}"
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
              <p
                class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}"
              >
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
              <p
                class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}"
              >
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
              <p
                class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}"
              >
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
                  on:clicked="{() => swapToken('0xfa')}"
                />
              {/if}
            </div>
          </div>
        {/if}
        {#if toChain.id === '0x1'}
          <div class="w-full flex flex-row space-x-4">
            <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}">
              <div class="w-full flex flex-row justify-between items-center">
                <p class="text-lg">Step 1: Swap</p>
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
              <p
                class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}"
              >
                Swap the canonical token for it's bridge counterpart before sending it to the target network.
              </p>
              {#if processing || step > 1 || pendingTx}
                <div class="flex flex-row justify-center items-center h-12" transition:slide|local>
                  <BarLoader
                    duration="{step === 1 ? '2.1s' : '0'}"
                    color="{step > 1 || pendingTx
                      ? '#42B792'
                      : $settings.invertColors
                      ? '#6C93C7'
                      : '#F5C59F'}"
                  />
                </div>
              {:else if fetchingQuote}
                <div class="flex justify-center items-center my-4 h-12">
                  <BarLoader color="{$settings.invertColors ? '#6C93C7' : '#F5C59F'}" />
                </div>
              {:else}
                <Button
                  label="Swap Token"
                  disabled="{!quoteReceived}"
                  borderColor="green4"
                  backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
                  hoverColor="green4"
                  height="h-12"
                  on:clicked="{() => swapToken('0x1')}"
                />
              {/if}
            </div>

            <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}">
              <div class="w-full flex flex-row justify-between items-center">
                <p class="text-lg">Step 2: Bridge</p>
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
              <p
                class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}"
              >
                Send the desired token to Li.Fi's bridging service.
              </p>
              {#if processing || step > 2 || pendingTx}
                <div class="flex flex-row justify-center items-center h-12" transition:slide|local>
                  <BarLoader
                    duration="{step === 2 ? '2.1s' : '0'}"
                    color="{step > 2 || pendingTx
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
                <p class="text-lg">Step 3: Wait</p>
                {#if step > 3 || bridgeReceived}
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
              <p
                class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}"
              >
                Wait patiently for the bridged token to appear in your wallet. This takes a while.
              </p>
              {#if pendingTx || processing}
                <div class="flex flex-row justify-center items-center h-12" transition:slide|local>
                  <BarLoader
                    duration="{(step === 3 || !bridgeReceived) && !processing ? '2.1s' : '0'}"
                    color="{step > 3 || bridgeReceived
                      ? '#42B792'
                      : $settings.invertColors
                      ? '#6C93C7'
                      : '#F5C59F'}"
                  />
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
