import type {
  AircraftVariant,
  TakeoffInput,
  TakeoffResult,
} from './a380/a380Types';

import {
  calculateTakeoffPerformance,
  DEFAULT_WEIGHT_VARIANT,
  type AntiIceConfig,
  type FlapConfig,
  type PilotInput,
  type RunwayCondition,
  type ThrustMode,
} from './a380/a380TakeoffCore';

const A380_WV003: AircraftVariant = {
  code: DEFAULT_WEIGHT_VARIANT.code,
  aircraftType: DEFAULT_WEIGHT_VARIANT.aircraftType,
  engineType: DEFAULT_WEIGHT_VARIANT.engineType,
  oewKg: DEFAULT_WEIGHT_VARIANT.oewKg,
  mtwKg: DEFAULT_WEIGHT_VARIANT.mtwKg,
  mtowKg: DEFAULT_WEIGHT_VARIANT.mtowKg,
  mlwKg: DEFAULT_WEIGHT_VARIANT.mlwKg,
  mzfwKg: DEFAULT_WEIGHT_VARIANT.mzfwKg,
  maxFuelKg: DEFAULT_WEIGHT_VARIANT.maxFuelKg,
};

function calculateA380Takeoff(input: TakeoffInput): TakeoffResult {
  const coreInput: PilotInput = {
    airportIcao: input.airportIcao,
    runwayIdent: input.runwayIdent,
    runwaySurface: 'UNKNOWN',

    toraM: input.toraM,
    todaM: input.todaM,
    asdaM: input.asdaM,

    runwayHeadingDeg: input.runwayHeadingDeg,
    elevationFt: input.elevationFt,
    slopePercent: input.slopePercent,

    oatC: input.oatC,
    qnhHpa: input.qnhHpa,
    windDirectionDeg: input.windDirectionDeg,
    windSpeedKt: input.windSpeedKt,

    towKg: input.towKg,
    cgPercentMac: input.cgPercentMac,

    flapConfig: input.flapConfig as FlapConfig,
    runwayCondition: input.runwayCondition as RunwayCondition,
    packsOn: input.packsOn,
    antiIce: input.antiIce as AntiIceConfig,
    thrustMode: input.thrustMode as ThrustMode,

    weightVariant: DEFAULT_WEIGHT_VARIANT,
  };

  return calculateTakeoffPerformance(coreInput) as unknown as TakeoffResult;
}

export const aircraftRegistry = {
  'a380-842-trent-972b-wv003': {
    id: 'a380-842-trent-972b-wv003',
    manufacturer: 'Airbus',
    aircraftName: 'A380-842',
    displayName: 'Airbus A380-842 | Trent 972B-84 | WV003',
    shortName: 'A380-842',
    description:
      'Simulator-oriented A380-842 performance module using WV003 weights and Trent 972B-84 assumptions.',
    defaultVariant: A380_WV003,
    calculateTakeoff: calculateA380Takeoff,
  },
};

export type AircraftId = keyof typeof aircraftRegistry;