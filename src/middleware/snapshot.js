import axios from 'axios';
import snapshot from '@snapshot-labs/snapshot.js';
import governance from '@stores/governance';
import account from '@stores/account';
import { utils } from 'ethers';
import { externalContractWrapper } from '@helpers/contractWrapper';

const snapshotHubUrl = 'https://hub.snapshot.org';
const snapshotSubgraphUrl = 'https://api.thegraph.com/subgraphs/name/snapshot-labs/snapshot';
const space = 'alchemixstakers.eth';
const client = new snapshot.Client712(snapshotHubUrl);

let _governance;
let _account;

governance.subscribe((val) => {
  _governance = val;
});

account.subscribe((val) => {
  _account = val;
});

// @ts-ignore
const debugging = Boolean(parseInt(import.meta.env.VITE_DEBUG_MODE));

function gqlConnector(endpoint, queryBody) {
  return {
    url: endpoint,
    method: 'POST',
    data: {
      query: queryBody,
    },
  };
}

export async function getVotesForAddress() {
  const query = `{
    votes (
      first: 100
      skip: 0
      where: {
        voter: "${_account.address}",
        space: "alchemixstakers.eth"
      }
    ) {
      id
      voter
      created
      choice
      proposal {
        id
      }
    }
  }`;
  axios(gqlConnector(`${snapshotHubUrl}/graphql/`, query))
    .then((result) => {
      if (debugging) console.table(result.data.data.votes);
      _governance.userVotes = result.data.data.votes;
      governance.set({ ..._governance });
    })
    .catch((error) => {
      console.log(error);
    });
}

export async function getOpenProposals() {
  const query = `{
    proposals(
      skip: 0
      where: {
        space_in: ["${space}"]
      }
      orderBy: "created"
      orderDirection: desc
    ) {
      id
      ipfs
      title
      body
      choices
      scores
      scores_total
      start
      end
      snapshot
      state
      author
      discussion
      type
    }
  }`;
  axios(gqlConnector(`${snapshotHubUrl}/graphql/`, query))
    .then((result) => {
      if (debugging) console.table(result.data.data.proposals);
      _governance.proposals = result.data.data.proposals;
      _governance.fetching = false;
      governance.set({ ..._governance });
    })
    .catch((error) => {
      console.log(error);
    });
}

export async function queryOpenProposals() {
  const query = `{
    proposals(
      skip: 0
      where: {
        space_in: ["${space}"],
        state: "active"
      }
      orderBy: "created"
      orderDirection: desc
    ) {
      id
    }
  }`;
  axios(gqlConnector(`${snapshotHubUrl}/graphql/`, query))
    .then((result) => {
      const idCheck = _governance.activeVotes.map((prop) => {
        return prop.id;
      });
      _governance.activeVotes = result.data.data.proposals.map((proposal) => {
        if ((idCheck.length > 0 && idCheck.indexOf(proposal.id) < 0) || idCheck.length === 0) {
          return {
            id: proposal.id,
            mute: false,
          };
        } else {
          const localItem = JSON.parse(localStorage.getItem('pingVotes')).filter(
            (item) => item.id === proposal.id,
          )[0];
          return {
            id: localItem.id,
            mute: localItem.mute,
          };
        }
      });
      governance.set({ ..._governance });
    })
    .catch((error) => {
      console.log(error);
    });
}

export async function sendVote(voteData) {
  if (debugging) console.log(_account.signer);
  try {
    await client.vote(_account.provider, utils.getAddress(_account.address), {
      app: 'alchemix',
      proposal: voteData.proposal,
      choice: voteData.choice,
      space: space,
      type: voteData.type,
    });
    await getVotesForAddress();
    return true;
  } catch (e) {
    console.trace(e);
    return e;
  }
}

export async function setDelegate(address) {
  try {
    const delegateRegistry = await externalContractWrapper('DelegateRegistry', _account.signer);
    await delegateRegistry.instance.setDelegate(utils.formatBytes32String(space), address);
    return true;
  } catch (error) {
    console.trace(error);
    return error;
  }
}

export async function queryDelegations(direction) {
  const querySetup = {
    from: ['delegator', 'delegate'],
    to: ['delegate', 'delegator'],
  };
  const query = `{
          delegations(where: {space_in: ["alchemixstakers", "alchemixstakers.eth"] ${querySetup[direction][0]}: "${_account.address}"}) {
            ${querySetup[direction][1]}
          }
        }`;
  axios(gqlConnector(snapshotSubgraphUrl, query))
    .then((result) => {
      return result.data.data.delegations
        .map((entry) => Object.values(entry))
        .reduce((a, b) => a.concat(b), []);
    })
    .catch((error) => {
      console.log(error);
    });
}
