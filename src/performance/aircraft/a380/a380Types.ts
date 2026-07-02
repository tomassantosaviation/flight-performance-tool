export type RunwayCondition = 'DRY' | 'WET' | 'CONTAMINATED';

export type Rwycc = 1 | 2 | 3 | 4 | 5 | 6;

export type FlapConfig = 'CONF 1+F' | 'CONF 2' | 'CONF 3';

export type AntiIceConfig = 'OFF' | 'ENG' | 'ENG+WING';

export type ThrustMode = 'FLEX' | 'TOGA';

export interface AircraftVariant {
  code: string;
  aircraftType: string;
  engineType: string;
  oewKg: number;
  mtwKg: number;
  mtowKg: number;
  mlwKg: number;
  mzfwKg: number;
  maxFuelKg: number;
}

export interface TakeoffInput {
  airportIcao: string;
  runwayIdent: string;

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
  cgPercentMac: number;

  flapConfig: FlapConfig;
  runwayCondition: RunwayCondition;
  rwycc?: Rwycc;
  runwayWidthM?: number | null;
  brakeTempC?: number | null;
  packsOn: boolean;
  antiIce: AntiIceConfig;
  thrustMode: ThrustMode;

  weightVariant: AircraftVariant;
}

export interface VSpeedResult {
  source: string;
  pressureAltitudeFt: number;
  selectedAltitudeBandFt: number;
  selectedTempColumn: number;
  selectedWeightBand: string;
  v1: number;
  vr: number;
  v2: number;
}

export interface TakeoffResult {
  status: 'T.O POSSIBLE' | 'T.O NOT POSSIBLE';
  vSpeeds: VSpeedResult;
  flexTempC: number | null;
  selectedTakeoffThrustRatio: number;
  thrustModeUsed: ThrustMode;
  flexForcedToToga: boolean;
  flexReason?: string;
  ths: string;
  headwindKt: number;
  estimatedTireSpeedKt: number;
  crosswindKt: number;
  pressureAltitudeFt: number;
  isaDeviationC: number;
  densityAltitudeFt: number;
  estimatedRequiredToraM: number;
  estimatedRequiredTodaM: number;
  estimatedRequiredAsdaM: number;
  toraMarginM: number;
  todaMarginM: number;
  asdaMarginM: number;
  structuralLimitWeightKg: number;
  fieldLimitWeightKg: number;
  climbLimitWeightKg: number;
  limitingFactor: string;
  warnings: string[];
  notes: string[];
}