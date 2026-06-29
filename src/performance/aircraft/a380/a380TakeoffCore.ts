// A380 Takeoff Performance Core
// SIMULATION TOOL ONLY.
// NOT FOR REAL WORLD AVIATION.

export type RunwayCondition = 'DRY' | 'WET' | 'CONTAMINATED';
export type FlapConfig = 'CONF 1+F' | 'CONF 2' | 'CONF 3';
export type AntiIceConfig = 'OFF' | 'ENG' | 'ENG+WING';
export type ThrustMode = 'FLEX' | 'TOGA';

export interface A380WeightVariant {
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

export interface PilotInput {
  airportIcao: string;
  runwayIdent: string;
  runwaySurface: string;
  intersectionName?: string;

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
  packsOn: boolean;
  antiIce: AntiIceConfig;
  thrustMode: ThrustMode;

  weightVariant: A380WeightVariant;
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

export const DEFAULT_WEIGHT_VARIANT: A380WeightVariant = {
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

const TRENT_972B_84_ENGINE = {
  model: 'Trent 972B-84',

  takeoffNetThrustKn: 356.81,
  equivalentBareTakeoffThrustKn: 361.51,
  maxContinuousNetThrustKn: 319.6,
  equivalentBareMaxContinuousThrustKn: 323.91,

  takeoffLimitMinutes: 5,
  takeoffLimitOeiMinutes: 10,

  flatRatedIsaDeviationC: 10,
  maxAmbientIsaDeviationC: 40,
  maxFlexTempC: 65,

  maxTakeoffTgtTrimmedC: 900,
  maxContinuousTgtTrimmedC: 850,
  maxOvertempTgtTrimmedC: 920,

  assumedTempDeratePerDegAboveFlatRating: 0.0065,

  thrustToDistanceExponent: 1.05,
  thrustToClimbExponent: 1.0,
};

const A380_PERF_PLACEHOLDERS = {
  maxTailwindKt: 10,
  maxCrosswindDryKt: 40,
  maxCrosswindWetKt: 30,
  maxCrosswindContaminatedKt: 15,

  maxFlexTempC: TRENT_972B_84_ENGINE.maxFlexTempC,
  minFlexAboveOatC: 5,

  uphillSlopePenaltyMPerPercent: 180,
  downhillSlopeCreditMPerPercent: 80,
  headwindCreditMPerKt: 18,
  tailwindPenaltyMPerKt: 80,

  wetRunwayPenaltyM: 300,
  contaminatedRunwayPenaltyM: 900,

  packsOnPenaltyM: 120,
  engineAntiIcePenaltyM: 120,
  wingAntiIcePenaltyM: 260,

  fieldHotIsaPenaltyPerDegC: 0.006,
  fieldColdIsaCreditPerDegC: 0.002,
  minFieldTemperatureFactor: 0.92,
  maxFieldTemperatureFactor: 1.25,

  seaLevelIsaClimbLimitKg: 575_000,
  pressureAltitudeClimbPenaltyKgPer1000Ft: 7_500,
  hotDayClimbPenaltyKgPerDegIsa: 1_200,
  packsOnClimbPenaltyKg: 2_500,
  engineAntiIceClimbPenaltyKg: 3_000,
  wingAntiIceClimbPenaltyKg: 6_500,
};

interface FieldLimitChartPoint {
  runwayLengthM: number;
  maxTowKg: number;
}

interface FieldLimitChartCurve {
  pressureAltitudeFt: number;
  points: FieldLimitChartPoint[];
}

const A380_FIELD_LIMIT_CHART_ISA_TRENT900: FieldLimitChartCurve[] = [
  {
    pressureAltitudeFt: 0,
    points: [
      { runwayLengthM: 1500, maxTowKg: 385_000 },
      { runwayLengthM: 1700, maxTowKg: 440_000 },
      { runwayLengthM: 2000, maxTowKg: 480_000 },
      { runwayLengthM: 2500, maxTowKg: 530_000 },
      { runwayLengthM: 3000, maxTowKg: 575_000 },
      { runwayLengthM: 3500, maxTowKg: 600_000 },
      { runwayLengthM: 4000, maxTowKg: 615_000 },
      { runwayLengthM: 4500, maxTowKg: 627_000 },
      { runwayLengthM: 5200, maxTowKg: 637_000 },
    ],
  },
  {
    pressureAltitudeFt: 2000,
    points: [
      { runwayLengthM: 1500, maxTowKg: 375_000 },
      { runwayLengthM: 1700, maxTowKg: 420_000 },
      { runwayLengthM: 2000, maxTowKg: 455_000 },
      { runwayLengthM: 2500, maxTowKg: 500_000 },
      { runwayLengthM: 3000, maxTowKg: 555_000 },
      { runwayLengthM: 3500, maxTowKg: 575_000 },
      { runwayLengthM: 4000, maxTowKg: 590_000 },
      { runwayLengthM: 4500, maxTowKg: 602_000 },
      { runwayLengthM: 5200, maxTowKg: 612_000 },
    ],
  },
  {
    pressureAltitudeFt: 4000,
    points: [
      { runwayLengthM: 1500, maxTowKg: 360_000 },
      { runwayLengthM: 1700, maxTowKg: 400_000 },
      { runwayLengthM: 2000, maxTowKg: 435_000 },
      { runwayLengthM: 2500, maxTowKg: 475_000 },
      { runwayLengthM: 3000, maxTowKg: 530_000 },
      { runwayLengthM: 3500, maxTowKg: 548_000 },
      { runwayLengthM: 4000, maxTowKg: 565_000 },
      { runwayLengthM: 4500, maxTowKg: 575_000 },
      { runwayLengthM: 5200, maxTowKg: 588_000 },
    ],
  },
  {
    pressureAltitudeFt: 6000,
    points: [
      { runwayLengthM: 1500, maxTowKg: 345_000 },
      { runwayLengthM: 1700, maxTowKg: 382_000 },
      { runwayLengthM: 2000, maxTowKg: 410_000 },
      { runwayLengthM: 2500, maxTowKg: 455_000 },
      { runwayLengthM: 3000, maxTowKg: 510_000 },
      { runwayLengthM: 3500, maxTowKg: 525_000 },
      { runwayLengthM: 4000, maxTowKg: 540_000 },
      { runwayLengthM: 4500, maxTowKg: 555_000 },
      { runwayLengthM: 5200, maxTowKg: 562_000 },
    ],
  },
  {
    pressureAltitudeFt: 8000,
    points: [
      { runwayLengthM: 1500, maxTowKg: 340_000 },
      { runwayLengthM: 1700, maxTowKg: 370_000 },
      { runwayLengthM: 2000, maxTowKg: 395_000 },
      { runwayLengthM: 2500, maxTowKg: 440_000 },
      { runwayLengthM: 3000, maxTowKg: 485_000 },
      { runwayLengthM: 3500, maxTowKg: 500_000 },
      { runwayLengthM: 4000, maxTowKg: 515_000 },
      { runwayLengthM: 4500, maxTowKg: 525_000 },
      { runwayLengthM: 5200, maxTowKg: 537_000 },
    ],
  },
];

const VSPEED_TABLES: Record<
  FlapConfig,
  Array<{
    minWeightKg: number;
    maxWeightKg: number;
    speeds: readonly [
      readonly [number, number, number],
      readonly [number, number, number],
      readonly [number, number, number],
      readonly [number, number, number],
    ];
  }>
> = {
  'CONF 1+F': [
    { minWeightKg: 300_000, maxWeightKg: 319_000, speeds: [[130, 145, 154], [132, 147, 154], [134, 149, 154], [137, 152, 155]] },
    { minWeightKg: 320_000, maxWeightKg: 339_000, speeds: [[131, 147, 155], [133, 149, 155], [135, 151, 155], [138, 154, 156]] },
    { minWeightKg: 340_000, maxWeightKg: 359_000, speeds: [[132, 149, 157], [134, 151, 157], [136, 153, 157], [139, 156, 158]] },
    { minWeightKg: 360_000, maxWeightKg: 379_000, speeds: [[133, 150, 159], [135, 152, 159], [137, 154, 159], [140, 157, 160]] },
    { minWeightKg: 380_000, maxWeightKg: 399_000, speeds: [[134, 151, 161], [136, 153, 161], [138, 155, 161], [141, 158, 162]] },
    { minWeightKg: 400_000, maxWeightKg: 419_000, speeds: [[135, 152, 163], [137, 154, 163], [139, 156, 163], [142, 159, 164]] },
    { minWeightKg: 420_000, maxWeightKg: 439_000, speeds: [[136, 153, 165], [138, 155, 165], [140, 157, 165], [143, 160, 166]] },
    { minWeightKg: 440_000, maxWeightKg: 459_000, speeds: [[137, 154, 167], [139, 156, 167], [141, 158, 167], [144, 161, 168]] },
    { minWeightKg: 460_000, maxWeightKg: 479_000, speeds: [[138, 155, 169], [140, 157, 169], [142, 159, 169], [145, 162, 170]] },
    { minWeightKg: 480_000, maxWeightKg: 499_000, speeds: [[139, 156, 172], [141, 158, 172], [143, 160, 172], [146, 163, 173]] },
    { minWeightKg: 500_000, maxWeightKg: 519_000, speeds: [[140, 157, 175], [142, 159, 175], [144, 161, 175], [147, 164, 176]] },
    { minWeightKg: 520_000, maxWeightKg: 539_000, speeds: [[141, 158, 177], [143, 160, 177], [145, 162, 177], [148, 165, 178]] },
    { minWeightKg: 540_000, maxWeightKg: 560_000, speeds: [[143, 160, 178], [145, 162, 178], [147, 164, 178], [150, 167, 179]] },
  ],

  'CONF 2': [
    { minWeightKg: 300_000, maxWeightKg: 319_000, speeds: [[128, 134, 151], [129, 135, 151], [131, 138, 151], [134, 141, 152]] },
    { minWeightKg: 320_000, maxWeightKg: 339_000, speeds: [[129, 135, 152], [130, 136, 152], [133, 139, 152], [135, 143, 153]] },
    { minWeightKg: 340_000, maxWeightKg: 359_000, speeds: [[130, 136, 154], [131, 137, 154], [134, 140, 154], [136, 144, 155]] },
    { minWeightKg: 360_000, maxWeightKg: 379_000, speeds: [[131, 137, 156], [132, 138, 156], [135, 141, 156], [137, 145, 157]] },
    { minWeightKg: 380_000, maxWeightKg: 399_000, speeds: [[132, 138, 158], [133, 139, 158], [136, 142, 158], [138, 147, 159]] },
    { minWeightKg: 400_000, maxWeightKg: 419_000, speeds: [[133, 139, 160], [134, 140, 160], [137, 143, 160], [139, 149, 161]] },
    { minWeightKg: 420_000, maxWeightKg: 439_000, speeds: [[134, 140, 162], [135, 141, 162], [138, 144, 162], [140, 150, 163]] },
    { minWeightKg: 440_000, maxWeightKg: 459_000, speeds: [[135, 141, 164], [136, 142, 164], [139, 145, 164], [141, 151, 165]] },
    { minWeightKg: 460_000, maxWeightKg: 479_000, speeds: [[136, 143, 166], [137, 144, 166], [140, 147, 166], [142, 153, 167]] },
    { minWeightKg: 480_000, maxWeightKg: 499_000, speeds: [[137, 146, 169], [138, 147, 169], [141, 151, 169], [143, 155, 170]] },
    { minWeightKg: 500_000, maxWeightKg: 519_000, speeds: [[138, 148, 172], [139, 149, 172], [142, 154, 172], [144, 158, 173]] },
    { minWeightKg: 520_000, maxWeightKg: 539_000, speeds: [[139, 152, 174], [140, 153, 174], [143, 157, 174], [145, 159, 174]] },
    { minWeightKg: 540_000, maxWeightKg: 560_000, speeds: [[141, 155, 175], [142, 158, 175], [144, 160, 175], [146, 161, 175]] },
  ],

  'CONF 3': [
    { minWeightKg: 300_000, maxWeightKg: 319_000, speeds: [[121, 129, 148], [123, 131, 148], [125, 133, 148], [128, 134, 150]] },
    { minWeightKg: 320_000, maxWeightKg: 339_000, speeds: [[122, 130, 149], [124, 132, 149], [126, 134, 149], [129, 135, 151]] },
    { minWeightKg: 340_000, maxWeightKg: 359_000, speeds: [[123, 131, 151], [125, 133, 151], [127, 135, 151], [130, 136, 153]] },
    { minWeightKg: 360_000, maxWeightKg: 379_000, speeds: [[124, 132, 153], [126, 134, 153], [128, 136, 153], [131, 137, 155]] },
    { minWeightKg: 380_000, maxWeightKg: 399_000, speeds: [[125, 133, 155], [127, 135, 155], [129, 137, 155], [132, 138, 157]] },
    { minWeightKg: 400_000, maxWeightKg: 419_000, speeds: [[126, 134, 157], [128, 136, 157], [130, 138, 157], [133, 139, 159]] },
    { minWeightKg: 420_000, maxWeightKg: 439_000, speeds: [[127, 135, 159], [129, 137, 159], [131, 139, 159], [134, 140, 161]] },
    { minWeightKg: 440_000, maxWeightKg: 459_000, speeds: [[128, 136, 161], [131, 138, 161], [132, 140, 161], [135, 141, 163]] },
    { minWeightKg: 460_000, maxWeightKg: 479_000, speeds: [[130, 137, 163], [132, 139, 163], [133, 141, 163], [136, 142, 165]] },
    { minWeightKg: 480_000, maxWeightKg: 499_000, speeds: [[131, 138, 166], [133, 140, 166], [135, 142, 166], [137, 143, 168]] },
    { minWeightKg: 500_000, maxWeightKg: 519_000, speeds: [[132, 139, 169], [134, 141, 169], [136, 144, 169], [139, 145, 171]] },
    { minWeightKg: 520_000, maxWeightKg: 539_000, speeds: [[133, 140, 171], [135, 142, 171], [137, 146, 171], [140, 148, 173]] },
    { minWeightKg: 540_000, maxWeightKg: 560_000, speeds: [[135, 141, 172], [137, 143, 172], [139, 148, 172], [142, 152, 174]] },
  ],
};

export function calculateTakeoffPerformance(input: PilotInput): TakeoffResult {
  const vSpeeds = calculateVSpeedsFromChart(input);

  const pressureAltitudeFt = calculatePressureAltitude(
    input.elevationFt,
    input.qnhHpa,
  );
  const isaTempC = getIsaTemperatureC(input.elevationFt);
  const isaDeviationC = input.oatC - isaTempC;
  const densityAltitudeFt = pressureAltitudeFt + 118.8 * isaDeviationC;

  const wind = calculateWindComponents(
    input.windDirectionDeg,
    input.windSpeedKt,
    input.runwayHeadingDeg,
  );

  const togaPossible = isTakeoffPossibleAtThrustRatio(
    input,
    pressureAltitudeFt,
    isaDeviationC,
    densityAltitudeFt,
    wind.headwindKt,
    1,
  );

  const calculatedFlexTempC =
    input.thrustMode === 'TOGA'
      ? null
      : estimateFlexTemp(
          input,
          pressureAltitudeFt,
          isaDeviationC,
          densityAltitudeFt,
          wind.headwindKt,
        );

  const flexForcedToToga =
    input.thrustMode === 'FLEX' && calculatedFlexTempC === null && togaPossible;

  const thrustModeUsed: ThrustMode =
    input.thrustMode === 'TOGA' || calculatedFlexTempC === null
      ? 'TOGA'
      : 'FLEX';

  const flexTempC = thrustModeUsed === 'FLEX' ? calculatedFlexTempC : null;

  const selectedTakeoffThrustRatio =
    thrustModeUsed === 'TOGA' || flexTempC === null
      ? 1
      : getTakeoffThrustRatioForAssumedTemp(input, flexTempC);

  const flexReason =
    input.thrustMode === 'FLEX' && calculatedFlexTempC === null
      ? togaPossible
        ? 'FLEX NOT AVAILABLE - TOGA REQUIRED'
        : 'FLEX NOT AVAILABLE - TOGA ALSO DOES NOT SATISFY PERFORMANCE LIMITS'
      : undefined;

  const estimatedRequiredToraM = estimateRequiredTora(
    input,
    densityAltitudeFt,
    wind.headwindKt,
    selectedTakeoffThrustRatio,
  );

  const estimatedRequiredTodaM = estimateRequiredToda(
    input,
    estimatedRequiredToraM,
  );
  const estimatedRequiredAsdaM = estimateRequiredAsda(
    input,
    estimatedRequiredToraM,
  );

  const toraMarginM = input.toraM - estimatedRequiredToraM;
  const todaMarginM = input.todaM - estimatedRequiredTodaM;
  const asdaMarginM = input.asdaM - estimatedRequiredAsdaM;

  const structuralLimitWeightKg = input.weightVariant.mtowKg;
  const fieldLimitWeightKg = estimateFieldLimitWeight(
    input,
    selectedTakeoffThrustRatio,
  );
  const climbLimitWeightKg = estimateClimbLimitWeight(
    input,
    pressureAltitudeFt,
    isaDeviationC,
    selectedTakeoffThrustRatio,
  );

  const ths = estimateThs(input.cgPercentMac);

  const warnings: string[] = [];
  const notes: string[] = [];

  if (input.towKg > input.weightVariant.mtowKg) {
    warnings.push(
      `STRUCTURAL MTOW EXCEEDED (${Math.round(
        input.weightVariant.mtowKg / 1000,
      )} T LIMIT)`,
    );
  }

  if (input.towKg > fieldLimitWeightKg) {
    warnings.push('FIELD LIMITED - REDUCE TOW / USE LONGER RUNWAY / USE TOGA');
  }

  if (input.towKg > climbLimitWeightKg) {
    warnings.push('CLIMB LIMITED - REDUCE TOW / USE TOGA');
  }

  if (toraMarginM < 0) {
    warnings.push('TORA INSUFFICIENT');
  }

  if (todaMarginM < 0) {
    warnings.push('TODA INSUFFICIENT');
  }

  if (asdaMarginM < 0) {
    warnings.push('ASDA / ACCELERATE-STOP INSUFFICIENT');
  }

  if (wind.headwindKt < -A380_PERF_PLACEHOLDERS.maxTailwindKt) {
    warnings.push(
      `TAILWIND ABOVE PLACEHOLDER LIMIT ${A380_PERF_PLACEHOLDERS.maxTailwindKt} KT`,
    );
  }

  const crosswindLimit =
    input.runwayCondition === 'DRY'
      ? A380_PERF_PLACEHOLDERS.maxCrosswindDryKt
      : input.runwayCondition === 'WET'
        ? A380_PERF_PLACEHOLDERS.maxCrosswindWetKt
        : A380_PERF_PLACEHOLDERS.maxCrosswindContaminatedKt;

  if (Math.abs(wind.crosswindKt) > crosswindLimit) {
    warnings.push(`CROSSWIND ABOVE PLACEHOLDER LIMIT ${crosswindLimit} KT`);
  }

  if (flexForcedToToga) {
    notes.push(
      'FLEX not available for the selected conditions. TOGA has been selected automatically.',
    );
  }

  if (input.thrustMode === 'FLEX' && !togaPossible) {
    warnings.push('TOGA PERFORMANCE NOT SATISFIED - TAKEOFF NOT POSSIBLE');
  }

  if (
    input.thrustMode === 'FLEX' &&
    thrustModeUsed === 'FLEX' &&
    selectedTakeoffThrustRatio >= 0.999
  ) {
    notes.push(
      'Selected FLEX produces no meaningful thrust reduction because assumed temperature is at/below flat-rating range.',
    );
  }

  if (input.runwayCondition !== 'DRY') {
    notes.push('Runway condition correction is placeholder only.');
  }

  if (input.flapConfig !== 'CONF 2') {
    notes.push(
      `${input.flapConfig} V-speeds included, but field-length corrections are not yet configuration-specific.`,
    );
  }

  notes.push(
    'FLEX is selected by binary-searching the highest assumed temperature that still passes field/climb checks.',
  );
  notes.push(
    'Field limit uses approximate digitised A380 Trent 900 ISA runway-length/pressure-altitude chart data.',
  );
  notes.push(
    'Reduced-thrust runway effect is calibrated against public A380 75% vs 100% thrust analysis.',
  );
  notes.push(
    'Trent 972B-84 public TADS/TCDS data gives thrust anchors and limits, but not the real assumed-temperature lapse table.',
  );
  notes.push('V-speeds use the uploaded sim V-speed chart.');
  notes.push('Brake-energy, tire-speed and obstacle logic are placeholders.');
  notes.push('Not real-world operational data.');

  const limitingFactor = determineLimitingFactor(input, {
    structuralLimitWeightKg,
    fieldLimitWeightKg,
    climbLimitWeightKg,
    toraMarginM,
    todaMarginM,
    asdaMarginM,
  });

  return {
    status: warnings.length === 0 ? 'T.O POSSIBLE' : 'T.O NOT POSSIBLE',
    vSpeeds,
    flexTempC,
    selectedTakeoffThrustRatio: round3(selectedTakeoffThrustRatio),
    thrustModeUsed,
    flexForcedToToga,
    flexReason,
    ths,
    headwindKt: round1(wind.headwindKt),
    crosswindKt: round1(wind.crosswindKt),
    pressureAltitudeFt: Math.round(pressureAltitudeFt),
    isaDeviationC: round1(isaDeviationC),
    densityAltitudeFt: Math.round(densityAltitudeFt),
    estimatedRequiredToraM,
    estimatedRequiredTodaM,
    estimatedRequiredAsdaM,
    toraMarginM,
    todaMarginM,
    asdaMarginM,
    structuralLimitWeightKg,
    fieldLimitWeightKg,
    climbLimitWeightKg,
    limitingFactor,
    warnings,
    notes,
  };
}

function calculateVSpeedsFromChart(input: PilotInput): VSpeedResult {
  const pressureAltitudeFt = calculatePressureAltitude(
    input.elevationFt,
    input.qnhHpa,
  );
  const altitudeBandFt = selectAltitudeBandFt(pressureAltitudeFt);
  const column = selectVSpeedTemperatureColumn(altitudeBandFt, input.oatC);

  const table = VSPEED_TABLES[input.flapConfig];

  const row =
    table.find(
      (r) => input.towKg >= r.minWeightKg && input.towKg <= r.maxWeightKg,
    ) ?? (input.towKg < table[0].minWeightKg ? table[0] : table[table.length - 1]);

  const [v1, vr, v2] = row.speeds[column];

  return {
    source: `Uploaded A380 sim V-speed chart - ${input.flapConfig}`,
    pressureAltitudeFt: Math.round(pressureAltitudeFt),
    selectedAltitudeBandFt: altitudeBandFt,
    selectedTempColumn: column + 1,
    selectedWeightBand: `${Math.round(row.minWeightKg / 1000)}-${Math.round(
      row.maxWeightKg / 1000,
    )} t`,
    v1,
    vr,
    v2,
  };
}

function selectAltitudeBandFt(pressureAltitudeFt: number): number {
  if (pressureAltitudeFt <= 0) return 0;
  if (pressureAltitudeFt <= 1000) return 1000;
  if (pressureAltitudeFt <= 2000) return 2000;
  if (pressureAltitudeFt <= 3000) return 3000;
  if (pressureAltitudeFt <= 4000) return 4000;
  if (pressureAltitudeFt <= 5000) return 5000;
  if (pressureAltitudeFt <= 6000) return 6000;
  if (pressureAltitudeFt <= 7000) return 7000;
  if (pressureAltitudeFt <= 8000) return 8000;
  if (pressureAltitudeFt <= 9000) return 9000;
  return 10000;
}

function selectVSpeedTemperatureColumn(
  altitudeBandFt: number,
  oatC: number,
): number {
  const bands: Record<number, Array<[number, number] | null>> = {
    0: [[-40, 35], [36, 43], [44, 50], [48, 48]],
    1000: [[-40, 30], [31, 38], [39, 47], [48, 48]],
    2000: [[-40, 26], [27, 34], [35, 43], [44, 46]],
    3000: [[-40, 24], [25, 29], [30, 39], [40, 44]],
    4000: [null, [-40, 25], [26, 34], [35, 42]],
    5000: [null, [-40, 20], [21, 30], [31, 40]],
    6000: [null, [-40, 18], [19, 25], [26, 36]],
    7000: [null, null, [-40, 21], [22, 32]],
    8000: [null, null, [-40, 18], [19, 27]],
    9000: [null, null, [-40, 12], [13, 22]],
    10000: [null, null, null, [-40, 17]],
  };

  const ranges = bands[altitudeBandFt] ?? bands[10000];

  for (let index = 0; index < ranges.length; index += 1) {
    const range = ranges[index];

    if (!range) {
      continue;
    }

    const [minTemp, maxTemp] = range;

    if (oatC >= minTemp && oatC <= maxTemp) {
      return index;
    }
  }

  const available = ranges
    .map((range, index) => ({ range, index }))
    .filter((item): item is { range: [number, number]; index: number } => item.range !== null);

  let best = available[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const item of available) {
    const [minTemp, maxTemp] = item.range;
    const distance =
      oatC < minTemp ? minTemp - oatC : oatC > maxTemp ? oatC - maxTemp : 0;

    if (distance < bestDistance) {
      best = item;
      bestDistance = distance;
    }
  }

  return best.index;
}

function getFieldTemperatureFactor(isaDeviationC: number): number {
  const hotPenalty =
    Math.max(0, isaDeviationC) *
    A380_PERF_PLACEHOLDERS.fieldHotIsaPenaltyPerDegC;
  const coldCredit =
    Math.max(0, -isaDeviationC) *
    A380_PERF_PLACEHOLDERS.fieldColdIsaCreditPerDegC;

  return clamp(
    1 + hotPenalty - coldCredit,
    A380_PERF_PLACEHOLDERS.minFieldTemperatureFactor,
    A380_PERF_PLACEHOLDERS.maxFieldTemperatureFactor,
  );
}

function getRunwayCorrectionM(input: PilotInput, headwindKt: number): number {
  const slopeTerm =
    input.slopePercent >= 0
      ? input.slopePercent * A380_PERF_PLACEHOLDERS.uphillSlopePenaltyMPerPercent
      : input.slopePercent *
        A380_PERF_PLACEHOLDERS.downhillSlopeCreditMPerPercent;

  const windTerm =
    headwindKt >= 0
      ? -Math.min(headwindKt, 30) * A380_PERF_PLACEHOLDERS.headwindCreditMPerKt
      : Math.abs(headwindKt) * A380_PERF_PLACEHOLDERS.tailwindPenaltyMPerKt;

  const runwayConditionTerm =
    input.runwayCondition === 'DRY'
      ? 0
      : input.runwayCondition === 'WET'
        ? A380_PERF_PLACEHOLDERS.wetRunwayPenaltyM
        : A380_PERF_PLACEHOLDERS.contaminatedRunwayPenaltyM;

  const packsTerm = input.packsOn ? A380_PERF_PLACEHOLDERS.packsOnPenaltyM : 0;

  const antiIceTerm =
    input.antiIce === 'OFF'
      ? 0
      : input.antiIce === 'ENG'
        ? A380_PERF_PLACEHOLDERS.engineAntiIcePenaltyM
        : A380_PERF_PLACEHOLDERS.wingAntiIcePenaltyM;

  return slopeTerm + windTerm + runwayConditionTerm + packsTerm + antiIceTerm;
}

function getThrustDistanceFactor(thrustRatio: number): number {
  return Math.pow(
    1 / clamp(thrustRatio, 0.7, 1),
    TRENT_972B_84_ENGINE.thrustToDistanceExponent,
  );
}

function interpolateMaxTowForCurve(
  points: FieldLimitChartPoint[],
  runwayLengthM: number,
): number {
  const sorted = [...points].sort((a, b) => a.runwayLengthM - b.runwayLengthM);

  if (runwayLengthM <= sorted[0].runwayLengthM) {
    return sorted[0].maxTowKg;
  }

  if (runwayLengthM >= sorted[sorted.length - 1].runwayLengthM) {
    return sorted[sorted.length - 1].maxTowKg;
  }

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const a = sorted[i];
    const b = sorted[i + 1];

    if (runwayLengthM >= a.runwayLengthM && runwayLengthM <= b.runwayLengthM) {
      const ratio =
        (runwayLengthM - a.runwayLengthM) / (b.runwayLengthM - a.runwayLengthM);
      return a.maxTowKg + ratio * (b.maxTowKg - a.maxTowKg);
    }
  }

  return sorted[sorted.length - 1].maxTowKg;
}

function interpolateRequiredRunwayForCurve(
  points: FieldLimitChartPoint[],
  towKg: number,
): number {
  const sorted = [...points].sort((a, b) => a.maxTowKg - b.maxTowKg);

  if (towKg <= sorted[0].maxTowKg) {
    return sorted[0].runwayLengthM;
  }

  if (towKg >= sorted[sorted.length - 1].maxTowKg) {
    return sorted[sorted.length - 1].runwayLengthM;
  }

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const a = sorted[i];
    const b = sorted[i + 1];

    if (towKg >= a.maxTowKg && towKg <= b.maxTowKg) {
      const ratio = (towKg - a.maxTowKg) / (b.maxTowKg - a.maxTowKg);
      return a.runwayLengthM + ratio * (b.runwayLengthM - a.runwayLengthM);
    }
  }

  return sorted[sorted.length - 1].runwayLengthM;
}

function interpolateChartByPressureAltitude(
  pressureAltitudeFt: number,
  valueForCurve: (curve: FieldLimitChartCurve) => number,
): number {
  const curves = [...A380_FIELD_LIMIT_CHART_ISA_TRENT900].sort(
    (a, b) => a.pressureAltitudeFt - b.pressureAltitudeFt,
  );

  if (pressureAltitudeFt <= curves[0].pressureAltitudeFt) {
    return valueForCurve(curves[0]);
  }

  if (pressureAltitudeFt >= curves[curves.length - 1].pressureAltitudeFt) {
    return valueForCurve(curves[curves.length - 1]);
  }

  for (let i = 0; i < curves.length - 1; i += 1) {
    const lower = curves[i];
    const upper = curves[i + 1];

    if (
      pressureAltitudeFt >= lower.pressureAltitudeFt &&
      pressureAltitudeFt <= upper.pressureAltitudeFt
    ) {
      const ratio =
        (pressureAltitudeFt - lower.pressureAltitudeFt) /
        (upper.pressureAltitudeFt - lower.pressureAltitudeFt);

      const lowerValue = valueForCurve(lower);
      const upperValue = valueForCurve(upper);

      return lowerValue + ratio * (upperValue - lowerValue);
    }
  }

  return valueForCurve(curves[curves.length - 1]);
}

function getChartFieldLimitWeightKg(
  input: PilotInput,
  thrustRatio: number,
): number {
  const pressureAltitudeFt = calculatePressureAltitude(
    input.elevationFt,
    input.qnhHpa,
  );
  const isaDeviationC = input.oatC - getIsaTemperatureC(input.elevationFt);
  const wind = calculateWindComponents(
    input.windDirectionDeg,
    input.windSpeedKt,
    input.runwayHeadingDeg,
  );

  const limitingDeclaredDistanceM = Math.min(input.toraM, input.todaM, input.asdaM);
  const runwayCorrectionM = getRunwayCorrectionM(input, wind.headwindKt);
  const temperatureFactor = getFieldTemperatureFactor(isaDeviationC);
  const thrustDistanceFactor = getThrustDistanceFactor(thrustRatio);

  const equivalentIsaFullThrustRunwayM = Math.max(
    0,
    (limitingDeclaredDistanceM - runwayCorrectionM) /
      temperatureFactor /
      thrustDistanceFactor,
  );

  const chartLimitKg = interpolateChartByPressureAltitude(
    pressureAltitudeFt,
    (curve) =>
      interpolateMaxTowForCurve(curve.points, equivalentIsaFullThrustRunwayM),
  );

  return Math.round(Math.min(chartLimitKg, input.weightVariant.mtowKg));
}

function getChartRequiredToraM(
  input: PilotInput,
  pressureAltitudeFt: number,
  isaDeviationC: number,
  headwindKt: number,
  thrustRatio: number,
): number {
  const baseIsaFullThrustRequiredM = interpolateChartByPressureAltitude(
    pressureAltitudeFt,
    (curve) => interpolateRequiredRunwayForCurve(curve.points, input.towKg),
  );

  const temperatureFactor = getFieldTemperatureFactor(isaDeviationC);
  const thrustDistanceFactor = getThrustDistanceFactor(thrustRatio);
  const runwayCorrectionM = getRunwayCorrectionM(input, headwindKt);

  return Math.round(
    baseIsaFullThrustRequiredM *
      temperatureFactor *
      thrustDistanceFactor +
      runwayCorrectionM,
  );
}

function estimateRequiredTora(
  input: PilotInput,
  _densityAltitudeFt: number,
  headwindKt: number,
  thrustRatio = 1,
): number {
  const pressureAltitudeFt = calculatePressureAltitude(
    input.elevationFt,
    input.qnhHpa,
  );
  const isaDeviationC = input.oatC - getIsaTemperatureC(input.elevationFt);

  return getChartRequiredToraM(
    input,
    pressureAltitudeFt,
    isaDeviationC,
    headwindKt,
    thrustRatio,
  );
}

function estimateRequiredToda(input: PilotInput, requiredToraM: number): number {
  const configCredit =
    input.flapConfig === 'CONF 1+F' ? 60 : input.flapConfig === 'CONF 2' ? 30 : 0;
  return Math.round(requiredToraM - configCredit);
}

function estimateRequiredAsda(input: PilotInput, requiredToraM: number): number {
  const conditionPenalty =
    input.runwayCondition === 'DRY'
      ? 120
      : input.runwayCondition === 'WET'
        ? 280
        : 600;

  return Math.round(requiredToraM + conditionPenalty);
}

function estimateFieldLimitWeight(input: PilotInput, thrustRatio = 1): number {
  return getChartFieldLimitWeightKg(input, thrustRatio);
}

function estimateClimbLimitWeight(
  input: PilotInput,
  pressureAltitudeFt: number,
  isaDeviationC: number,
  thrustRatio = 1,
): number {
  const thrustClimbFactor = Math.pow(
    clamp(thrustRatio, 0.7, 1),
    TRENT_972B_84_ENGINE.thrustToClimbExponent,
  );

  let limit =
    A380_PERF_PLACEHOLDERS.seaLevelIsaClimbLimitKg * thrustClimbFactor -
    Math.max(0, pressureAltitudeFt / 1000) *
      A380_PERF_PLACEHOLDERS.pressureAltitudeClimbPenaltyKgPer1000Ft -
    Math.max(0, isaDeviationC) *
      A380_PERF_PLACEHOLDERS.hotDayClimbPenaltyKgPerDegIsa;

  if (input.packsOn) {
    limit -= A380_PERF_PLACEHOLDERS.packsOnClimbPenaltyKg;
  }

  if (input.antiIce === 'ENG') {
    limit -= A380_PERF_PLACEHOLDERS.engineAntiIceClimbPenaltyKg;
  }

  if (input.antiIce === 'ENG+WING') {
    limit -= A380_PERF_PLACEHOLDERS.wingAntiIceClimbPenaltyKg;
  }

  return Math.round(Math.min(limit, input.weightVariant.mtowKg));
}

function estimateFlexTemp(
  input: PilotInput,
  pressureAltitudeFt: number,
  isaDeviationC: number,
  densityAltitudeFt: number,
  headwindKt: number,
): number | null {
  const flatRatedTempC = getFlatRatedTemperatureC(input.elevationFt);

  const minUsefulFlexTempC = Math.ceil(
    Math.max(
      input.oatC + A380_PERF_PLACEHOLDERS.minFlexAboveOatC,
      flatRatedTempC + 1,
    ),
  );

  const maxFlexTempC = A380_PERF_PLACEHOLDERS.maxFlexTempC;

  if (minUsefulFlexTempC >= maxFlexTempC) {
    return null;
  }

  const minThrustRatio = getTakeoffThrustRatioForAssumedTemp(
    input,
    minUsefulFlexTempC,
  );

  const minFlexWorks = isTakeoffPossibleAtThrustRatio(
    input,
    pressureAltitudeFt,
    isaDeviationC,
    densityAltitudeFt,
    headwindKt,
    minThrustRatio,
  );

  if (!minFlexWorks) {
    return null;
  }

  let low = minUsefulFlexTempC;
  let high = maxFlexTempC;
  let best = minUsefulFlexTempC;

  for (let i = 0; i < 30; i += 1) {
    const mid = (low + high) / 2;
    const thrustRatio = getTakeoffThrustRatioForAssumedTemp(input, mid);

    const works = isTakeoffPossibleAtThrustRatio(
      input,
      pressureAltitudeFt,
      isaDeviationC,
      densityAltitudeFt,
      headwindKt,
      thrustRatio,
    );

    if (works) {
      best = mid;
      low = mid;
    } else {
      high = mid;
    }
  }

  return Math.round(best);
}

function getIsaTemperatureC(elevationFt: number): number {
  return 15 - 1.98 * (elevationFt / 1000);
}

function getFlatRatedTemperatureC(elevationFt: number): number {
  return (
    getIsaTemperatureC(elevationFt) +
    TRENT_972B_84_ENGINE.flatRatedIsaDeviationC
  );
}

function getTakeoffThrustRatioForAssumedTemp(
  input: PilotInput,
  assumedTempC: number,
): number {
  const flatRatedTempC = getFlatRatedTemperatureC(input.elevationFt);

  if (assumedTempC <= flatRatedTempC) {
    return 1;
  }

  const degreesAboveFlatRating = assumedTempC - flatRatedTempC;

  const thrustRatio =
    1 -
    degreesAboveFlatRating *
      TRENT_972B_84_ENGINE.assumedTempDeratePerDegAboveFlatRating;

  return clamp(thrustRatio, 0.7, 1);
}

function isTakeoffPossibleAtThrustRatio(
  input: PilotInput,
  pressureAltitudeFt: number,
  isaDeviationC: number,
  densityAltitudeFt: number,
  headwindKt: number,
  thrustRatio: number,
): boolean {
  const requiredToraM = estimateRequiredTora(
    input,
    densityAltitudeFt,
    headwindKt,
    thrustRatio,
  );
  const requiredTodaM = estimateRequiredToda(input, requiredToraM);
  const requiredAsdaM = estimateRequiredAsda(input, requiredToraM);

  const fieldLimitWeightKg = estimateFieldLimitWeight(input, thrustRatio);
  const climbLimitWeightKg = estimateClimbLimitWeight(
    input,
    pressureAltitudeFt,
    isaDeviationC,
    thrustRatio,
  );

  return (
    input.towKg <= input.weightVariant.mtowKg &&
    input.towKg <= fieldLimitWeightKg &&
    input.towKg <= climbLimitWeightKg &&
    requiredToraM <= input.toraM &&
    requiredTodaM <= input.todaM &&
    requiredAsdaM <= input.asdaM
  );
}

function estimateThs(cgPercentMac: number): string {
  const thsUp = clamp((34 - cgPercentMac) * 0.7, 0.5, 3.5);
  return `${thsUp.toFixed(1)} UP`;
}

function determineLimitingFactor(
  input: PilotInput,
  limits: {
    structuralLimitWeightKg: number;
    fieldLimitWeightKg: number;
    climbLimitWeightKg: number;
    toraMarginM: number;
    todaMarginM: number;
    asdaMarginM: number;
  },
): string {
  if (input.towKg >= limits.structuralLimitWeightKg - 500) return 'STRUCTURAL';
  if (limits.asdaMarginM < 0) return 'ASDA';
  if (limits.toraMarginM < 0) return 'TORA';
  if (limits.todaMarginM < 0) return 'TODA';
  if (input.towKg > limits.fieldLimitWeightKg) return 'FIELD';
  if (input.towKg > limits.climbLimitWeightKg) return 'CLIMB';
  return 'NONE';
}

function calculatePressureAltitude(elevationFt: number, qnhHpa: number): number {
  return elevationFt + (1013.25 - qnhHpa) * 27;
}

function calculateWindComponents(
  windDirectionDeg: number,
  windSpeedKt: number,
  runwayHeadingDeg: number,
): { headwindKt: number; crosswindKt: number } {
  const angleRad = ((windDirectionDeg - runwayHeadingDeg) * Math.PI) / 180;

  return {
    headwindKt: windSpeedKt * Math.cos(angleRad),
    crosswindKt: windSpeedKt * Math.sin(angleRad),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}