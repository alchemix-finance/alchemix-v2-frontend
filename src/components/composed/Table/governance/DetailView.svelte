<script>
import { slide } from 'svelte/transition';
import { _ } from 'svelte-i18n';
import { sendVote } from '../../../../middleware/snapshot';
import governance from '../../../../stores/governance';
import toastConfig from '../../../../stores/toast';
import Button from '../../../elements/Button.svelte';

export let expandedRow = {};
let value = '';
let proposal;

/*
 * @dev constructs a payload and initiates snapshot voting
 * */
const initVote = () => {
  if (proposal.state !== 'closed') {
    const payload = {
      proposal: expandedRow.proposalEntry.id,
      choice: value,
    };
    sendVote(payload);
  } else {
    voteClosed();
  }
};

const voteClosed = () => {
  $toastConfig.kind = 'error';
  $toastConfig.title = 'Sorry!';
  $toastConfig.subtitle = 'Voting has finished.';
  $toastConfig.spinner = false;
  $toastConfig.closeTimeout = 2500;
  $toastConfig.visible = true;
};

const openOnSnapshot = () => {
  window.open(`https://snapshot.org/#/alchemixstakers.eth/proposal/${proposal.id}`, '_blank');
};

$: proposal = $governance.proposals?.find((proposal) => proposal.id === expandedRow.proposalEntry.id);

$: console.log(proposal);
</script>

<div class="pb-4 pt-4 border-b border-grey10" transition:slide>
  <div class="wrapper max-w-none grid grid-cols-12">
    <div class="col-span-1"></div>
    <div class="col-span-7 pr-8">
      <p class="mb-3 opacity-50">{$_('governance_page.description')}</p>
      <p class="text-justify whitespace-pre-wrap w-full">
        {@html proposal?.body}
      </p>
    </div>
    <div class="col-span-4 pr-4">
      <p class="mb-3 opacity-50">
        {$_('governance_page.choose')}
      </p>
      <div id="selection" class="mb-6 w-auto">
        {#if proposal.state !== 'closed'}
          <select bind:value class="border border-grey5 bg-grey1 h-8 rounded p-1 text-xs block w-full mb-3">
            <option value="null" selected disabled>
              {$_('governance_page.selectChoice')}
            </option>
            {#each proposal.choices as choice, index}
              <option value="{index + 1}">{choice}</option>
            {/each}
          </select>
        {/if}

        <Button
          label="{proposal.state === 'closed'
            ? $_('governance_page.closedVote')
            : $_('governance_page.castVote')}"
          borderSize="1"
          height="h-8"
          width="w-full"
          fontSize="text-md"
          borderColor="{proposal.state === 'closed' ? 'red3' : 'green3'}"
          textColor="{proposal.state === 'closed' ? 'red3' : 'green3'}"
          hoverColor="{proposal.state === 'closed' ? '' : 'darkgreen2'}"
          backgroundColor="{proposal.state === 'closed' ? '' : 'darkgreen1'}"
          noHoverEffect="{proposal.state === 'closed'}"
          on:clicked="{() => initVote()}"
        />
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
      <div class="mt-3 mb-3">
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
  </div>
</div>
