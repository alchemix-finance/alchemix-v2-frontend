import { writable } from 'svelte/store';

export const modal = writable(null);
export const windowStyle = writable({});

export const modalStyle = {
  styleBg: {
    backdropFilter: 'blur(4px)',
  },
  styleWindow: {
    backgroundColor: '#171B24',
    borderColor: '#171B24',
    color: '#f5f5f5',
  },
  styleContent: {
    padding: 0,
  },
  closeButton: false,
};
