export const A380_AIRCRAFT_ID = 'a380-842-trent-972b-wv003';

export const A380_AIRCRAFT_INFO = {
  manufacturer: 'Airbus' as const,
  displayName: 'Airbus A380-842 | Trent 972B-84 | WV003',
  shortName: 'A380-842',
  description: 'Simulator-oriented A380-842 performance module using WV003 weights and Trent 972B-84 assumptions.',
};

export const A380_DEFAULT_TAKEOFF_INPUT = {
  airportIcao: 'LPPT',
  runwayIdent: '02',
  runwaySurface: 'ASP',

  toraM: 3810,
  todaM: 3810,
  asdaM: 3810,

  runwayHeadingDeg: 22,
  elevationFt: 331,
  slopePercent: 0.13,

  oatC: 28,
  qnhHpa: 1020,
  windDirectionDeg: 330,
  windSpeedKt: 15,

  towKg: 510_000,
  takeoffCgPercentMac: 32,

  flapConfig: 'CONF 2',
  runwayCondition: 'DRY' as const,
  packsOn: true,
  antiIce: 'OFF',
  thrustMode: 'FLEX',
};