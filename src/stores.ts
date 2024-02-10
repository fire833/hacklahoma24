import { writable } from 'svelte/store';

export enum VisMode {
    PHYS,
    LINK,
    IP,
    APP
  }

export let visMode = writable(VisMode.APP);