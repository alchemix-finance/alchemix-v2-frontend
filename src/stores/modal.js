import { writable } from 'svelte/store';

const defaults = {
  modalComponent: undefined,
  modalProps: {},
};

export const modal = writable(defaults.modal);

export const showModal = (component, props = {}) => {
  if (!component) {
    console.warn('Modal component not passed');
    return;
  }

  modal.set({
    modalComponent: component,
    modalProps: props,
  });
};

export const hideModal = () => {
  modal.set({
    modalComponent: undefined,
    modalProps: {},
  });
};
