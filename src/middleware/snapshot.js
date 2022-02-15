import axios from 'axios';
import snapshot from '@snapshot-labs/snapshot.js';
// import global from '../stores/global';
import governance from '../stores/governance';
import account from '@stores/account';

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

const debugging = Boolean(parseInt(process.env.DEBUG_MODE, 10));

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

export async function sendVote(voteData) {
  if (debugging) console.log(_account.signer);
  // TODO check if supplied choice is valid for provided proposal
  // TODO callback to directly reflect a success/failure of voting on the governance page
  try {
    await client.vote(_account.signer.provider, _account.address, space, voteData);
    await getVotesForAddress();
    return true;
  } catch (e) {
    console.trace(e);
    return false;
  }
}
