import { writable } from 'svelte/store';

export enum VisMode {
    PHYS,
    LINK,
    IP,
    APP
  }

// Canvas settings
export let visMode = writable<VisMode>(VisMode.APP);
export let speed = writable<Number>(1);                     // 1-100, ticks per second
export let selectedNodeID = writable<String>(undefined);    // Random ID for each graph node