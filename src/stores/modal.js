import { writable } from 'svelte/store';

export const modal = writable(null);
export const windowStyle = writable({});

export const modalStyle = {
  styleBg: {
    backdropFilter: 'blur(4px)',
  },
  styleWindow: {
    backgroundColor: 'rgb(23, 27, 36)',
    borderColor: 'rgb(32, 36, 44)',
    border: '1px solid',
    color: '#f5f5f5',
  },
  closeButton: false,
};
