import { writable } from 'svelte/store';

const localErrors = JSON.parse(localStorage.getItem('errors'));

const errorLog = writable(localErrors || []);

errorLog.subscribe((val) => {
  localStorage.setItem('errors', JSON.stringify(val));
});

export default errorLog;
