<script>
  import { getDefaultProvider } from 'ethers';
  import { slide } from 'svelte/transition';
  import { _ } from 'svelte-i18n';
  import { connect, switchChain } from '@helpers/walletManager';
  import Button from '../elements/Button.svelte';
  import BorderContainer from '../elements/BorderContainer.svelte';
  import WalletBalance from './WalletBalance.svelte';
  import AvatarWithIndicator from '../elements/AvatarWithIndicator.svelte';
  import account from '@stores/account';
  import network from '@stores/network';
  import settings from '@stores/settings';
  import { chainIds } from '@stores/v2/constants';
  import { networkStore } from '@stores/v2/alcxStore';

  let indicatorColor;
  let balanceCollapsed = true;
  let supportedNetwork = true;
  let isHuman = true;
  let chainCollapsed = true;

  const debugging = Boolean(parseInt(process.env.DEBUG_MODE, 10));
  const provider = getDefaultProvider();

  /*
   * @dev returns ENS or truncates the long address string for better visuals
   * @param address the wallet address to truncate
   * @returns the formatted address
   * */
  const resolveAddress = (address) => {
    return $account.ens || `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  /*
   * @dev sets the indicator color to green if the connected network is correct, orange if it is wrong
   * */
  const resolveIndicator = (networkId) => {
    const networks = chainIds.map((val) => val.id);
    indicatorColor = networks.includes(networkId) ? 'green1' : 'orange1';
    supportedNetwork = networks.includes(networkId);
  };

  const resolveHuman = async (address) => {
    if (address !== undefined && $networkStore === '0x1') {
      const resolved = await provider.getCode(address);
      isHuman = resolved === '0x';
    }
  };

  /*
   * @dev opens etherscan for the currently logged in wallet
   * */
  function openEtherscan() {
    window.open(`https://etherscan.io/address/${$account.address}`, '_blank');
  }

  const toggleBalanceCollapse = () => {
    balanceCollapsed = !balanceCollapsed;
    chainCollapsed = true;
  };

  const chainSelectCollapse = () => {
    chainCollapsed = !chainCollapsed;
    balanceCollapsed = true;
  };

  const updateChain = async (id) => {
    await switchChain(id);
    chainSelectCollapse();
  };

  $: $network, resolveIndicator($networkStore);
  $: $network, resolveHuman($account.address);
  $: networkIcon = chainIds.filter((item) => item.id === $networkStore)[0]?.icon;
</script>

<BorderContainer>
  {#if $account.signer}
    <div class="flex space-x-2">
      <Button width="w-max" height="h-10" label="" on:clicked="{() => chainSelectCollapse()}">
        <img slot="rightSlot" class="h-8 w-8" src="images/icons/{networkIcon}.svg" />
      </Button>

      <Button
        borderSize="1"
        label="{resolveAddress($account.address)}"
        uppercase="{false}"
        height="h-10"
        on:clicked="{openEtherscan}"
      >
        <div slot="leftSlot">
          <AvatarWithIndicator hash="{$account.address}" bgColor="{indicatorColor}" />
        </div>
      </Button>
      <Button width="w-max" label="" on:clicked="{() => toggleBalanceCollapse()}">
        <svg
          slot="rightSlot"
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {#if balanceCollapsed}
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            ></path>
          {:else}
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            ></path>
          {/if}
        </svg>
      </Button>
    </div>
    {#if !supportedNetwork}
      <div
        class="mt-2 py-2 px-4 bg-orange1 border border-orange2 rounded text-grey5 flex align-center space-x-4"
        transition:slide
      >
        <div class="relative w-6 h-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 absolute animate-ping"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
        </div>

        <p>{$_('wrong_network')}!</p>
      </div>
    {/if}
    {#if !isHuman}
      <div
        class="mt-2 py-2 px-4 bg-orange1 border border-orange2 rounded text-grey5 flex align-center space-x-4"
        transition:slide
      >
        <div class="relative w-6 h-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 absolute animate-ping"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
        </div>

        <p>{$_('using_contract')}!</p>
      </div>
    {/if}
    {#if !balanceCollapsed && chainCollapsed}
      <div
        class="mt-2 py-2 px-4 {$settings.invertColors ? 'bg-grey15inverse' : 'bg-grey15'} rounded"
        transition:slide
      >
        <WalletBalance />
      </div>
    {/if}
    {#if balanceCollapsed && !chainCollapsed}
      <div
        class="mt-2 py-2 px-4 {$settings.invertColors ? 'bg-grey15inverse' : 'bg-grey15'} rounded"
        transition:slide
      >
        <div class="flex flex-col space-y-4">
          {#each chainIds as chainId}
            <div
              class="flex space-x-4 flex-row {chainId.id === $networkStore
                ? 'opacity-100 hover:cursor-default'
                : 'opacity-50 hover:opacity-100 hover:cursor-pointer'} items-center"
              on:click="{() => updateChain(chainId.id)}"
            >
              <img src="images/icons/{chainId.icon}.svg" alt="asd" class="w-6 h-6" />
              <p class="h-6">{chainId.name}</p>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {:else}
    <Button
      borderSize="1"
      label="{$_('connect_wallet')}"
      uppercase="{true}"
      height="h-10"
      on:clicked="{() => connect(null)}"
    >
      <div slot="leftSlot">
        <AvatarWithIndicator />
      </div>
    </Button>
  {/if}
</BorderContainer>
