import { writable } from 'svelte/store';

const localReceipts = JSON.parse(localStorage.getItem('connextReceipts'));

const connextReceipts = writable(localReceipts || []);
connextReceipts.subscribe((val) => {
  localStorage.setItem('connextReceipts', JSON.stringify(val));
});

export { connextReceipts };
