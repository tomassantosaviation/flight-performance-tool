import type { TakeoffPerformanceInput, TakeoffPerformanceResult } from '../../common/types';

import {
  calculateTakeoffPerformance,
  DEFAULT_WEIGHT_VARIANT,
  type AntiIceConfig,
  type FlapConfig,
  type PilotInput,
  type RunwayCondition,
  type ThrustMode,
} from './a380TakeoffCore';

export function calculateA380TakeoffPerformance(
  input: TakeoffPerformanceInput,
): TakeoffPerformanceResult {
  const coreInput: PilotInput = {
    airportIcao: input.airportIcao,
    runwayIdent: input.runwayIdent,
    runwaySurface: input.runwaySurface ?? 'UNKNOWN',

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
    cgPercentMac: input.takeoffCgPercentMac ?? 32,

    flapConfig: input.flapConfig as FlapConfig,
    runwayCondition: input.runwayCondition as RunwayCondition,
    packsOn: input.packsOn ?? true,
    antiIce: input.antiIce as AntiIceConfig,
    thrustMode: input.thrustMode as ThrustMode,

    weightVariant: DEFAULT_WEIGHT_VARIANT,
  };

  const result = calculateTakeoffPerformance(coreInput);

  return {
    status: result.status,

    v1: result.vSpeeds.v1,
    vr: result.vSpeeds.vr,
    v2: result.vSpeeds.v2,

    flexTempC: result.flexTempC,
    usedThrustMode: result.thrustModeUsed,
    thrustRatio: result.selectedTakeoffThrustRatio,

    trim: result.ths,

    requiredToraM: result.estimatedRequiredToraM,
    requiredTodaM: result.estimatedRequiredTodaM,
    requiredAsdaM: result.estimatedRequiredAsdaM,

    toraMarginM: result.toraMarginM,
    todaMarginM: result.todaMarginM,
    asdaMarginM: result.asdaMarginM,

    fieldLimitWeightKg: result.fieldLimitWeightKg,
    climbLimitWeightKg: result.climbLimitWeightKg,

    limitingFactor: result.limitingFactor,

    warnings: result.warnings,
    notes: result.notes,
  };
}