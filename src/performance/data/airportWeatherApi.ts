export interface RunwayOption {
  key: string;
  ident: string;
  oppositeIdent: string;
  lengthM: number;
  widthM: number | null;
  headingTrueDeg: number;
  elevationFt: number;
  slopePercent: number;
  surface: string;
  toraM: number;
  todaM: number;
  asdaM: number;
}

export interface MetarDefaults {
  raw?: string;
  oatC?: number;
  qnhHpa?: number;
  windDirectionDeg?: number;
  windSpeedKt?: number;
  windGustKt?: number;
  variableWind?: boolean;
}

const AIRPORTS_CSV_URL =
  'https://davidmegginson.github.io/ourairports-data/airports.csv';

const RUNWAYS_CSV_URL =
  'https://davidmegginson.github.io/ourairports-data/runways.csv';

const METARS_CACHE_CSV_URL =
  'https://aviationweather.gov/data/cache/metars.cache.csv';

  
function parseCsv(csv: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let insideQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      value += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === ',' && !insideQuotes) {
      row.push(value);
      value = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (value !== '' || row.length > 0) {
        row.push(value);
        rows.push(row);
        row = [];
        value = '';
      }

      if (char === '\r' && next === '\n') {
        i++;
      }

      continue;
    }

    value += char;
  }

  if (value !== '' || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  const headers = rows[0] ?? [];

  return rows.slice(1).map((csvRow) => {
    const object: Record<string, string> = {};

    headers.forEach((header, index) => {
      object[header] = csvRow[index] ?? '';
    });

    return object;
  });
}

function parseNumber(value: string | undefined, fallback = 0): number {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function parseOptionalNumber(value: string | undefined): number | null {
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function ftToM(ft: number): number {
  return Math.round(ft * 0.3048);
}

function normalizeRunwayIdent(ident: string): string {
  const cleaned = ident.trim().toUpperCase();

  const match = cleaned.match(/^(\d{1,2})([LCR]?)$/);

  if (!match) {
    return cleaned;
  }

  return `${match[1].padStart(2, '0')}${match[2]}`;
}

function deriveHeadingFromRunwayIdent(ident: string): number {
  const match = ident.match(/^(\d{2})/);

  if (!match) {
    return 0;
  }

  const number = Number(match[1]);

  if (number === 36) {
    return 360;
  }

  return number * 10;
}

function makeRunwayOption(
  runway: Record<string, string>,
  departureEnd: 'LE' | 'HE',
): RunwayOption {
  const lengthM = ftToM(parseNumber(runway.length_ft, 0));
  const widthFt = parseOptionalNumber(runway.width_ft);
  const widthM = widthFt === null ? null : ftToM(widthFt);

  const leIdent = normalizeRunwayIdent(runway.le_ident);
  const heIdent = normalizeRunwayIdent(runway.he_ident);

  const ident = departureEnd === 'LE' ? leIdent : heIdent;
  const oppositeIdent = departureEnd === 'LE' ? heIdent : leIdent;

  const startElevationFt = parseNumber(
    departureEnd === 'LE'
      ? runway.le_elevation_ft
      : runway.he_elevation_ft,
    0,
  );

  const endElevationFt = parseNumber(
    departureEnd === 'LE'
      ? runway.he_elevation_ft
      : runway.le_elevation_ft,
    startElevationFt,
  );

  const headingTrueDeg = parseNumber(
    departureEnd === 'LE'
      ? runway.le_heading_degT
      : runway.he_heading_degT,
    deriveHeadingFromRunwayIdent(ident),
  );

  const slopePercent =
    lengthM > 0
      ? (((endElevationFt - startElevationFt) * 0.3048) / lengthM) * 100
      : 0;

  return {
    key: `${runway.airport_ident}-${ident}-${departureEnd}`,
    ident,
    oppositeIdent,
    lengthM,
    widthM,
    headingTrueDeg,
    elevationFt: Math.round(startElevationFt),
    slopePercent: Number(slopePercent.toFixed(2)),
    surface: runway.surface || 'UNKNOWN',

    // OurAirports gives physical runway length, not official declared distances.
    // Later we should replace these with proper airport declared-distance data.
    toraM: lengthM,
    todaM: lengthM,
    asdaM: lengthM,
  };
}

export async function fetchRunwayOptions(airportIcao: string): Promise<RunwayOption[]> {
  const query = airportIcao.trim().toUpperCase();

  if (!query) {
    throw new Error('Enter an airport ICAO first.');
  }

  const [airportsResponse, runwaysResponse] = await Promise.all([
    fetch(AIRPORTS_CSV_URL),
    fetch(RUNWAYS_CSV_URL),
  ]);

  if (!airportsResponse.ok || !runwaysResponse.ok) {
    throw new Error('Airport/runway data could not be fetched.');
  }

  const airports = parseCsv(await airportsResponse.text());
  const runways = parseCsv(await runwaysResponse.text());

  const airport = airports.find((row) =>
    [
      row.ident,
      row.gps_code,
      row.local_code,
      row.iata_code,
    ]
      .filter(Boolean)
      .some((code) => code.toUpperCase() === query),
  );

  if (!airport) {
    throw new Error(`Airport ${query} not found.`);
  }

  const airportRunways = runways.filter(
    (runway) =>
      runway.airport_ident?.toUpperCase() === airport.ident?.toUpperCase() &&
      runway.closed !== '1',
  );

  if (airportRunways.length === 0) {
    throw new Error(`No open runways found for ${query}.`);
  }

  return airportRunways
    .flatMap((runway) => [
      makeRunwayOption(runway, 'LE'),
      makeRunwayOption(runway, 'HE'),
    ])
    .filter((runway) => runway.ident !== '')
    .sort((a, b) => a.ident.localeCompare(b.ident));
}

function numberFromUnknown(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const number = Number(value);

    if (Number.isFinite(number)) {
      return number;
    }
  }

  return undefined;
}

function parseQnhFromApiValue(value: unknown): number | undefined {
  const number = numberFromUnknown(value);

  if (number === undefined) {
    return undefined;
  }

  if (number > 800 && number < 1100) {
    return Math.round(number);
  }

  if (number > 20 && number < 35) {
    return Math.round(number * 33.8639);
  }

  if (number > 2000 && number < 4000) {
    return Math.round((number / 100) * 33.8639);
  }

  return undefined;
}

function parseMetarTemp(value: string): number {
  return value.startsWith('M') ? -Number(value.slice(1)) : Number(value);
}

function parseRawMetar(raw: string): MetarDefaults {
  const result: MetarDefaults = { raw };

  const windMatch = raw.match(/\b(\d{3}|VRB)(\d{2,3})(G(\d{2,3}))?KT\b/);

  if (windMatch) {
    result.variableWind = windMatch[1] === 'VRB';

    if (!result.variableWind) {
      result.windDirectionDeg = Number(windMatch[1]);
    }

    result.windSpeedKt = Number(windMatch[2]);

    if (windMatch[4]) {
      result.windGustKt = Number(windMatch[4]);
    }
  }

  const tempMatch = raw.match(/\b(M?\d{2})\/(M?\d{2}|\/\/)\b/);

  if (tempMatch) {
    result.oatC = parseMetarTemp(tempMatch[1]);
  }

  const qnhMatch = raw.match(/\bQ(\d{4})\b/);

  if (qnhMatch) {
    result.qnhHpa = Number(qnhMatch[1]);
  }

  const altimeterMatch = raw.match(/\bA(\d{4})\b/);

  if (!result.qnhHpa && altimeterMatch) {
    result.qnhHpa = Math.round((Number(altimeterMatch[1]) / 100) * 33.8639);
  }

  return result;
}

export async function fetchMetarDefaults(airportIcao: string): Promise<MetarDefaults> {
  const query = airportIcao.trim().toUpperCase();

  if (!query) {
    throw new Error('Enter an airport ICAO first.');
  }

  const response = await fetch(METARS_CACHE_CSV_URL, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`METAR data could not be fetched.`);
  }

  const rows = parseCsv(await response.text());

  const item = rows.find((row) =>
    [
      row.station_id,
      row.icaoId,
      row.icao_id,
      row.id,
    ]
      .filter(Boolean)
      .some((code) => code.toUpperCase() === query),
  );

  if (!item) {
    throw new Error(`No METAR found for ${query}.`);
  }

  const raw = String(
    item.raw_text ??
      item.rawOb ??
      item.raw ??
      '',
  );

  const parsed = parseRawMetar(raw);

  return {
    raw,
    oatC:
      numberFromUnknown(item.temp_c) ??
      numberFromUnknown(item.temp) ??
      parsed.oatC,
    qnhHpa:
      parseQnhFromApiValue(item.altim_in_hg) ??
      parseQnhFromApiValue(item.altim) ??
      parsed.qnhHpa,
    windDirectionDeg:
      numberFromUnknown(item.wind_dir_degrees) ??
      numberFromUnknown(item.wdir) ??
      parsed.windDirectionDeg,
    windSpeedKt:
      numberFromUnknown(item.wind_speed_kt) ??
      numberFromUnknown(item.wspd) ??
      parsed.windSpeedKt,
    windGustKt:
      numberFromUnknown(item.wind_gust_kt) ??
      numberFromUnknown(item.wgst) ??
      parsed.windGustKt,
    variableWind: parsed.variableWind,
  };
}