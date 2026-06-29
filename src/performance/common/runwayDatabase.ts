export interface RunwayOption {
  airportIcao: string;
  runwayIdent: string;
  runwaySurface: string;
  lengthM: number;
  toraM: number;
  todaM: number;
  asdaM: number;
  headingDeg: number;
  elevationFt: number;
}

interface RawRunwayRow {
  airport_ident: string;
  length_ft: string;
  surface: string;
  closed: string;

  le_ident: string;
  le_elevation_ft: string;
  le_heading_degT: string;

  he_ident: string;
  he_elevation_ft: string;
  he_heading_degT: string;
}

const RUNWAYS_CSV_URL =
  'https://davidmegginson.github.io/ourairports-data/runways.csv';

let cachedRunwayRows: RawRunwayRow[] | null = null;

export async function getRunwaysForAirport(
  airportIcao: string,
): Promise<RunwayOption[]> {
  const icao = airportIcao.trim().toUpperCase();

  if (icao.length < 4) {
    return [];
  }

  const rows = await getRunwayRows();

  const matchingRows = rows.filter(
    (row) => row.airport_ident.toUpperCase() === icao && row.closed !== '1',
  );

  const runwayOptions = matchingRows.flatMap((row) => {
    const lengthM = feetToMeters(toNumber(row.length_ft));

    const options: RunwayOption[] = [];

    if (row.le_ident) {
      options.push({
        airportIcao: icao,
        runwayIdent: row.le_ident,
        runwaySurface: row.surface || 'UNKNOWN',
        lengthM,
        toraM: lengthM,
        todaM: lengthM,
        asdaM: lengthM,
        headingDeg: Math.round(toNumber(row.le_heading_degT)),
        elevationFt: Math.round(toNumber(row.le_elevation_ft)),
      });
    }

    if (row.he_ident) {
      options.push({
        airportIcao: icao,
        runwayIdent: row.he_ident,
        runwaySurface: row.surface || 'UNKNOWN',
        lengthM,
        toraM: lengthM,
        todaM: lengthM,
        asdaM: lengthM,
        headingDeg: Math.round(toNumber(row.he_heading_degT)),
        elevationFt: Math.round(toNumber(row.he_elevation_ft)),
      });
    }

    return options;
  });

  return runwayOptions.sort((a, b) =>
    a.runwayIdent.localeCompare(b.runwayIdent, undefined, {
      numeric: true,
      sensitivity: 'base',
    }),
  );
}

async function getRunwayRows(): Promise<RawRunwayRow[]> {
  if (cachedRunwayRows) {
    return cachedRunwayRows;
  }

  const response = await fetch(RUNWAYS_CSV_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch runway database: ${response.status}`);
  }

  const csvText = await response.text();
  cachedRunwayRows = parseCsv(csvText) as unknown as RawRunwayRow[];

  return cachedRunwayRows;
}

function parseCsv(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split(/\r?\n/);

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });

    return row;
  });
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      const nextCharacter = line[index + 1];

      if (insideQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (character === ',' && !insideQuotes) {
      result.push(current);
      current = '';
    } else {
      current += character;
    }
  }

  result.push(current);

  return result;
}

function toNumber(value: string): number {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed;
}

function feetToMeters(feet: number): number {
  return Math.round(feet * 0.3048);
}