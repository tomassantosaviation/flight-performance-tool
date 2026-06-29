export type RunwayCondition = 'DRY' | 'WET' | 'CONTAMINATED';

export type PerformanceStatus = 'T.O POSSIBLE' | 'T.O NOT POSSIBLE';

export interface TakeoffPerformanceInput {
  aircraftId: string;

  airportIcao: string;
  runwayIdent: string;
  runwaySurface?: string;

  toraM: number;
  todaM: number;
  asdaM: number;

  runwayHeadingDeg: number;
  elevationFt: number;
  slopePercent: number;

  oatC: number;
  qnhHpa: number;
  windDirectionDeg: number;
  windSpeedKt: number;

  towKg: number;
  takeoffCgPercentMac?: number;

  flapConfig: string;
  runwayCondition: RunwayCondition;
  packsOn?: boolean;
  antiIce: string;
  thrustMode: string;
}

export interface TakeoffPerformanceResult {
  status: PerformanceStatus;

  v1: number | null;
  vr: number | null;
  v2: number | null;

  flexTempC: number | null;
  usedThrustMode: string;
  thrustRatio: number | null;

  trim: string | null;

  requiredToraM: number | null;
  requiredTodaM: number | null;
  requiredAsdaM: number | null;

  toraMarginM: number | null;
  todaMarginM: number | null;
  asdaMarginM: number | null;

  fieldLimitWeightKg: number | null;
  climbLimitWeightKg: number | null;

  limitingFactor: string;

  warnings: string[];
  notes: string[];
}

export interface AircraftTakeoffModule {
  supported: boolean;

  flapConfigs: string[];
  runwayConditions: RunwayCondition[];
  antiIceOptions: string[];
  thrustModes: string[];

  defaultInput: Omit<TakeoffPerformanceInput, 'aircraftId'>;

  calculate(input: TakeoffPerformanceInput): TakeoffPerformanceResult;
}

export interface AircraftPerformanceModule {
  id: string;
  manufacturer: 'Airbus' | 'Boeing' | 'Other';
  displayName: string;
  shortName: string;
  description: string;

  aircraftName: string;

  defaultVariant: {
    code: string;
    aircraftType: string;
    engineType: string;
    oewKg: number;
    mtwKg: number;
    mtowKg: number;
    mlwKg: number;
    mzfwKg: number;
    maxFuelKg: number;
  };

  calculateTakeoff: (input: any) => any;

  takeoff: AircraftTakeoffModule;

  landing?: {
    supported: boolean;
  };
}