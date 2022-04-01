import { writable } from 'svelte/store';

const errorLog = writable([]);

export default errorLog;
