import axios from 'axios';
import snapshot from '@snapshot-labs/snapshot.js';
// import global from '../stores/global';
import governance from '../stores/governance';
import account from '../stores/account';

const snapshotHubUrl = 'https://hub.snapshot.org';
const space = 'alchemixstakers.eth';
const client = new snapshot.Client(snapshotHubUrl);
// const archiveProvider = snapshot.utils.getProvider(process.env.NETWORK_ID);

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

function gqlConnector(queryBody) {
  return {
    url: `${snapshotHubUrl}/graphql/`,
    method: 'POST',
    data: {
      query: queryBody,
    },
  };
}

export async function getOpenProposals() {
  const query = `{
    proposals(
      skip: 0
      where: {
        space_in: ["${space}"],
        state: "closed"
      }
      orderBy: "created"
      orderDirection: desc
    ) {
      id
      title
      body
      choices
      start
      end
      snapshot
      state
      author
    }
  }`;
  axios(gqlConnector(query))
    .then((result) => {
      console.log('result of snapshot', result.data.data.proposals);
      _governance.proposals = result.data.data.proposals;
      _governance.fetching = false;
      governance.set({ ..._governance });
    })
    .catch((error) => {
      console.log(error);
    });
}

export async function getProposalVotes(id) {
  // TODO check amount of total votes, adjust query accordingly or loop
  const query = `{
    votes(
      skip: 0
      first: 1000
      where: {
        proposal: "${id}"
      }
    ) {
      choice
    }
  }`;
  axios(gqlConnector(query))
    .then((result) => {
      const votes = result.data.data.votes;
      const outcome = { total: 0 };
      console.log(votes);
      votes.forEach((vote) => {
        if (Object.prototype.hasOwnProperty.call(outcome, vote.choice - 1)) {
          outcome[vote.choice - 1] += 1;
        } else {
          outcome[vote.choice - 1] = 1;
        }
        outcome.total += 1;
      });
      _governance.proposals.find((proposal) => proposal.id === id).results = outcome;
      governance.set({ ..._governance });
    })
    .catch((error) => {
      console.log(error);
    });
}

export async function sendVote(voteData) {
  console.log(_account.signer);
  // TODO check if supplied choice is valid for provided proposal
  await client.vote(_account.signer.provider, _account.address, space, voteData);
}
