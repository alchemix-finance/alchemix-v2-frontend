import axios from 'axios';
import snapshot from '@snapshot-labs/snapshot.js';
// import global from '../stores/global';
import governance from '@stores/governance';
import account from '@stores/account';
import { utils } from 'ethers';

const snapshotHubUrl = 'https://hub.snapshot.org';
const space = 'alchemixstakers.eth';
const client = new snapshot.Client712(snapshotHubUrl);

// let _global;
let _governance;
let _account;

// global.subscribe((val) => {
//   _global = val;
// });

governance.subscribe((val) => {
  _governance = val;
});

account.subscribe((val) => {
  _account = val;
});

// @ts-ignore
const debugging = Boolean(parseInt(import.meta.env.VITE_DEBUG_MODE));

function gqlConnector(queryBody) {
  return {
    url: `${snapshotHubUrl}/graphql/`,
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
  axios(gqlConnector(query))
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
  axios(gqlConnector(query))
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
  axios(gqlConnector(query))
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
