import { writable } from 'svelte/store';

export const flarum = writable({
  fetching: true,
  posts: [],
});
