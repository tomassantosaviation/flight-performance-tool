import { describe, expect, it } from 'vitest';

import {
  A380_WV003,
  calculateA380Takeoff,
} from './a380Module';

import type { TakeoffInput } from './a380Types';

function createTakeoffInput(
  overrides: Partial<TakeoffInput> = {},
): TakeoffInput {
  return {
    airportIcao: 'LPPT',
    runwayIdent: '20',

    toraM: 5_000,
    todaM: 5_000,
    asdaM: 5_000,

    runwayHeadingDeg: 200,
    elevationFt: 0,
    slopePercent: 0,

    oatC: 15,
    qnhHpa: 1013.25,

    windDirectionDeg: 200,
    windSpeedKt: 0,

    towKg: 399_500,
    cgPercentMac: 30,

    flapConfig: 'CONF 2',
    runwayCondition: 'DRY',
    rwycc: 6,
    runwayWidthM: 60,

    packsOn: true,
    antiIce: 'OFF',
    thrustMode: 'TOGA',

    weightVariant: A380_WV003,

    ...overrides,
  };
}

describe('A380 V-speed weight-band selection', () => {
  it('uses the 380–399 tonne row for 399,500 kg', () => {
    const result = calculateA380Takeoff(
      createTakeoffInput({
        towKg: 399_500,
      }),
    );

    expect(result.vSpeeds.selectedWeightBand).toBe(
      '380-399 t',
    );
  });

  it('uses the 400–419 tonne row at exactly 400,000 kg', () => {
    const result = calculateA380Takeoff(
      createTakeoffInput({
        towKg: 400_000,
      }),
    );

    expect(result.vSpeeds.selectedWeightBand).toBe(
      '400-419 t',
    );
  });

  it('does not fall back to the highest-weight row', () => {
    const result = calculateA380Takeoff(
      createTakeoffInput({
        towKg: 339_500,
      }),
    );

    expect(result.vSpeeds.selectedWeightBand).toBe(
      '320-339 t',
    );

    expect(result.vSpeeds.selectedWeightBand).not.toBe(
      '540-560 t',
    );
  });
});

describe('A380 takeoff wind limits', () => {
  it('accepts exactly 15 kt of tailwind', () => {
    const result = calculateA380Takeoff(
      createTakeoffInput({
        runwayHeadingDeg: 0,
        windDirectionDeg: 180,
        windSpeedKt: 15,
      }),
    );

    expect(
      result.warnings.some((warning) =>
        warning.includes('TAILWIND ABOVE'),
      ),
    ).toBe(false);
  });

  it('rejects more than 15 kt of tailwind', () => {
    const result = calculateA380Takeoff(
      createTakeoffInput({
        runwayHeadingDeg: 0,
        windDirectionDeg: 180,
        windSpeedKt: 16,
      }),
    );

    expect(result.warnings).toContain(
      'TAILWIND ABOVE CERTIFIED TAKEOFF LIMIT 15 KT',
    );
  });

  it('accepts exactly 35 kt crosswind on RWYCC 6', () => {
    const result = calculateA380Takeoff(
      createTakeoffInput({
        runwayHeadingDeg: 0,
        windDirectionDeg: 90,
        windSpeedKt: 35,
        rwycc: 6,
      }),
    );

    expect(
      result.warnings.some((warning) =>
        warning.includes('CROSSWIND ABOVE'),
      ),
    ).toBe(false);
  });

  it('uses gust speed for the crosswind limit check', () => {
    const result = calculateA380Takeoff(
      createTakeoffInput({
        runwayHeadingDeg: 0,
        windDirectionDeg: 90,
        windSpeedKt: 10,
        windGustKt: 36,
        rwycc: 6,
      }),
    );

    expect(result.warnings).toContain(
      'CROSSWIND ABOVE CERTIFIED TAKEOFF LIMIT 35 KT FOR RWYCC 6',
    );

    expect(result.crosswindKt).toBe(10);
  });
});

describe('A380 certified operational checks', () => {
  it('warns when both packs are off', () => {
    const result = calculateA380Takeoff(
      createTakeoffInput({
        packsOn: false,
      }),
    );

    expect(result.warnings).toContain(
      'TAKEOFF WITH BOTH PACKS OFF IS PROHIBITED',
    );
  });

  it('warns when runway width is below 45 m', () => {
    const result = calculateA380Takeoff(
      createTakeoffInput({
        runwayWidthM: 44,
      }),
    );

    expect(result.warnings).toContain(
      'RUNWAY WIDTH BELOW CERTIFIED MINIMUM 45 M',
    );
  });

  it('accepts a runway width of exactly 45 m', () => {
    const result = calculateA380Takeoff(
      createTakeoffInput({
        runwayWidthM: 45,
      }),
    );

    expect(
      result.warnings.some((warning) =>
        warning.includes('RUNWAY WIDTH BELOW'),
      ),
    ).toBe(false);
  });

  it('warns when runway slope exceeds 2 percent', () => {
    const result = calculateA380Takeoff(
      createTakeoffInput({
        slopePercent: 2.1,
      }),
    );

    expect(result.warnings).toContain(
      'RUNWAY MEAN SLOPE OUTSIDE CERTIFIED LIMIT ±2 %',
    );
  });

  it('forces TOGA when FLEX is requested on a contaminated runway', () => {
    const result = calculateA380Takeoff(
      createTakeoffInput({
        runwayCondition: 'CONTAMINATED',
        rwycc: 3,
        thrustMode: 'FLEX',
      }),
    );

    expect(result.thrustModeUsed).toBe('TOGA');
    expect(result.flexTempC).toBeNull();
    expect(result.flexForcedToToga).toBe(true);
    expect(result.flexReason).toBe(
      'FLEX NOT ALLOWED ON CONTAMINATED RUNWAYS',
    );
  });
});