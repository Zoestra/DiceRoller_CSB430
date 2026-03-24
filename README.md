# Superstitious Dice Roller

An Expo React Native app that implements attitude-based, weighted dice rolls with a local points economy and persistent roll history.

This repository is the codebase for the CSB430 assignment. Key source files:

- Core logic: [src/diceLogic.js](src/diceLogic.js)
- Roll pipeline: [src/rollLogic.js](src/rollLogic.js)
- Global state/provider: [src/DiceContext.js](src/DiceContext.js)
- Database layer: [src/db/db.js](src/db/db.js)
- Tests: [src/__tests__](src/__tests__)

Table of contents
- Project overview
- Quick start
- Key features
- High-level architecture
- Demo walkthrough (core flow)
- Testing & CI
- Development notes and recommendations
- Contributing

## Project overview

This app simulates dice rolling where each dice set has an "attitude" that biases results (Lucky, Cursed, Chaotic, Mid, Balanced, or Betrayer). Users earn points based on roll results, collect and equip dice sets/skins, and view statistics derived from a persistent roll history stored in SQLite.

Problem statement: provide a reproducible, testable, and maintainable client-side dice roller that separates presentation, business logic, and persistence while supporting cross-platform development (iOS/Android/Web via Expo).

## Quick start

Install dependencies and start the development server:

```bash
npm install
npx expo start
```

Run the unit test suite:

```bash
npm test
```

Run the linter:

```bash
npm run lint
```

## Key features

- Attitude-weighted dice logic and percentile (d100) support ([src/diceLogic.js](src/diceLogic.js)).
- Atomic roll pipeline: resolve set config → weighted roll → persist roll + award points inside a DB transaction ([src/rollLogic.js](src/rollLogic.js)).
- Global application state via `DiceProvider` (points, equipped set, active die) ([src/DiceContext.js](src/DiceContext.js)).
- Local persistence with SQLite and runtime schema bootstrap from `src/db/init-db.sql` ([src/db/db.js](src/db/db.js)).
- Unit and integration tests using Jest and `@testing-library/react-native` (see [src/__tests__](src/__tests__)).

## High-level architecture

- View: Expo + React Native screens and components under `src/app/` and `src/components/`.
- Controller: `DiceProvider` in [src/DiceContext.js](src/DiceContext.js) exposes state and mutation helpers to UI.
- Model: `src/db/` query modules and `src/diceLogic.js` implement business logic and persistence.

The database module (`src/db/db.js`) re-exports domain query modules (userState, rollHistory, diceSets, skins, achievements) and manages schema initialization and a cached DB connection.

## Demo walkthrough — core flow

1. Open the app and go to the Roll screen (`src/app/(tabs)/roll.jsx`).
2. Choose a dice set and die type, then tap the roll button.
3. The UI invokes `rollLogic.rollDie({ setId, dieType })` which:
   - Loads set config from the DB (attitude, betrayer threshold, roll count).
   - Resolves effective attitude (handles `Betrayer` → Lucky/Cursed based on turn threshold).
   - Computes a weighted result via `getWeightedResult` or `getD100Result`.
   - Persists the roll (`insertRoll`) and updates points (`addPoints`) inside a DB transaction.
4. `DiceProvider` refreshes state from the DB and the UI updates points and history.

## Testing & CI

- Tests: Jest + `jest-expo` preset; test suites live in `src/__tests__` including `diceLogic.test.js`, `rollLogic.test.js`, and `DiceContext.test.js`.
- DB test harness: test helpers in `src/db/__tests__/testDatabase.js` create a temporary SQLite instance seeded from `init-db.sql` and use injection helpers exported by `src/db/db.js`.
- CI: the repo contains a CI workflow (see `.github/workflows`) that runs `npm ci`, `npm run lint`, and `npm test` on PRs and pushes. If the workflow is missing, add a GitHub Actions job that runs tests and lint.


<!--
  Project README for the Superstitious Dice Roller
  NOTE: This README was created with AI assistance.
-->

