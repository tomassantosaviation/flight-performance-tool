import { a380Module } from './a380/a380Module';

export const aircraftRegistry = {
  [a380Module.id]: {
    ...a380Module,
    displayName: 'Airbus A380-842 | Trent 972B-84 | WV003',
    shortName: 'A380-842',
    description:
      'Simulator-oriented A380-842 performance module using WV003 weights and Trent 972B-84 assumptions.',
  },
};

export type AircraftId = keyof typeof aircraftRegistry;