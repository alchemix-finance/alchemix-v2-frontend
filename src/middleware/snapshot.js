import axios from 'axios';
// import global from '../stores/global';
import governance from '../stores/governance';

// let _global;
let _governance;

// global.subscribe((val) => {
//   _global = val;
// });

governance.subscribe((val) => {
  _governance = val;
});

function connector(queryBody) {
  return {
    url: 'https://hub.snapshot.org/graphql/',
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
        space_in: ["alchemixstakers.eth"],
        state: "active"
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
  axios(connector(query))
    .then((result) => {
      console.log('result of snapshot', result.data.data);
      _governance.proposals = result.data.data.proposals;
      _governance.fetching = false;
      governance.set({ ..._governance });
    })
    .catch((error) => {
      console.log(error);
    });
}
