<script>
  import { utils } from 'ethers';
  import { sentinelStore, tokensStore } from '@stores/v2/alcxStore';
  import { signer } from '@stores/v2/derived';
  import { VaultTypes } from '@stores/v2/types';
  import { onMount } from 'svelte';
  import { routerGuard } from '@helpers/routerGuard';
  import { toggleTokenEnabled } from '@stores/v2/sentinelActions';
  import { fetchTokenEnabledStatus } from '@stores/v2/asyncMethods';
  import { getTokenName } from '@helpers/getTokenData';
  import getContract, { getAddress } from '@helpers/getContract';
  import getUserGas from '@helpers/getUserGas';
  import { setError } from '@helpers/setToast';
  import ViewContainer from '@components/elements/ViewContainer.svelte';
  import PageHeader from '@components/elements/PageHeader.svelte';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';

  let tokenList = [];

  const transmuters = ['DAI', 'USDC', 'USDT', 'ETH'];
  let transmuterList = [];

  const alTokens = [
    { token: 'AlToken', alchemist: 'alUSD' },
    { token: 'AlEth', alchemist: 'alETH' },
  ];
  let alTokenList = [];

  const alchemists = ['AlchemistV2_alUSD', 'AlchemistV2_alETH'];
  let alchemistList = [];

  const initTokenData = (tokens, vaultType) => {
    tokens.forEach(async (token) => {
      const isEnabled = await fetchTokenEnabledStatus(VaultTypes[vaultType], token, $signer);
      const name = await getTokenName(token);
      tokenList = [...tokenList, { name, address: token, isEnabled, alchemist: vaultType }];
    });
  };

  const initTransmuters = () => {
    transmuters.forEach(async (transmuter) => {
      const contract = getContract(`TransmuterV2_${transmuter}`);
      const isPaused = await contract.isPaused();
      transmuterList = [...transmuterList, { name: transmuter, isPaused }];
    });
  };

  const initAlTokens = () => {
    alTokens.forEach(async (alToken) => {
      const contract = getContract(alToken.token);
      const alchemistAddress = await getAddress(`AlchemistV2_${alToken.alchemist}`);
      const isPaused = await contract.paused(alchemistAddress);
      const name = await contract.name();
      alTokenList = [...alTokenList, { name, isPaused, token: alToken.token, alchemist: alToken.alchemist }];
    });
  };

  const toggleTokenStatus = async (token, newStatus) => {
    await toggleTokenEnabled(VaultTypes.alUSD, token, newStatus, [$signer]).then(() => {
      tokenList.length = 0;
      initTokenData($tokensStore[0].underlyingTokens.concat($tokensStore[0].yieldTokens), 'alUSD');
    });
  };

  const toggleTransmuterStatus = async (transmuter, newState) => {
    const contract = getContract(`TransmuterV2_${transmuter}`);
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    try {
      await contract.setPause(newState, {
        gasPrice: gas,
      });
    } catch (e) {
      setError(e.data ? await e.data.message : e.message);
      console.log(e);
    }
  };

  const toggleAlchemistStatus = async (altoken, alchemist, newState) => {
    const contract = getContract(altoken);
    const targetAlchemist = await getAddress(`AlchemistV2_${alchemist}`);
    const gas = utils.parseUnits(getUserGas().toString(), 'gwei');
    try {
      await contract.pauseAlchemist(targetAlchemist, newState, {
        gasPrice: gas,
      });
    } catch (e) {
      setError(e.data ? await e.data.message : e.message);
      console.log(e);
    }
  };

  $: initTokenData($tokensStore[0].underlyingTokens.concat($tokensStore[0].yieldTokens), 'alUSD');

  onMount(() => {
    if (!$sentinelStore) {
      routerGuard('accounts');
    } else {
      initTransmuters();
      initAlTokens();
    }
  });
</script>

<ViewContainer>
  <div slot="head" class="flex justify-between">
    <PageHeader pageIcon="sentinel.svg" pageTitle="Sentinel" pageSubtitle="E pluribus unum" />
  </div>
  <div class="w-full flex flex-col space-y-4">
    <ContainerWithHeader canToggle="{true}" isVisible="{false}">
      <p class="inline-block self-center" slot="header">Alchemists</p>
      <div slot="body" class="p-4 bg-grey15 flex flex-col space-y-4">
        {#each alTokenList as token}
          <div class="w-full flex flex-row justify-between rounded p-2 hover:bg-lightgrey20 transition-all">
            <div class="flex flex-col w-max self-center">
              <p class="text-sm">Token</p>
              <p>{token.name}</p>
            </div>
            <div class="flex flex-col w-max self-center">
              <p class="text-sm">Status</p>
              <p>{token.isPaused ? 'Halted' : 'Active'}</p>
            </div>
            <button
              class="w-80 rounded border py-2 px-4 self-center transition-all {!token.isPaused
                ? 'border-red1 bg-red2 hover:bg-red3'
                : 'border-green1 bg-black2 hover:bg-green2'}"
              on:click="{() => toggleAlchemistStatus(token.token, token.alchemist, !token.isPaused)}"
              >{token.isPaused ? 'Resume' : 'Pause'} {token.name}
            </button>
          </div>
        {/each}
      </div>
    </ContainerWithHeader>

    <ContainerWithHeader canToggle="{true}" isVisible="{false}">
      <p class="inline-block self-center" slot="header">Transmuters</p>
      <div slot="body" class="p-4 bg-grey15 flex flex-col space-y-4">
        {#each transmuterList as transmuter}
          <div class="w-full flex flex-row justify-between rounded p-2 hover:bg-lightgrey20 transition-all">
            <div class="flex flex-col w-max self-center">
              <p class="text-sm">Transmuter</p>
              <p>{transmuter.name}</p>
            </div>
            <div class="flex flex-col w-max self-center">
              <p class="text-sm">Status</p>
              <p>{transmuter.isPaused ? 'Halted' : 'Active'}</p>
            </div>
            <button
              class="w-80 rounded border py-2 px-4 self-center transition-all {!transmuter.isPaused
                ? 'border-red1 bg-red2 hover:bg-red3'
                : 'border-green1 bg-black2 hover:bg-green2'}"
              on:click="{() => toggleTransmuterStatus(transmuter.name, !transmuter.isPaused)}"
              >{transmuter.isPaused ? 'Resume' : 'Pause'} {transmuter.name} Transmuter
            </button>
          </div>
        {/each}
      </div>
    </ContainerWithHeader>

    <ContainerWithHeader canToggle="{true}" isVisible="{false}">
      <p class="inline-block self-center" slot="header">Tokens</p>
      <div slot="body" class="p-4 bg-grey15 flex flex-col space-y-4">
        {#each tokenList as token}
          <div class="w-full flex flex-row justify-between rounded p-2 hover:bg-lightgrey20 transition-all">
            <div class="flex flex-col w-max self-center">
              <p class="text-sm">{token.name}</p>
              <p class="text-lg font-alcxMono">{token.address}</p>
            </div>
            <div class="flex flex-col w-max self-center">
              <p class="text-sm">Alchemist</p>
              <p>{token.alchemist}</p>
            </div>
            <div class="flex flex-col w-max self-center">
              <p class="text-sm">Status</p>
              <p>{token.isEnabled ? 'Active' : 'Halted'}</p>
            </div>
            <button
              class="w-80 rounded border py-2 px-4 self-center transition-all {token.isEnabled
                ? 'border-red1 bg-red2 hover:bg-red3'
                : 'border-green1 bg-black2 hover:bg-green2'}"
              on:click="{() => toggleTokenStatus(token.address, !token.isEnabled)}"
              >{token.isEnabled ? 'Pause' : 'Resume'} {token.name}
            </button>
          </div>
        {/each}
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
