import { writable } from 'svelte/store';

const localMute = JSON.parse(localStorage.getItem('pingVotes'));

const defaults = {
  fetching: true,
  proposals: [],
  userVotes: [],
  activeVotes: localMute || [],
};

const governance = writable({
  ...defaults,
});

governance.subscribe((value) => {
  localStorage.setItem('pingVotes', JSON.stringify(value.activeVotes));
});

export const governanceReset = () => {
  governance.set({ ...defaults });
};

export default governance;
