<script lang="ts">
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { BarLoader } from 'svelte-loading-spinners';

  import { getOpenProposals, getVotesForAddress } from '@middleware/snapshot';
  import { fetchPosts } from '@middleware/flarum';

  import account from '@stores/account';
  import governance from '@stores/governance';
  import { flarum } from '@stores/flarum';
  import settings from '@stores/settings';

  import { GraphQLClient } from 'graphql-request';
  import axios from 'axios';

  import { externalContractWrapper } from '@helpers/contractWrapper';

  import ViewContainer from '@components/elements/ViewContainer.svelte';
  import PageHeader from '@components/elements/PageHeader.svelte';
  import ContainerWithHeader from '@components/elements/ContainerWithHeader.svelte';
  import Button from '@components/elements/Button.svelte';
  import ProposalEntry from '@components/composed/ProposalEntry.svelte';
  import FlarumCard from '@components/composed/FlarumCard.svelte';
  import Input from '@components/elements/Input.svelte';
  import { keccak256 } from 'ethers/lib/utils';
  import { ethers } from 'ethers';
  import { writable } from 'svelte/store';
  import { write } from 'fs';

  const openAllOnSnapshot = () => {
    window.open('https://snapshot.org/#/alchemixstakers.eth', '_blank');
  };
  const openDiscussions = () => {
    window.open('https://forum.alchemix.fi/public/t/aip', '_blank');
  };

  enum FilterTypes {
    'ALL',
    'ACTIVE',
    'CLOSED',
  }

  let currentFilter = FilterTypes.ALL;
  $: countByFilter = {
    ALL: $governance.proposals.length,
    ACTIVE: $governance.proposals.filter((_prop) => _prop.state === 'active').length,
    CLOSED: $governance.proposals.filter((_prop) => _prop.state === 'closed').length,
  };

  $: if (countByFilter.ACTIVE > 0) currentFilter = FilterTypes.ACTIVE;

  $: filteredProposals =
    currentFilter === FilterTypes.ALL
      ? $governance.proposals
      : $governance.proposals.filter(
          (_proposal) => _proposal.state.toUpperCase() === FilterTypes[currentFilter],
        );

  /// scoopy's code
  //value variable to store the binding in the input
  let value;
  // takes the input address and calls the delegationRegistry contract
  let onSetDelegate = async (_address) => {
    let snapshotSpace = ethers.utils.formatBytes32String('alchemixstakers.eth');
    let delegateRegistry = externalContractWrapper('DelegateRegistry', $account.signer);
    await (await delegateRegistry).instance.setDelegate(snapshotSpace, _address);
  };
  // //the graph boilerplating
  const endpoint = 'https://api.thegraph.com/subgraphs/name/snapshot-labs/snapshot';
  const space = 'alchemixstakers';
  const spaceDotEth = 'alchemixstakers.eth';
  let delegatingToMe;
  let delegatedToOther;
  const client = new GraphQLClient(endpoint);

  //gets the address you are currently delegating to
  // async function getDelegatingAddresses(delegatorAddress) {
  //   const query1 = `
  //   query {
  //     delegations(
  //       where: {space_in: "${space}", "${spaceDotEth}", ""], delegator: "0xf872703F1C8f93fA186869Bac83BAC5A0c87C3c8"}
  //       ) {
  //       delegate
  //     }
  //   }
  // `;
  //   axios({
  //     url: endpoint,
  //     method: "post",
  //     data: {
  //       query: query1
  //     }
  //   }).then((response) => {
  //     console.log("AXIOS", response)
  //   }).catch((err) => {
  //     console.error(err)
  //   })
  //   // const data = await client.request(query);
  //   // console.log('data', data);
  //   // const delegatedTo = data.delegators.map((d) => d.delegate);
  //   // console.log('delegatedToOther', delegatedTo);
  //   // let delegatedToOther = delegatedTo;
  // }
  // //get the addresses currently delegating to you
  // async function getDelegatedAddress(delegateAddress) {
  //   const query = `
  //   query {
  //     delegations(where: {space_in: ["${space}", "${spaceDotEth}", ""], delegate: "${delegateAddress}"}
  //     ) {
  //       delegator
  //     }
  //   }
  // `;

  //   const data = await client.request(query);
  //   const delegatingTo = data.delegates[0].delegator;
  //   console.log('delegatingToMe', delegatingTo);
  //   let delegatingToMe = delegatingTo;
  // }

  /// end of scoopy's code
  onMount(async () => {
    if ($governance.proposals.length === 0) {
      await getOpenProposals();
      await getVotesForAddress();
      await getDelegatedAddress($account.address);
      await getDelegatingAddresses($account.address);
      console.log('dellll', delegatedToOther, delegatingToMe);
    }
    await fetchPosts();
  });
</script>

<ViewContainer>
  <div class="flex justify-between" slot="head">
    <PageHeader
      pageIcon="alcx_thin.svg"
      pageTitle="{$_('governance_page.title')}"
      pageSubtitle="{$_('governance_page.subtitle')}"
    />
  </div>
  <div class="w-full flex flex-col space-y-6">
    <p class="text-center text-xs opacity-50">
      {$_('governance_page.noTranslation')}
    </p>
    <!--  -->
    <div class="justaplaceholderdiv">
      TESTING AREA
      <input id="borrowInput" placeholder="Address or ENS" bind:value />
      <Button
        label="Delegate"
        borderSize="1"
        height="h-8"
        fontSize="text-md"
        solid="{false}"
        on:clicked="{() => onSetDelegate(value)}"
      />
    </div>
    <div>
      {#if delegatingToMe && Object.keys(delegatingToMe).length > 0}
        Delegated to me:
        <div>{delegatingToMe}</div>
      {/if}
      {#if delegatedToOther && Object.keys(delegatedToOther).length > 0}
        My delegated:
        <div>{delegatedToOther}</div>
      {/if}
    </div>
    <!--  -->

    <ContainerWithHeader>
      <div
        slot="header"
        class="py-4 px-6 text-sm flex flex-col gap-2 lg:gap-0 lg:flex-row lg:justify-between lg:items-center"
      >
        <p class=" text-left">Recently Active Discussions</p>
        <Button
          label="{$_('governance_page.openOnForum')}"
          borderSize="1"
          height="h-8"
          class="w-full lg:w-max"
          fontSize="text-md"
          on:clicked="{() => openDiscussions()}"
        >
          <svg
            slot="leftSlot"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 32C28.8366 32 36 26.6274 36 20C36 13.3726 28.8366 8 20 8C11.1634 8 4 13.3726 4 20C4 22.6842 5.17509 25.1626 7.16049 27.1616C6.35561 29.4537 5.31284 31.1723 4.6499 32.1319C4.4071 32.4834 4.65714 32.9802 5.08289 32.9453C6.78453 32.8058 10.1224 32.3105 12.3741 30.5519C14.6411 31.4754 17.2389 32 20 32Z"
            ></path>
            <path
              d="M22.7843 33.8337C31.4033 32.7928 38 26.9957 38 20.0002C38 19.4632 37.9611 18.9333 37.8855 18.4121C41.5534 20.1003 44 23.136 44 26.6002C44 28.7476 43.0599 30.7303 41.4716 32.3295C42.068 34.0278 42.8276 35.3325 43.3579 36.1259C43.5953 36.481 43.3423 36.9779 42.917 36.9372C41.5041 36.8021 39.0109 36.3773 37.3007 35.0418C35.4872 35.7806 33.4089 36.2002 31.2 36.2002C27.9781 36.2002 25.0343 35.3074 22.7843 33.8337Z"
            ></path>
          </svg>
        </Button>
      </div>
      <div slot="body" class=" overflow-x-auto lg:overflow-x-hidden">
        {#if $flarum.fetching}
          <div class="flex justify-center my-4">
            <BarLoader color="{$settings.invertColors ? '#6C93C7' : '#F5C59F'}" />
          </div>
        {:else if $flarum.posts.length > 0}
          <div class="flex flex-row justify-start gap-4 m-4">
            {#each $flarum.posts as post}
              <FlarumCard postData="{post}" />
            {/each}
          </div>
        {/if}
      </div>
    </ContainerWithHeader>

    <ContainerWithHeader>
      <div slot="header" class="py-4 px-6 text-sm flex flex-wrap lg:flex-nowrap justify-between">
        <div class="flex space-x-4">
          <Button
            label="{$_('governance_page.all')} ({countByFilter.ALL})"
            width="w-max"
            canToggle="{true}"
            selected="{currentFilter === FilterTypes.ALL}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => (currentFilter = FilterTypes.ALL)}"
          />

          <Button
            label="{$_('governance_page.active')} ({countByFilter.ACTIVE})"
            width="w-max"
            canToggle="{true}"
            selected="{currentFilter === FilterTypes.ACTIVE}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => (currentFilter = FilterTypes.ACTIVE)}"
          />

          <Button
            label="{$_('governance_page.closed')} ({countByFilter.CLOSED})"
            width="w-max"
            canToggle="{true}"
            selected="{currentFilter === FilterTypes.CLOSED}"
            solid="{false}"
            borderSize="0"
            on:clicked="{() => (currentFilter = FilterTypes.CLOSED)}"
          />
        </div>
        <!--        <p>{$_('governance_page.proposals')}</p>-->

        <div class=" py-2 self-stretch">
          <Button
            label="{$_('governance_page.openAllOnSnapshot')}"
            borderSize="1"
            height="h-8"
            width="w-max"
            fontSize="text-md"
            on:clicked="{() => openAllOnSnapshot()}"
          >
            <svg
              class="w-5 h-5"
              fill="currentColor"
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              slot="leftSlot"
            >
              <title>AMP</title>
              <path
                d="M12 0c6.628 0 12 5.373 12 12s-5.372 12-12 12C5.373 24 0 18.627 0 12S5.373 0 12 0zm-.92 19.278l5.034-8.377a.444.444 0 00.097-.268.455.455 0 00-.455-.455l-2.851.004.924-5.468-.927-.003-5.018 8.367s-.1.183-.1.291c0 .251.204.455.455.455l2.831-.004-.901 5.458z"
              ></path>
            </svg>
          </Button>
        </div>
      </div>

      <div slot="body">
        {#if $governance.fetching}
          <div class="flex justify-center my-4">
            <BarLoader color="{$settings.invertColors ? '#6C93C7' : '#F5C59F'}" />
          </div>
        {:else if $governance.proposals.length > 0}
          <div class="flex flex-col gap-4 py-4">
            {#each filteredProposals as proposal}
              <ProposalEntry proposal="{proposal}" />
            {/each}
          </div>
        {:else}
          <p class="text-center opacity-50">
            {$_('governance_page.noOpenVotes')}
          </p>
        {/if}
      </div>
    </ContainerWithHeader>
  </div>
</ViewContainer>
