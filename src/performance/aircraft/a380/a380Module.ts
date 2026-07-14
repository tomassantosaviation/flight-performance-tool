import type { AircraftVariant, TakeoffInput, TakeoffResult } from './a380Types';
import { calculateTakeoffPerformance } from './a380Core';

export const A380_WV003: AircraftVariant = {
  code: 'WV003',
  aircraftType: 'A380-842',
  engineType: 'Rolls-Royce Trent 972B-84',
  oewKg: 300_007,
  mtwKg: 512_000,
  mtowKg: 510_000,
  mlwKg: 395_000,
  mzfwKg: 373_000,
  maxFuelKg: 209_993,
};

export interface AircraftPerformanceModule {
  id: string;
  manufacturer: string;
  aircraftName: string;
  defaultVariant: AircraftVariant;
  variants: AircraftVariant[];
  calculateTakeoff: (input: TakeoffInput) => TakeoffResult;
}

export function calculateA380Takeoff(
  input: TakeoffInput,
): TakeoffResult {
  return calculateTakeoffPerformance({
    ...input,

    // Kept for compatibility with the browser-safe calculator core.
    runwaySurface: 'UNKNOWN',
  });
}

export const a380Module: AircraftPerformanceModule = {
  id: 'A380-842-RR-WV003',
  manufacturer: 'Airbus',
  aircraftName: 'A380-842',
  defaultVariant: A380_WV003,
  variants: [A380_WV003],
  calculateTakeoff: calculateA380Takeoff,
};