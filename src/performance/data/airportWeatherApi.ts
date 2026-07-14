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

const METAR_API_URL = (icao: string) =>
  `https://metar.vatsim.net/${encodeURIComponent(icao)}?format=json`;

type CsvRow = Record<string, string>;

let airportsDataPromise: Promise<CsvRow[]> | null = null;
let runwaysDataPromise: Promise<CsvRow[]> | null = null;

async function downloadCsvData(
  url: string,
  description: string,
): Promise<CsvRow[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `${description} data could not be fetched (${response.status}).`,
    );
  }

  const csv = await response.text();

  return parseCsv(csv);
}

function getAirportsData(): Promise<CsvRow[]> {
  if (airportsDataPromise === null) {
    airportsDataPromise = downloadCsvData(
      AIRPORTS_CSV_URL,
      'Airport',
    ).catch((error: unknown) => {
      airportsDataPromise = null;
      throw error;
    });
  }

  return airportsDataPromise;
}

function getRunwaysData(): Promise<CsvRow[]> {
  if (runwaysDataPromise === null) {
    runwaysDataPromise = downloadCsvData(
      RUNWAYS_CSV_URL,
      'Runway',
    ).catch((error: unknown) => {
      runwaysDataPromise = null;
      throw error;
    });
  }

  return runwaysDataPromise;
}

  
function parseCsv(csv: string): CsvRow[] {
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
    const object: CsvRow = {};

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
  if (value === undefined || value.trim() === '') {
    return null;
  }

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
  airportElevationFt: number,
): RunwayOption {
  const lengthM = ftToM(parseNumber(runway.length_ft, 0));
  const widthFt = parseOptionalNumber(runway.width_ft);
  const widthM = widthFt === null ? null : ftToM(widthFt);

  const leIdent = normalizeRunwayIdent(runway.le_ident);
  const heIdent = normalizeRunwayIdent(runway.he_ident);

  const ident = departureEnd === 'LE' ? leIdent : heIdent;
  const oppositeIdent = departureEnd === 'LE' ? heIdent : leIdent;

const startElevationFt =
  parseOptionalNumber(
    departureEnd === 'LE'
      ? runway.le_elevation_ft
      : runway.he_elevation_ft,
  ) ?? airportElevationFt;

const endElevationFt =
  parseOptionalNumber(
    departureEnd === 'LE'
      ? runway.he_elevation_ft
      : runway.le_elevation_ft,
  ) ?? startElevationFt;

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

const [airports, runways] = await Promise.all([
  getAirportsData(),
  getRunwaysData(),
]);

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
  
  const airportElevationFt =
  parseOptionalNumber(airport.elevation_ft) ?? 0;

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
      makeRunwayOption(runway, 'LE', airportElevationFt),
      makeRunwayOption(runway, 'HE', airportElevationFt),
    ])
    .filter((runway) => runway.ident !== '')
    .sort((a, b) => a.ident.localeCompare(b.ident));
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

  const response = await fetch(METAR_API_URL(query), {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`METAR for ${query} could not be fetched.`);
  }

  const body = await response.text();

  let raw: string;

  try {
    const json = JSON.parse(body) as unknown;

    function extractRawMetar(entry: unknown): string {
      if (typeof entry === 'string') {
        return entry.trim();
      }

      if (!entry || typeof entry !== 'object') {
        return '';
      }

      const object = entry as Record<string, unknown>;

      return String(
        object.metar ??
          object.rawOb ??
          object.raw_text ??
          object.raw ??
          object.text ??
          '',
      ).trim();
    }

    if (Array.isArray(json)) {
      const item = json.find((entry) => {
        if (!entry || typeof entry !== 'object') {
          return false;
        }

        const object = entry as Record<string, unknown>;

        return String(object.id ?? object.station_id ?? object.icaoId ?? '')
          .toUpperCase()
          .trim() === query;
      });

      raw = extractRawMetar(item);
    } else if (json && typeof json === 'object') {
      const object = json as Record<string, unknown>;

      if (Array.isArray(object.data)) {
        const item = object.data.find((entry) => {
          if (!entry || typeof entry !== 'object') {
            return false;
          }

          const dataObject = entry as Record<string, unknown>;

          return String(dataObject.id ?? dataObject.station_id ?? dataObject.icaoId ?? '')
            .toUpperCase()
            .trim() === query;
        });

        raw = extractRawMetar(item);
      } else {
        raw = extractRawMetar(object);
      }
    } else {
      raw = extractRawMetar(json);
    }
  } catch {
    raw = body.trim();
  }

  if (!raw) {
    throw new Error(`No usable METAR found for ${query}.`);
  }

  const parsed = parseRawMetar(raw);

  return {
    raw,
    oatC: parsed.oatC,
    qnhHpa: parsed.qnhHpa,
    windDirectionDeg: parsed.windDirectionDeg,
    windSpeedKt: parsed.windSpeedKt,
    windGustKt: parsed.windGustKt,
    variableWind: parsed.variableWind,
  };
}