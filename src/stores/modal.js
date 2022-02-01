import { writable } from 'svelte/store';

const defaults = {
  component: undefined,
  props: {},
};

export const modal = writable(defaults);

export const showModal = (component, props = {}) => {
  if (!component) {
    console.warn('Modal component not passed');
    return;
  }

  modal.set({
    component,
    props,
  });
};

export const hideModal = () => {
  modal.set({
    component: undefined,
    props: {},
  });
};
