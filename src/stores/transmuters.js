import { writable } from 'svelte/store';

const transmuters = writable({
  fetching: true,
  state: [],
  props: [],
});

export const transmuterContracts = ['TransmuterV2_DAI', 'TransmuterV2_USDC', 'TransmuterV2_USDT'];

export default transmuters;
