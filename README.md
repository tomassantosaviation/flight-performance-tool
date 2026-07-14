# Flight Performance Tool

**Created and maintained by Tomás Santos.**

Flight Performance Tool is a web-based aircraft performance calculator built with React, TypeScript, and Vite. It is designed for flight simulation, education, and software-development practice.

The project currently focuses on simulator-oriented Airbus A380-842 takeoff performance.

## Live Website

https://tomassantosaviation.github.io/flight-performance-tool/

## Supported Aircraft and Modules

### Aircraft

- Airbus A380-842
- Rolls-Royce Trent 972B-84
- Weight variant WV003

### Modules

- Takeoff performance
- Landing performance: planned

## Current Features

- Aircraft selection screen
- Airport and runway lookup by ICAO code
- Automatic and manual runway-data fetching
- METAR-based weather prefill
- Manual wind, OAT, QNH, TOW, CG, flap, thrust, anti-ice, air-conditioning, runway-condition, and intersection inputs
- V-speed calculation
- FLEX and TOGA thrust selection
- THS indication
- Field, climb, structural, runway-distance, wind, slope, and runway-width checks
- Performance warnings and status messages
- Runway visualization with:
  - Selected runway orientation
  - Required ASDA indication
  - Stop-margin indication
  - Headwind and crosswind display
- Automated calculator regression tests
- Automated lint and production-build checks

## Data Sources and Model Status

The application currently uses:

- Public runway and airport data from OurAirports
- METAR data from VATSIM
- Simulator-oriented A380 V-speed chart data
- Approximate, digitized, and placeholder performance models where certified manufacturer data is unavailable

Public airport, runway, and weather data must be verified manually. The calculation model is under active development and is not equivalent to approved Airbus, airline, or dispatch performance software.

## Technology

- React
- TypeScript
- Vite
- Vitest
- ESLint
- CSS
- GitHub Actions
- GitHub Pages

## Local Development

### Requirements

- Node.js 22 or a compatible current release
- npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

### Run the tests

```bash
npm test
```

### Run ESLint

```bash
npm run lint
```

### Create a production build

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

Before publishing a change, all three quality checks should succeed:

```bash
npm test
npm run lint
npm run build
```

## Deployment

The project is deployed to GitHub Pages through GitHub Actions.

The deployment workflow installs dependencies, runs the automated tests, runs ESLint, builds the production application, and then publishes the `dist` directory.

The Vite base path is configured for:

```text
/flight-performance-tool/
```

## Project Status

This project is a work in progress.

Planned improvements may include:

- Additional aircraft variants and aircraft types
- Landing-performance calculations
- Improved performance datasets and correction models
- More extensive automated test coverage
- Further interface and responsive-layout improvements

## Authorship and Attribution

Copyright © 2026 Tomás Santos.

This repository and its original source code were created and are maintained by **Tomás Santos**.

Reuse, modification, and redistribution are permitted under the MIT License. Copies or substantial portions of the software must retain the copyright notice and MIT permission notice contained in the [LICENSE](LICENSE) file.

## Important Aviation Disclaimer

This tool is intended only for **flight simulation, education, and software-development practice**.

It is **not approved, certified, validated, or suitable for real-world aviation use**. Its calculations, performance data, limitations, warnings, and outputs must not be used for:

- Real aircraft operation
- Flight dispatch
- Operational flight planning
- Pilot training decisions
- Takeoff or landing decision-making
- Compliance with aircraft, airport, airline, or regulatory requirements

For real-world aviation, always use approved aircraft performance software, official aircraft manuals, certified operational data, current airport documentation, and applicable company procedures.

## License

This project is licensed under the MIT License.

See the [LICENSE](LICENSE) file for the complete terms.