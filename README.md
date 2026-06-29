# Flight Performance Tool

A web-based aircraft performance calculator built with React, TypeScript, and Vite.

This project is currently focused on an **Airbus A380-842 takeoff performance module** using a simulator-oriented calculation model. It allows the user to enter runway, weather, aircraft weight, thrust, flap, anti-ice, and configuration data to generate takeoff speeds and performance-related outputs.

## Live Website

https://tomassantosaviation.github.io/flight-performance-tool/

## Current Features

* Aircraft selection screen
* A380-842 takeoff performance module
* Runway data fetching by airport ICAO
* METAR-based weather input
* Manual wind, OAT, QNH, TOW, CG, flap, thrust, anti-ice, and runway condition inputs
* V-speed calculation
* FLEX/TOGA thrust output
* THS indication
* Limiting factor indication
* Runway visualization with:

  * Selected runway orientation
  * ASDA indication
  * Stop margin indication
  * Wind component display

## Tech Stack

* React
* TypeScript
* Vite
* CSS
* GitHub Pages

## Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build the production version:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment

This project is deployed using GitHub Pages through a GitHub Actions workflow.

The Vite base path is configured for:

```text
/flight-performance-tool/
```

## Important Disclaimer

This tool is for **flight simulation, education, and software development practice only**.

It is **not approved, certified, validated, or suitable for real-world aviation use**. The calculations, performance data, limitations, and outputs must not be used for real aircraft operation, dispatch, training, or decision-making.

Always use official aircraft performance software, approved manuals, certified operational data, and company procedures for real-world aviation.

## Project Status

Work in progress.

The current A380 module is being developed as a simulator-oriented performance model. Future improvements may include additional aircraft types, landing performance, improved performance tables, and a more advanced user interface.
