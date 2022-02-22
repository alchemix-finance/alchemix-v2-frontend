<script>
  import { slide } from 'svelte/transition';
  import { _ } from 'svelte-i18n';
  import { sendVote } from '../../../../middleware/snapshot';
  import governance from '../../../../stores/governance';
  import { setPendingVote, setSuccessVote, setError, setRejectedVote } from '../../../../helpers/setToast';
  import Button from '../../../elements/Button.svelte';
  import { getProvider } from '../../../../helpers/walletManager';

  export let expandedRow = {};
  let value = '';
  let proposal;
  let vote;

  const provider = getProvider();

  /*
   * @dev constructs a payload and initiates snapshot voting
   * */
  const initVote = async () => {
    if (proposal.state !== 'closed' && !vote) {
      const payload = {
        proposal: expandedRow.proposalEntry.id,
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
        setError(e.message);
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
      return `<a href="${link}" target="_blank" rel="noopener noreferrer" class="underline text-orange3">${url}</a>`;
    });
  };

  const openOnSnapshot = () => {
    window.open(`https://snapshot.org/#/alchemixstakers.eth/proposal/${proposal.id}`, '_blank');
  };

  $: proposal = $governance.proposals?.find((proposal) => proposal.id === expandedRow.proposalEntry.id);
  $: proposal, (vote = $governance.userVotes?.find((vote) => vote.proposal.id === proposal.id));
</script>

<div class="p-4 border-b border-grey10" transition:slide|local>
  <div class="flex flex-row space-x-4">
    <div class="w-full bg-grey10 rounded p-4">
      <p class="mb-3 opacity-50">{$_('governance_page.description')}</p>
      <p class="text-justify whitespace-pre-wrap w-full">
        {@html replaceUrl()}
      </p>
    </div>
    <div class="flex flex-col min-w-max bg-grey10 rounded p-4">
      <p class="mb-3 opacity-50">
        {$_('governance_page.choose')}
      </p>
      <div id="selection" class="mb-6 w-auto">
        {#if proposal.state !== 'closed' && !vote}
          <select bind:value class="border border-grey5 bg-grey1 h-8 rounded p-1 text-xs block w-full mb-3">
            <option value="null" selected disabled>
              {$_('governance_page.selectChoice')}
            </option>
            {#each proposal.choices as choice, index}
              <option value="{index + 1}">{choice}</option>
            {/each}
          </select>
        {/if}
        <div class="flex flex-col space-y-3">
          <Button
            label="{proposal.state === 'closed'
              ? $_('governance_page.closedVote')
              : vote
              ? $_('governance_page.alreadyVoted')
              : $_('governance_page.castVote')}"
            borderSize="1"
            height="h-8"
            width="w-full"
            fontSize="text-md"
            borderColor="{proposal.state === 'closed' ? 'red3' : 'green3'}"
            textColor="{proposal.state === 'closed' ? 'red3' : 'green3'}"
            hoverColor="{proposal.state === 'closed' ? '' : 'darkgreen2'}"
            backgroundColor="{proposal.state === 'closed' ? '' : 'darkgreen1'}"
            noHoverEffect="{proposal.state === 'closed' || vote}"
            on:clicked="{() => initVote()}"
          />
          <Button
            label="{$_('governance_page.openOnSnapshot')}"
            borderSize="1"
            height="h-8"
            width="w-full"
            fontSize="text-md"
            on:clicked="{() => openOnSnapshot()}"
          />
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
