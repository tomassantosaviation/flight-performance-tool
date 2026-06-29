import type { AircraftPerformanceModule } from '../../common/types';
import { A380_AIRCRAFT_ID, A380_AIRCRAFT_INFO, A380_DEFAULT_TAKEOFF_INPUT } from './a380Data';
import { calculateA380TakeoffPerformance } from './a380Takeoff';

export const a380PerformanceModule: AircraftPerformanceModule = {
  id: A380_AIRCRAFT_ID,
  manufacturer: A380_AIRCRAFT_INFO.manufacturer,
  displayName: A380_AIRCRAFT_INFO.displayName,
  shortName: A380_AIRCRAFT_INFO.shortName,
  description: A380_AIRCRAFT_INFO.description,

  aircraftName: 'A380-842',

  defaultVariant: {
    code: 'WV003',
    aircraftType: 'A380-842',
    engineType: 'Rolls-Royce Trent 972B-84',
    oewKg: 300_007,
    mtwKg: 512_000,
    mtowKg: 510_000,
    mlwKg: 395_000,
    mzfwKg: 373_000,
    maxFuelKg: 209_993,
  },

  calculateTakeoff: calculateA380TakeoffPerformance,

  takeoff: {
    supported: true,

    flapConfigs: ['CONF 1+F', 'CONF 2', 'CONF 3'],
    runwayConditions: ['DRY', 'WET', 'CONTAMINATED'],
    antiIceOptions: ['OFF', 'ENG', 'ENG+WING'],
    thrustModes: ['FLEX', 'TOGA'],

    defaultInput: A380_DEFAULT_TAKEOFF_INPUT,

    calculate: calculateA380TakeoffPerformance,
  },

  landing: {
    supported: false,
  },
};