import { writable } from 'svelte/store';

const defaults = {
  modal: null,
  windowStyle: {},
  modalStyle: {
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
  },
};

export const modal = writable(defaults.modal);
export const windowStyle = writable(defaults.windowStyle);

export const modalStyle = {
  ...defaults.modalStyle,
};

export const modalReset = () => {
  modal.set(defaults.modal);
  windowStyle.set(defaults.windowStyle);
};
