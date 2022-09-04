<script>
  import { slide } from 'svelte/transition';
  import { _ } from 'svelte-i18n';

  import { sendVote } from '@middleware/snapshot';
  import { setPendingVote, setSuccessVote, setError, setRejectedVote } from '@helpers/setToast';

  import settings from '@stores/settings';

  import Button from '@components/elements/Button.svelte';

  export let proposalEntry = {};
  let value = '';
  export let proposal;
  export let vote;
  const supportedTypes = ['basic', 'single-choice'];
  $: isSupported = supportedTypes.indexOf(proposalEntry.type) >= 0;

  /*
   * @dev constructs a payload and initiates snapshot voting
   * */
  const initVote = async () => {
    if (proposal.state !== 'closed' && isSupported && !vote) {
      const payload = {
        proposal: proposalEntry.id,
        choice: value,
      };
      try {
        setPendingVote();
        const pendingVote = await sendVote(payload);
        if (pendingVote.code == 4001) {
          setRejectedVote();
        } else {
          setSuccessVote();
        }
      } catch (e) {
        setError(e.message, e);
        console.trace(e);
      }
    }
  };

  // @dev finds urls in the description and makes them clickable
  const replaceUrl = () => {
    const rule = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    return proposal.body.replace(rule, (url) => {
      let link = url;
      if (!link.match('^https?://')) {
        link = 'https://' + link;
      }
      return `<a href="${link}" target="_blank" rel="noopener noreferrer" class="underline text-bronze3">${url}</a>`;
    });
  };

  const openOnSnapshot = () => {
    window.open(`https://snapshot.org/#/alchemixstakers.eth/proposal/${proposal.id}`, '_blank');
  };
  const openOnForum = () => {
    window.open(`${proposal.discussion}`, '_blank');
  };
</script>

<div class="px-4 mb-4 " transition:slide|local>
  <div class="flex flex-col lg:flex-row gap-4">
    <div
      class="w-full border {$settings.invertColors
        ? 'border-grey3inverse bg-grey15inverse'
        : 'border-grey3 bg-grey15'} rounded p-4"
    >
      <p class="mb-3 text-sm opacity-50">{$_('governance_page.description')}</p>
      <p class="text-justify whitespace-pre-wrap w-full">
        {@html replaceUrl()}
      </p>
    </div>
    <div
      class="flex flex-col min-w-max border {$settings.invertColors
        ? 'border-grey3inverse bg-grey15inverse'
        : 'border-grey3 bg-grey15'} rounded p-4"
    >
      <p class="mb-3 opacity-50">
        {$_('governance_page.choose')}
      </p>
      <div id="selection" class="mb-6 w-auto">
        {#if proposal.state !== 'closed' && !isSupported}
          <p>{$_('governance_page.unsupported_explain')}</p>
        {:else if proposal.state !== 'closed' && !vote}
          <select
            bind:value
            class="border {$settings.invertColors
              ? 'border-grey5inverse bg-grey1inverse'
              : 'border-grey5 bg-grey1'} h-8 rounded p-1 text-xs block w-full mb-3"
          >
            <option value="null" selected disabled>
              {$_('governance_page.selectChoice')}
            </option>
            {#each proposal.choices as choice, index}
              <option value="{index + 1}">{choice}</option>
            {/each}
          </select>
        {/if}
        <div class="flex flex-col space-y-3">
          {#if proposal.state !== 'closed'}
            <Button
              label="{!isSupported
                ? $_('governance_page.unsupported_label')
                : vote
                ? $_('governance_page.alreadyVoted')
                : $_('governance_page.castVote')}"
              height="h-8"
              width="w-full"
              fontSize="text-md"
              borderColor="{proposal.state === 'closed' ? 'red4' : 'green4'}"
              hoverColor="{proposal.state === 'closed' ? '' : 'green4'}"
              backgroundColor="{proposal.state === 'closed'
                ? $settings.invertColors
                  ? 'red5'
                  : 'red2'
                : $settings.invertColors
                ? 'green7'
                : 'black2'}"
              noHoverEffect="{!isSupported || proposal.state === 'closed' || vote}"
              on:clicked="{() => initVote()}"
            />
          {:else if proposal.state === 'closed'}
            <Button
              label="{$_('governance_page.closedVote')}"
              height="h-8"
              width="w-full"
              fontSize="text-md"
              borderColor="red4"
              backgroundColor="{$settings.invertColors ? 'red5' : 'red2'}"
              noHoverEffect="{proposal.state === 'closed'}"
            />
          {/if}
          {#if !!proposal.discussion}
            <Button
              label="{$_('governance_page.openDiscussion')}"
              borderSize="1"
              height="h-8"
              width="w-full"
              fontSize="text-md"
              on:clicked="{() => openOnForum()}"
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
          {/if}
          <Button
            label="{$_('governance_page.openOnSnapshot')}"
            borderSize="1"
            height="h-8"
            width="w-full"
            fontSize="text-md"
            on:clicked="{() => openOnSnapshot()}"
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

      <p class="mb-3 opacity-50">
        {$_('governance_page.results')}
      </p>
      {#each proposal?.choices as choice, index}
        <div class="wrapper mb-2">
          <p>{choice}</p>
          <p class="text-sm">
            <!--            FIXME toFixed(2) errors out if scores returns an empty array-->
            {proposal.scores?.[index]?.toFixed(2) || '0'} ALCX ({(
              (100 / proposal.scores_total) *
              proposal.scores?.[index]
            )?.toFixed(2) || '0'}%)
          </p>
        </div>
        <div class="mb-4 text-center">
          <div class="relative pt-1">
            <div class="overflow-hidden h-2 text-xs flex rounded">
              <div
                style="width: {((100 / proposal.scores_total) * proposal.scores?.[index]).toFixed(2) || 0}%"
                class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-bronze1"
              ></div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
