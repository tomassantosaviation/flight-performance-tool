import { useEffect, useState, type ReactNode } from 'react';
import './App.css';

import {
  aircraftRegistry,
  type AircraftId,
} from './performance/aircraft/aircraftRegistry';

import type {
  TakeoffInput,
  TakeoffResult,
} from './performance/aircraft/a380/a380Types';

import {
  fetchMetarDefaults,
  fetchRunwayOptions,
  type RunwayOption,
} from './performance/data/airportWeatherApi';

type RunwayConditionSelection =
  | 'DRY_RWYCC_6'
  | 'WET_RWYCC_5'
  | 'CONTAMINATED_RWYCC_4'
  | 'CONTAMINATED_RWYCC_3_2'
  | 'CONTAMINATED_RWYCC_1';

const RUNWAY_CONDITION_OPTIONS: Record<
  RunwayConditionSelection,
  {
    label: string;
    runwayCondition: TakeoffInput['runwayCondition'];
    rwycc: NonNullable<TakeoffInput['rwycc']>;
  }
> = {
  DRY_RWYCC_6: {
    label: 'DRY - RWYCC 6',
    runwayCondition: 'DRY',
    rwycc: 6,
  },
  WET_RWYCC_5: {
    label: 'WET - RWYCC 5',
    runwayCondition: 'WET',
    rwycc: 5,
  },
  CONTAMINATED_RWYCC_4: {
    label: 'CONTAMINATED - RWYCC 4',
    runwayCondition: 'CONTAMINATED',
    rwycc: 4,
  },
  CONTAMINATED_RWYCC_3_2: {
    label: 'CONTAMINATED - RWYCC 3/2',
    runwayCondition: 'CONTAMINATED',
    rwycc: 2,
  },
  CONTAMINATED_RWYCC_1: {
    label: 'CONTAMINATED - RWYCC 1',
    runwayCondition: 'CONTAMINATED',
    rwycc: 1,
  },
};


function parseNumber(value: string): number {
  return Number(value.trim().replace(',', '.'));
}

function DataRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="data-row">
      <span className="data-label">{label}</span>
      <div className="data-control">{children}</div>
    </label>
  );
}

function ResultRow({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="result-row">
      <span className="result-label">{label}</span>
      <span className="result-value-wrap">
        <span className="result-value">{value}</span>
        {sub && <span className="result-sub">{sub}</span>}
      </span>
    </div>
  );
}

function BlankResultRow({ label }: { label: string }) {
  return (
    <div className="result-row">
      <span className="result-label">{label}</span>
      <span className="result-value-wrap">
        <span className="result-value muted">---</span>
      </span>
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState<'home' | 'takeoff'>('home');

  const [selectedAircraftId, setSelectedAircraftId] =
    useState<AircraftId | ''>('');

  const selectedAircraft =
    selectedAircraftId === '' ? null : aircraftRegistry[selectedAircraftId];

  const [airportIcao, setAirportIcao] = useState('');
  const [runwayIdent, setRunwayIdent] = useState('');
  const [intersection, setIntersection] = useState('');

  const [windRaw, setWindRaw] = useState('');
  const [oatC, setOatC] = useState('');
  const [qnhHpa, setQnhHpa] = useState('');

  const [towKgRaw, setTowKgRaw] = useState('');
  const [takeoffCgRaw, setTakeoffCgRaw] = useState('');
  const [flapConfig, setFlapConfig] =
    useState<TakeoffInput['flapConfig'] | ''>('');
  const [antiIce, setAntiIce] = useState<TakeoffInput['antiIce'] | ''>('');
  const [runwayConditionSelection, setRunwayConditionSelection] =
    useState<RunwayConditionSelection | ''>('');
  const [thrustMode, setThrustMode] =
    useState<TakeoffInput['thrustMode'] | ''>('');
  const [airCond, setAirCond] = useState<'ON' | 'OFF' | ''>('');

  const [runwayOptions, setRunwayOptions] = useState<RunwayOption[]>([]);
  const [selectedRunwayKey, setSelectedRunwayKey] = useState('');
  const [selectedRunway, setSelectedRunway] = useState<RunwayOption | null>(
    null,
  );

  const [airportDataStatus, setAirportDataStatus] = useState('');
  const [metarStatus, setMetarStatus] = useState('');

  const [computedResult, setComputedResult] = useState<TakeoffResult | null>(
    null,
  );

  function invalidateResult() {
    setComputedResult(null);
  }

  useEffect(() => {
    const icao = airportIcao.trim().toUpperCase();

    if (icao.length === 0) {
      setAirportDataStatus('');
      setRunwayOptions([]);
      setSelectedRunwayKey('');
      setSelectedRunway(null);
      setRunwayIdent('');
      return;
    }

    if (icao.length < 4) {
      setAirportDataStatus('ENTER 4-LETTER ICAO');
      setRunwayOptions([]);
      setSelectedRunwayKey('');
      setSelectedRunway(null);
      setRunwayIdent('');
      return;
    }

    if (icao.length > 4) {
      setAirportDataStatus('ICAO MUST BE 4 LETTERS');
      setRunwayOptions([]);
      setSelectedRunwayKey('');
      setSelectedRunway(null);
      setRunwayIdent('');
      return;
    }

    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      try {
        setAirportDataStatus('FETCHING RWYS...');
        setRunwayOptions([]);
        setSelectedRunwayKey('');
        setSelectedRunway(null);
        setRunwayIdent('');
        setComputedResult(null);

        const options = await fetchRunwayOptions(icao);

        if (cancelled) {
          return;
        }

        setRunwayOptions(options);
        setAirportDataStatus(`${options.length} RWY ENDS FOUND`);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setRunwayOptions([]);
        setSelectedRunwayKey('');
        setSelectedRunway(null);
        setRunwayIdent('');
        setAirportDataStatus(
          error instanceof Error ? error.message : 'Runway fetch failed.',
        );
      }
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [airportIcao]);

  function clearForm() {
    setAirportIcao('');
    setRunwayIdent('');
    setIntersection('');

    setWindRaw('');
    setOatC('');
    setQnhHpa('');

    setTowKgRaw('');
    setTakeoffCgRaw('');
    setFlapConfig('');
    setAntiIce('');
    setRunwayConditionSelection('');
    setThrustMode('');
    setAirCond('');

    setRunwayOptions([]);
    setSelectedRunwayKey('');
    setSelectedRunway(null);

    setAirportDataStatus('');
    setMetarStatus('');
    setComputedResult(null);
  }

  async function loadRunways() {
    try {
      if (!airportIcao.trim()) {
        setAirportDataStatus('ENTER AIRPORT FIRST');
        return;
      }

      setAirportDataStatus('FETCHING RWYS...');
      setRunwayOptions([]);
      setSelectedRunwayKey('');
      setSelectedRunway(null);
      setRunwayIdent('');
      invalidateResult();

      const options = await fetchRunwayOptions(airportIcao);

      setRunwayOptions(options);
      setAirportDataStatus(`${options.length} RWY ENDS FOUND`);
    } catch (error) {
      setAirportDataStatus(
        error instanceof Error ? error.message : 'Runway fetch failed.',
      );
    }
  }

  async function loadMetar() {
    try {
      if (!airportIcao.trim()) {
        setMetarStatus('ENTER AIRPORT FIRST');
        return;
      }

      setMetarStatus('FETCHING METAR...');
      invalidateResult();

      const metar = await fetchMetarDefaults(airportIcao);

      if (metar.variableWind && metar.windSpeedKt !== undefined) {
        setWindRaw(`VRB/${metar.windSpeedKt}`);
      } else if (
        metar.windDirectionDeg !== undefined &&
        metar.windSpeedKt !== undefined
      ) {
        setWindRaw(`${metar.windDirectionDeg}/${metar.windSpeedKt}`);
      }

      if (metar.oatC !== undefined) {
        setOatC(String(metar.oatC));
      }

      if (metar.qnhHpa !== undefined) {
        setQnhHpa(String(metar.qnhHpa));
      }

      setMetarStatus(metar.raw ? metar.raw : 'METAR FETCHED');
    } catch (error) {
      setMetarStatus(
        error instanceof Error ? error.message : 'METAR fetch failed.',
      );
    }
  }

  function computeTakeoff() {



    const selectedRunwayCondition =
      runwayConditionSelection === ''
        ? null
        : RUNWAY_CONDITION_OPTIONS[runwayConditionSelection];

    if (!selectedAircraft) {
      alert('Select an aircraft first.');
      return;
    }

    if (!selectedRunway) {
      alert('Fetch airport runways and select a runway before computing.');
      return;
    }

    if (
      !airportIcao ||
      !runwayIdent ||
      !intersection ||
      !windRaw ||
      !oatC ||
      !qnhHpa ||
      !towKgRaw ||
      !takeoffCgRaw ||
      !flapConfig ||
      !antiIce ||
      !selectedRunwayCondition ||
      !thrustMode ||
      !airCond
    ) {
      alert('Fill all takeoff fields before computing.');
      return;
    }

    const [windDirectionText, windSpeedText] = windRaw.split('/');

    const windDirectionDeg =
      windDirectionText?.trim().toUpperCase() === 'VRB'
        ? selectedRunway.headingTrueDeg
        : parseNumber(windDirectionText ?? '');

    const windSpeedKt = parseNumber(windSpeedText ?? '');

    const oatNumber = parseNumber(oatC);
    const qnhNumber = parseNumber(qnhHpa);
    const towKg = parseNumber(towKgRaw);
    const takeoffCgPercentMac = parseNumber(takeoffCgRaw);

    if (
      !Number.isFinite(windDirectionDeg) ||
      !Number.isFinite(windSpeedKt) ||
      !Number.isFinite(oatNumber) ||
      !Number.isFinite(qnhNumber) ||
      !Number.isFinite(towKg) ||
      !Number.isFinite(takeoffCgPercentMac)
    ) {
      alert('Check numeric fields. Wind must be like 220/15 or VRB/5. TOCG must be a number.');
      return;
    }

    const input: TakeoffInput = {
      airportIcao,
      runwayIdent,

      toraM: selectedRunway.toraM,
      todaM: selectedRunway.todaM,
      asdaM: selectedRunway.asdaM,
      runwayHeadingDeg: selectedRunway.headingTrueDeg,
      elevationFt: selectedRunway.elevationFt,
      slopePercent: selectedRunway.slopePercent,

      oatC: oatNumber,
      qnhHpa: qnhNumber,
      windDirectionDeg,
      windSpeedKt,

      towKg,
      cgPercentMac: takeoffCgPercentMac,

      flapConfig,
      runwayCondition: selectedRunwayCondition.runwayCondition,
      rwycc: selectedRunwayCondition.rwycc,
      runwayWidthM: selectedRunway.widthM,
      packsOn: airCond === 'ON',
      antiIce,
      thrustMode,

      weightVariant: selectedAircraft.defaultVariant,
    };

    setComputedResult(selectedAircraft.calculateTakeoff(input));
  }

if (screen === 'home') {
  return (
    <main className="home-shell">
      <section className="home-panel">
        <header className="home-header">
          <div className="home-status">
            <span className="home-status-dot" />
            SIMULATION TOOL ONLY
          </div>

          <h1>Flight Performance</h1>

          <p className="home-subtitle">
            Aircraft performance calculation suite
          </p>
        </header>

        <section className="home-aircraft-section">
          <div className="home-section-heading">
            <div>
              <span className="home-step">01</span>
              <h2>Select aircraft</h2>
            </div>

            {selectedAircraft && (
              <span className="home-aircraft-status">AIRCRAFT LOADED</span>
            )}
          </div>

          <label className="home-selector">
            <span>Aircraft / engine / weight variant</span>

            <select
              value={selectedAircraftId}
              onChange={(event) =>
                setSelectedAircraftId(event.target.value as AircraftId | '')
              }
            >
              <option value="">Select aircraft</option>

              {Object.values(aircraftRegistry).map((aircraft) => (
                <option key={aircraft.id} value={aircraft.id}>
                  {aircraft.displayName}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="home-module-section">
          <div className="home-section-heading">
            <div>
              <span className="home-step">02</span>
              <h2>Select module</h2>
            </div>
          </div>

          <div className="module-grid">
            <button
              type="button"
              className="module-card module-card-active"
              disabled={!selectedAircraft}
              onClick={() => setScreen('takeoff')}
            >
              <span className="module-card-code">TO</span>

              <span className="module-card-content">
                <strong>Takeoff</strong>
                <span>
                  Calculate V-speeds, thrust setting, trim and performance
                  limits.
                </span>
              </span>

              <span className="module-card-arrow">›</span>
            </button>

            <button
              type="button"
              className="module-card module-card-disabled"
              disabled
            >
              <span className="module-card-code">LDG</span>

              <span className="module-card-content">
                <strong>Landing</strong>
                <span>
                  Landing distance and approach performance.
                </span>
              </span>

              <span className="module-card-badge">COMING LATER</span>
            </button>
          </div>
        </section>

        <footer className="home-footer">
          <span>Not for real-world aviation</span>
          <span className="home-footer-separator" />
          <span>Developed by Tomás Santos</span>
        </footer>
      </section>
    </main>
  );
}



  return (
    <main className="app-shell">
      <header className="app-header">
        <button
          type="button"
          className="back-button"
          onClick={() => setScreen('home')}
        >
          AIRCRAFT
        </button>

        <div className="header-title">
          TAKEOFF - {selectedAircraft?.aircraftName ?? ''}
        </div>

        <div className="header-aircraft">
          {selectedAircraft?.defaultVariant.code ?? ''}
        </div>
      </header>

      <section className="app-body">
        <aside className="left-panel">
          <div className="data-group">
            <DataRow label="AIRPORT">
              <div className="inline-control">
                <input
                  value={airportIcao}
                  onChange={(e) => {
                    setAirportIcao(e.target.value.toUpperCase());
                    invalidateResult();
                  }}
                />

                <button
                  type="button"
                  className="mini-action"
                  onClick={loadRunways}
                >
                  RWYS
                </button>
              </div>
            </DataRow>

            <DataRow label="RWY">
              <select
                value={selectedRunwayKey}
                disabled={runwayOptions.length === 0}
                onChange={(e) => {
                  const key = e.target.value;
                  const runway =
                    runwayOptions.find((option) => option.key === key) ?? null;

                  setSelectedRunwayKey(key);
                  setSelectedRunway(runway);
                  setRunwayIdent(runway?.ident ?? '');
                  invalidateResult();
                }}
              >
                <option value=""></option>

                {runwayOptions.map((runway) => (
                  <option key={runway.key} value={runway.key}>
                    {runway.ident} — {runway.lengthM} m —{' '}
                    {Math.round(runway.headingTrueDeg)}°T
                  </option>
                ))}
              </select>
            </DataRow>

            <DataRow label="INTX">
              <select
                value={intersection}
                onChange={(e) => {
                  setIntersection(e.target.value);
                  invalidateResult();
                }}
              >
                <option value=""></option>
                <option>FULL LENGTH</option>
              </select>
            </DataRow>

            {airportDataStatus && (
              <div className="status-line">{airportDataStatus}</div>
            )}
          </div>

          <div className="data-group">
            <DataRow label="WIND °/kt">
              <input
                value={windRaw}
                onChange={(e) => {
                  setWindRaw(e.target.value);
                  invalidateResult();
                }}
              />
            </DataRow>

            <DataRow label="OAT °C">
              <input
                type="text"
                value={oatC}
                onChange={(e) => {
                  setOatC(e.target.value);
                  invalidateResult();
                }}
              />
            </DataRow>

            <DataRow label="QNH hPa">
              <input
                type="text"
                value={qnhHpa}
                onChange={(e) => {
                  setQnhHpa(e.target.value);
                  invalidateResult();
                }}
              />
            </DataRow>

            <div className="single-action-row">
              <button type="button" onClick={loadMetar}>
                FETCH METAR
              </button>
            </div>

            {metarStatus && (
              <div className="status-line metar-line">{metarStatus}</div>
            )}

            <DataRow label="RWY COND">
              <select
               value={runwayConditionSelection}
               onChange={(e) => {
                 setRunwayConditionSelection(e.target.value as RunwayConditionSelection | '');
                 invalidateResult();
               }}
             >
               <option value=""></option>

               {Object.entries(RUNWAY_CONDITION_OPTIONS).map(([value, option]) => (
                 <option key={value} value={value}>
                   {option.label}
                 </option>
               ))}
             </select>
            </DataRow>

            <DataRow label="A-ICE">
              <select
                value={antiIce}
                onChange={(e) => {
                  setAntiIce(e.target.value as TakeoffInput['antiIce'] | '');
                  invalidateResult();
                }}
              >
                <option value=""></option>
                <option>OFF</option>
                <option>ENG</option>
                <option>ENG+WING</option>
              </select>
            </DataRow>
          </div>

          <div className="data-group">
            <DataRow label="TOW KG">
              <input
                type="text"
                value={towKgRaw}
                onChange={(e) => {
                  setTowKgRaw(e.target.value);
                  invalidateResult();
                }}
              />
            </DataRow>
            <DataRow label="TOCG %MAC">
              <input
                type="text"
                value={takeoffCgRaw}
                onChange={(e) => {
                  setTakeoffCgRaw(e.target.value);
                  invalidateResult();
                }}
              />
           </DataRow>

            <DataRow label="T.O THRUST">
              <select
                value={thrustMode}
                onChange={(e) => {
                  setThrustMode(
                    e.target.value as TakeoffInput['thrustMode'] | '',
                  );
                  invalidateResult();
                }}
              >
                <option value=""></option>
                <option>FLEX</option>
                <option>TOGA</option>
              </select>
            </DataRow>

            <DataRow label="CONF">
              <select
                className={flapConfig ? 'selected-control' : ''}
                value={flapConfig}
                onChange={(e) => {
                  setFlapConfig(
                    e.target.value as TakeoffInput['flapConfig'] | '',
                  );
                  invalidateResult();
                }}
              >
                <option value=""></option>
                <option>CONF 1+F</option>
                <option>CONF 2</option>
                <option>CONF 3</option>
              </select>
            </DataRow>

            <DataRow label="AIR COND">
              <select
                value={airCond}
                onChange={(e) => {
                  setAirCond(e.target.value as 'ON' | 'OFF' | '');
                  invalidateResult();
                }}
              >
                <option value=""></option>
                <option>ON</option>
                <option>OFF</option>
              </select>
            </DataRow>
          </div>

          <div className="action-grid clean-actions">
            <button type="button" onClick={clearForm}>
              CLEAR
            </button>

            <button
              type="button"
              className="compute-button"
              onClick={computeTakeoff}
            >
              COMPUTE
            </button>
          </div>
        </aside>

        <section className="center-panel">
          <div className="runway-title">
            {selectedRunway
              ? `${selectedRunway.ident} - ${intersection || 'SELECT INTX'}`
              : 'SELECT RUNWAY'}
          </div>

          <div className="result-stack">
            <div className="result-card">
              {result ? (
                <>
                  <ResultRow label="CONF" value={flapConfig.replace('CONF ', '')} />
                  <ResultRow
                    label="THRUST"
                    value={
                      result.flexTempC === null
                        ? result.thrustModeUsed
                        : `FLEX ${result.flexTempC} °C`
                    }
                  />
                  <ResultRow label="V1" value={`${result.vSpeeds.v1} kt`} />
                  <ResultRow label="VR" value={`${result.vSpeeds.vr} kt`} />
                  <ResultRow label="V2" value={`${result.vSpeeds.v2} kt`} />
                  <ResultRow label="THS" value={result.ths} />
                  <ResultRow
                    label="Limitation"
                    value={result.limitingFactor}
                    sub={result.status === 'T.O POSSIBLE' ? 'PERF OK' : 'CHECK'}
                  />
                  <ResultRow label="ENG OUT ACC" value="3500 ft" />
                </>
              ) : (
                <>
                  <BlankResultRow label="CONF" />
                  <BlankResultRow label="THRUST" />
                  <BlankResultRow label="V1" />
                  <BlankResultRow label="VR" />
                  <BlankResultRow label="V2" />
                  <BlankResultRow label="THS" />
                  <BlankResultRow label="Limitation" />
                  <BlankResultRow label="ENG OUT ACC" />
                </>
              )}
            </div>

            <div className="mini-card">
              <span>RWY LENGTH</span>
              <strong>{selectedRunway ? `${selectedRunway.lengthM} m` : '---'}</strong>
            </div>

            <div className="mini-card">
              <span>MTOW &#40;PERF&#41;</span>
              <strong>
                {result
                  ? `${(result.fieldLimitWeightKg / 1000).toFixed(1)} T`
                  : '---'}
              </strong>
            </div>
          </div>

          <div className="procedure-card">
            {result ? (
              <>
                <strong>EOSID: NON-STD.</strong>
                <p>
                  RWY {runwayIdent}. Maintain runway track. Follow published SID
                  unless otherwise instructed.
                </p>
                <p className="procedure-warning">
                  SIMULATION TOOL ONLY — NOT FOR REAL WORLD AVIATION.
                </p>
              </>
            ) : (
              <>
                <strong>NO COMPUTATION</strong>
                <p>Fill the takeoff data and press COMPUTE.</p>
                <p className="procedure-warning">
                  SIMULATION TOOL ONLY — NOT FOR REAL WORLD AVIATION.
                </p>
              </>
            )}
          </div>
        </section>

<aside className="right-panel">
  <div className="rwyviz">
    <div className="rwyviz-strip">
      <div className="rwyviz-threshold rwyviz-threshold-top" />
      <div className="rwyviz-threshold rwyviz-threshold-bottom" />
      <div className="rwyviz-centerline" />

      <div className="rwyviz-ident rwyviz-ident-top">
        {selectedRunway ? selectedRunway.oppositeIdent : '--'}
      </div>

      <div className="rwyviz-ident rwyviz-ident-bottom">
        {selectedRunway ? selectedRunway.ident : '--'}
      </div>

      <div className="rwyviz-length">
        {selectedRunway ? `${selectedRunway.lengthM} m` : '---- m'}
      </div>

      {result && selectedRunway && (() => {
        const pad = 10;
        const usable = 100 - pad * 2;

        const toraFraction = Math.min(
          1,
          Math.max(0, result.estimatedRequiredToraM / selectedRunway.lengthM),
        );

        const asdaFraction = Math.min(
          1,
          Math.max(0, result.estimatedRequiredAsdaM / selectedRunway.lengthM),
        );

        // Bottom = departure threshold. Top = far runway end.
        const toraTop = 100 - pad - toraFraction * usable;
        const asdaTop = 100 - pad - asdaFraction * usable;

        return (
          <>
            <div
              className="rwyviz-stop-margin"
              style={{
                top: '0%',
                height: `${toraTop}%`,
              }}
            >
              <div className="rwyviz-stop-margin-dash" />
              <div className="rwyviz-stop-margin-cap-top" />
              <div className="rwyviz-stop-margin-cap-bottom" />
              <div className="rwyviz-stop-margin-label">
                STOP
                <br />
                Margin
                <br />
                {result.toraMarginM} m
              </div>
            </div>

            <div
              className="rwyviz-asda-cross"
              style={{ top: `${asdaTop}%` }}
            >
              <div className="rwyviz-asda-line" />
              <div className="rwyviz-asda-label">
                ASDA {result.estimatedRequiredAsdaM} m
              </div>
            </div>
          </>
        );
      })()}
    </div>

    {result && (() => {
    const windMagnitude = Math.hypot(result.headwindKt, result.crosswindKt);

    const arrowRotDeg =
      windMagnitude < 0.5
        ? 0
        : Math.atan2(-result.crosswindKt, -result.headwindKt) *
          (180 / Math.PI);

      return (
        <div className="rwyviz-wind-simple">
          <div
            className="rwyviz-wind-arrow"
            style={{ transform: `rotate(${arrowRotDeg}deg)` }}
          >
            {windMagnitude < 0.5 ? '○' : '↑'}
          </div>

          <div className="rwyviz-wind-data">
            <div>{windRaw || '---'}</div>
            <div>HW {result.headwindKt} kt</div>
            <div>XW {Math.abs(result.crosswindKt)} kt</div>
          </div>
        </div>
      );
    })()}

    <button type="button" className="rwyviz-full-button">
      {intersection === 'FULL LENGTH' ? 'FULL' : 'INTX'}
    </button>
  </div>
</aside>
      </section>

      <footer className="app-footer">
        <button type="button" className="footer-tab active">
          TAKEOFF
        </button>
        <button type="button" className="footer-tab">
          LANDING
        </button>
      </footer>
    </main>
  );
}

export default App;
