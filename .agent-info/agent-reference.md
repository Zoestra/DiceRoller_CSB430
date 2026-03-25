# Project Context: Superstitious Dice Roller

**Version:** 1.0  
**Framework:** React Native (Expo)  
**Database:** SQLite (expo-sqlite)

---

**Document Purpose:** This file serves as the single source of truth for project structure, logic, and requirements. Any agent or developer should reference this before making changes to ensure alignment with the project's architectural vision. This file should be updated, with user's permission, as the project evolves.

**Important Note:** This file is stored locally in `.agent-info/` and is NOT tracked in git. It is for AI agent context only. Do not commit this file to the repository.

---

## 0. Task Assignment Boundaries

**For AI Agents:** Only work on issues assigned to **Zoestra (Zoe)**. Actively avoid implementing features assigned to other team members.

| Assignee | Issues to Work On | Issues to Avoid |
|----------|-------------------|-----------------|
| **Zoestra (Zoe)** | ✅ Issues assigned to Zoestra | ❌ Issues assigned to Sealshusky or DallasWed |
| **Sealshusky (Turan)** | ❌ Settings, Collection page | ✅ Already implemented: database layer |
| **DallasWed (Dallas)** | ❌ Shop, Achievements, Skins | ✅ Already implemented: database layer |

**Rationale:**
- Each team member is responsible for their own features
- Database layer is shared infrastructure (already implemented)
- Avoiding stepping on teammates' toes
- Focus on Zoe's responsibilities: Dice Rolling screen, Stats screen, and core game logic

**When in doubt:** Check `issues.txt` for assignment before implementing new features.

## 1. Project Overview

This project is an assignment for CSB430 - Software Design and Implementation. The team consists of 3 members.

| Name   | Github username | Duties                                          |
| ------ | --------------- | ----------------------------------------------- |
| Zoe    | Zoestra         | Project Lead, Dice Rolling screen, Stats screen |
| Turan  | Sealshusky      | Settings, Collection page                       |
| Dallas | DallasWed       | Shop page, Achievements page                    |

### 1.1 Purpose

This is a mobile dice rolling application with a unique twist: **dice superstitions are real**. Each dice set has a hidden "attitude" or bias that affects the probability distribution of rolls. Users collect dice sets, earn points through rolling, purchase new sets/skins from a shop, and unlock achievements.

### 1.2 Core Mechanics

| Mechanic           | Description                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------- |
| **Dice Attitudes** | Each dice set has a bias (Lucky, Cursed, Balanced, etc.) that weights the random number table |
| **Point Economy**  | Users earn points per roll, spend points in shop on sets/skins                                |
| **Achievements**   | Track patterns in roll history (e.g., Nat 20 count, total rolls)                              |
| **Skins**          | Cosmetic overlays for dice visuals, purchased and equipped separately                         |
| **Roll History**   | All rolls persisted to SQLite for stats and achievement tracking                              |

### 1.3 Target Users

- **Ritualist Riley:** Superstitious tabletop gamer who believes in dice luck. Wants to validate biases through stats.

---

## 2. Architecture

### 2.1 Architectural Style: Layered (MVC Variant)

```
┌─────────────────────────────────────────────────┐
│                    VIEW LAYER                    │
│  (React Native Screens, Components, UI)         │
│  - RollScreen, StatsScreen, ShopScreen, etc.    │
├─────────────────────────────────────────────────┤
│                 CONTROLLER LAYER                 │
│  (DiceContext.js - Global State Management)     │
│  - Points, EquippedSet, ActiveDie, Skins        │
├─────────────────────────────────────────────────┤
│                   MODEL LAYER                    │
│  (db.js, diceLogic.js - Data & Business Logic)  │
│  - SQLite Queries, Weighted Roll Functions      │
│                                                  │
│  Database Module Structure:                      │
│  ┌──────────────────────────────────────────┐   │
│  │  db.js (core + re-exports)               │   │
│  │  ├─ userState.js (points, settings)      │   │
│  │  ├─ rollHistory.js (stats, distribution) │   │
│  │  ├─ diceSets.js (TODO - sealshusky)                   │   │
│  │  ├─ skins.js (TODO - dallasWed)          │   │
│  │  └─ achievements.js (TODO - dallasWed)   │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### 2.2 Key Architectural Decisions

| Decision                  | Rationale                             |
| ------------------------- | ------------------------------------- |
| **Global Context**        | Avoid prop-drilling, centralize state |
| **SQLite Local DB**       | Offline-first, no server needed       |
| **Functional Components** | React Native standard, not OOA        |
| **Separated Logic**       | `diceLogic.js` isolated from UI       |
| **Schema in SQL File**    | Single source of truth, loaded at runtime by `db.js` |
| **Modular Query Layer**   | Separate files per domain (userState, rollHistory, etc.) for maintainability |
| **Re-export Pattern**     | `db.js` re-exports all queries for single import point |

### 2.3 Rejected Architectures

- **Object-Oriented Architecture:** Conflicts with React's functional component model and unidirectional data flow.
- **Remote Procedure Call:** Unnecessary for local-only app; would add network overhead.

---

## 3. Database Schema

**Location:** `/src/db/init-db.sql`

### 3.1 Table Structure

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `dice_sets` | Stores available dice sets with attitudes | `id`, `set_name`, `attitude`, `owned`, `equipped` |
| `skins` | Stores cosmetic skins for dice | `id`, `skin_name`, `skin_description`, `skin_folder`, `owned`, `equipped` |
| `roll_history` | Tracks all dice rolls | `id`, `set_id`, `die_type`, `result`, `rolled_at` |
| `achievements` | Tracks achievement definitions | `id`, `achv_name`, `achv_description`, `achv_script`, `achv_image`, `reward_points`, `claimed` |
| `user_state` | Single-row global state | `id` (always 1), `points`, `total_rolls`, `dark_mode` |

### 3.2 Key Queries

**Implemented in:** `/src/db/userState.js`, `/src/db/rollHistory.js`

| Function | Purpose | SQL Operation |
|----------|---------|---------------|
| `getPoints()` | Get current points | `SELECT points FROM user_state WHERE id = 1` |
| `setPoints(points)` | Update points | `UPDATE user_state SET points = ? WHERE id = 1` |
| `addPoints(amount)` | Add points | `UPDATE user_state SET points = points + ? WHERE id = 1` |
| `deductPoints(amount)` | Deduct points (with validation) | Check + UPDATE |
| `insertRoll(setId, dieType, result)` | Log a roll | `INSERT INTO roll_history` + increment `total_rolls` |
| `getRollHistory({ setId, limit })` | Get roll history | `SELECT * FROM roll_history WHERE set_id = ? ORDER BY rolled_at DESC LIMIT ?` |
| `getDiceSetStats(setId)` | Get aggregated stats | `COUNT`, `AVG`, `MIN`, `MAX`, `SUM(CASE...)` |
| `getRollDistribution(setId)` | Get histogram data | `SELECT result, COUNT(*) GROUP BY result` |

**Current defaults note:** `DEFAULT_POINTS` is centralized in `/src/db/userState.js` and currently set to `0`. Schema default and seed values in `init-db.sql` are also `0`.

**Placeholder modules (to be implemented):**
- `/src/db/diceSets.js` - Issues #17, #18
- `/src/db/skins.js` - Issues #24-27, #39 (dallasWed)
- `/src/db/achievements.js` - Issues #28-31, #39 (dallasWed)

---

## 4. Core Logic

### 4.1 Dice Attitudes (Issue #8)

Each attitude modifies the probability distribution:

| Attitude     | Bias Behavior                                      |
| ------------ | -------------------------------------------------- |
| **Balanced** | Uniform distribution                               |
| **Lucky**    | Weighted toward high numbers                       |
| **Cursed**   | Weighted toward low numbers                        |
| **Chaotic**  | Extreme variance (1s and max)                      |
| **Betrayer** | begins lucky, then takes a turn and only rolls low |
| **Mid**      | biased towards average results                     |

### 4.2 Pending Direction (Zoe)

- **No true Lucky sets:** Going forward, any set labeled `Lucky` should behave as a `Betrayer` under the hood.
- **Betrayer turn range:** Hidden `betrayer_turn_after` value uses `21..99` (`20 < x < 100`).
- **Assignment timing:** `betrayer_turn_after` is assigned when a Betrayer set is first purchased and remains hidden from normal UI.

## 5. File Structure

**Database Layer (`/src/db/`):**

| File | Purpose | Status |
|------|---------|--------|
| `init-db.sql` | Database schema + seed data | ✅ Complete |
| `db.js` | Core DB connection + re-exports | ✅ Complete |
| `userState.js` | User state queries (points, settings) | ✅ Complete |
| `rollHistory.js` | Roll history queries (stats, distribution) | ✅ Complete |
| `diceSets.js` | Dice set queries | ⏳ Placeholder (Issue #17, #18) |
| `skins.js` | Skin queries | ⏳ Placeholder (dallasWed) |
| `achievements.js` | Achievement queries | ⏳ Placeholder (dallasWed) |
| `__tests__/db.test.js` | Jest unit tests for DB | ✅ Complete |

**Test Configuration:**

| File | Purpose |
|------|---------|
| `jest.config.js` | Jest configuration (`jest-expo`) with `@/` alias mapping only — no module mocks |
| `jest.setup.js` | Minimal shared Jest bootstrap |
| `src/db/__tests__/testDatabase.js` | Per-test temporary SQLite harness using `better-sqlite3` + production schema |
| `src/__tests__/DiceContext.test.js` | Rendered DiceContext tests using `@testing-library/react-native` with the real temporary SQLite harness |

**Utilities:**

| File | Purpose |
|------|---------|
| `scripts/initDB.js` | CLI utility to copy schema for documentation |

## 6. User Flows

### 6.1 Roll Flow

```
1. User opens RollScreen
2. User shakes device OR taps Roll Button
3. diceLogic.js generates weighted result
4. Result INSERTED into roll_history

```

### 6.2 Purchase Flow (Sets & Skins)

```
1. User navigates to Collection/Shop
2. shopLogic.js checks points_balance
3. User taps Buy on item
4. If sufficient: deduct points, mark owned, equip
5. If insufficient: show error toast
6. DiceContext refreshes state
7. UI reflects new ownership/equipment
```

### 6.3 Achievement Flow

```
1. Achievements are only checked when achievement screen is opened
2. Progress updated in user_achievements table
3. When threshold met: mark completed_at
4. User navigates to AchievementsScreen
5. User taps Claim on completed achievement
6. Points awarded, claimed flag set
7. DiceContext updates points balance
```

### 6.4 Stats Flow

```
1. User navigates to StatsScreen
2. SQL queries run with set_id + die_type filter
3. Data passed to react-native-chart-kit
4. Histogram renders distribution
5. Summary text shows total rolls, average, etc.
```

---

## 7. GitHub Issues Reference

refer to issues.txt for the full list of issues.
refer to issues_sprint_1.txt for the current tasks

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Configuration:** Jest with `jest-expo` preset

**Command:** `npm test`

**Implemented Tests:**

| Test Suite | Test Cases | Status |
|------------|------------|--------|
| DB Operations | `src/db/__tests__/db.test.js` coverage for user state, roll history, triggers, and Betrayer persistence | ✅ 16 tests |
| Skins DB | `src/db/__tests__/skins.test.js` basic skin query coverage | ✅ 2 tests |
| Dice Logic | `src/__tests__/diceLogic.test.js` weighted behavior, Betrayer switching, d100 behavior, invalid inputs | ✅ 8 tests |
| Roll Logic | `src/__tests__/rollLogic.test.js` roll pipeline, unknown set guard, Betrayer path, d100 integration | ✅ 5 tests |
| Dice Context | `src/__tests__/DiceContext.test.js` provider wiring and context state sync | ✅ 6 tests |

**Total:** 37 passing tests

**Test Patterns:**
- Each test runs against a real SQLite database created from `init-db.sql` via `src/db/__tests__/testDatabase.js`
- `beforeEach`: creates a fresh temp DB file, injects it into `db.js` via `__setOpenDatabaseForTests()`, clears cached connection via `__resetDbForTests()`
- `afterEach`: tears down temp DB file and folder via `teardownTestDatabase()`
- `afterAll`: restores production DB opener via `__restoreOpenDatabaseForTests()`
- Roll history tests use seeded `dice_sets` IDs (1–4) from the schema seed data to satisfy FK constraints
- No module mocks — `expo-sqlite` is not mocked; real SQL runs against real schema
- DiceContext tests render a real provider tree via `@testing-library/react-native` and verify context state propagation against the same temp SQLite harness
- Test both success and failure paths

### 8.2 Integration Tests (Issue #23)

- Full flow: Buy Set → Roll (Shake/Btn) → Check Stats → Reset
- Data persistence across app restarts
- Context state propagation across screens

### 8.3 Device Testing (Issue #22)

- Shake sensitivity on physical device
- False positive prevention during normal use
- Performance with 1000+ roll history rows (Issue #21)

---

## 9. CI/CD Pipeline

CI/CD pipeline is implemented in `.github/workflows/ci-cd.yml`.

### 9.1 Workflow Behavior

- Runs on `pull_request` to `main`
- Runs on `push` to `main`
- Includes one required job: **Lint & Test**
- Step order:
	1. `npm ci`
	2. `npm run lint`
	3. `npm test -- --ci --runInBand`

### 9.2 Notes on Build Step

- EAS build integration was explored during development but intentionally removed.
- Current workflow aligns with assignment minimum CI requirements (install + lint + tests).
- No `eas.json` is present in the repository.

### 9.3 Code Quality

- **ESLint:** React Native config enforced
- **Jest:** Minimum 2 test cases per logic module
- **README:** Must include CI/CD screenshot

---

## 10. Design Considerations

### 10.1 Architectural Considerations

| Consideration  | Implementation                                            |
| -------------- | --------------------------------------------------------- |
| **Economy**    | SQLite indexes, Context over prop-drilling                |
| **Visibility** | DB row count in Settings , real-time Context updates      |
| **Spacing**    | Separated logic/db/ui folders, isolated unit testing      |
| **Symmetry**   | Consistent purchase/claim flows across Shop/Achievements  |
| **Emergence**  | Achievements emerge from roll history data, not hardcoded |

### 10.2 Accessibility

- Dark/Light mode toggle
- Clear visual feedback on purchases
- Simple stats visualization vs. raw data

---

## 11. Known Constraints

| Constraint           | Impact                                                        |
| ----------------     | ------------------------------------------------------------- |
| **Local-Only**       | No cloud sync; data tied to device (no auth/login required)   |
| **SQLite**           | Query performance must be optimized with indexes              |
| **Expo Sensors**     | Shake detection requires physical device for accurate testing |
| **Small Team**       | Only 3 members on this project                                |
| **Quick turnaround** | this project is due in just over a week                       |

---

## 12. Agent Instructions

When assisting with this project, an AI agent should:

1. **Reference Issue Numbers:** Always tie suggestions to specific GitHub Issues (e.g., "This affects Issue #8").
2. **Respect Architecture:** Do not suggest OOA patterns; maintain functional/layered approach.
3. **Database First:** For new features, define schema changes before logic or UI.
4. **Context Awareness:** State changes must flow through `DiceContext.js` (Issue #5, #32).
5. **Test Coverage:** Any new logic module requires Jest tests (Issues #37-#39).
6. **Offline-First:** No features should require network connectivity.

---

## 13. Quick Reference Commands

```bash
# Start development server
npx expo start

# Run tests
npm test

# Run linter
npm run lint

# Initialize database (development)
node scripts/initDB.js

# View SQLite data (development)
npx expo-sqlite-viewer
```

---

## 14. Developer Preferences & Conventions

### 14.1 Code Style Preferences (Zoe - Project Lead)

| Preference | Reason | Example |
|------------|--------|---------|
| **No arrow functions** | Readability - explicit function syntax is clearer | Use `function(x) { return x * 2; }` instead of `x => x * 2` |
| **Explicit async/await** | Avoid Promise chains for readability | Use `const r = await fetch(); const d = await r.text();` instead of `fetch().then(r => r.text())` |
| **Clear function parameters** | Avoid circular dependencies | Pass dependencies as arguments, don't hide them in closures |
| **Prefer Java-style JavaScript readability** | Improve clarity and consistency with course/team preferences | Favor explicit function declarations, early returns, and straightforward control flow over concise JS idioms |
| **Prefer JavaScript over TypeScript (if avoidable)** | Stay within class boundaries and avoid introducing concepts not covered yet | Use `.js` / `.jsx` for new app logic unless TypeScript is required by existing code |
| **Prefer surfacing errors over silent defaults** | Hiding failures makes bugs invisible | Remove try/catch blocks that swallow errors and substitute plausible-looking defaults; let failures surface as visible errors unless there is a specific recovery plan |
| **Fail-fast guard for `useDiceContext`** | Surface provider wiring mistakes immediately during development/testing | Throw an error when `useDiceContext` is called outside `DiceProvider` |
| **AI disclosure comments** | Academic integrity | All AI-assisted files must have `NOTE: This file was written with AI assistance (${agent's name}).` in header |
| **No emojis in code** | Professionalism and clarity - emojis can distract from readability and look unprofessional in code | Use `ERROR:` instead of `❌`, use plain text labels instead of visual symbols |

### 14.1.2 Language Scope Preference (Zoe)

- Avoid introducing TypeScript when JavaScript is sufficient for the task.
- Prefer migrating AI-introduced TypeScript additions back to JavaScript when feasible and low-risk.
- If TypeScript is required by existing architecture, explain why before implementing.

### 14.1.1 AI Explanation Format Preference (Zoe)

- Prefer **bigger explanation chunks** (e.g., full function-level walkthroughs) instead of line-by-line micro-fragments.
- Use **inline code** for fine-grained clarifications (e.g., `points`, `Promise.all`, `[]`) rather than separate fenced blocks for every token.
- Keep fenced code blocks for meaningful sections (types, full functions, or coherent blocks). **Always use syntax-highlighted fenced code blocks when doing file walkthroughs** — plain prose without code blocks is not acceptable for code explanations.
- Bias toward readability and flow over exhaustive per-line decomposition unless explicitly requested.

### 14.2 AI Assistance Disclosure

All files that have been created or significantly modified with AI assistance must include the following disclaimer in the JSDoc header:

```javascript
/**
 * [File description]

 * ---
 * NOTE: This file was written with AI assistance (${agent's name}).
 * ---
 */
```
You should put your name in the disclaimer, or append it to the names already there, if one already exists

This is a project requirement for academic integrity and transparency.

---

## 15. Recent Changes

### 2026-03-23 00:01 PDT

- `useDiceContext` guard behavior is now **fail-fast** (throws outside `DiceProvider`) instead of returning a soft warning fallback.
- Points default is now centralized as `DEFAULT_POINTS` in `/src/db/userState.js` and currently set to `0`.
- Database `user_state.points` schema default and seed value in `/src/db/init-db.sql` are both `0`.
- Root layout has been migrated from `/src/app/_layout.tsx` to `/src/app/_layout.js` to align with JavaScript-first preference.
- Developer preferences now explicitly include a Java-style JavaScript readability preference.

### 2026-03-23 (later)

- Added hidden Betrayer turn support in DB (`betrayer_turn_after`) with first-purchase assignment.
- Updated Betrayer hidden turn validation/range to `20 < x < 100`.
- Team direction captured: Lucky-labeled sets should behave as Betrayer in future implementation passes.

### 2026-03-23 (PR hardening pass)

- Enabled runtime foreign key enforcement in `getDB()` with `PRAGMA foreign_keys = ON`.
- Updated `rollDie` write path to use a single DB transaction (`BEGIN`/`COMMIT`/`ROLLBACK`) for roll + points atomicity.
- Added regression coverage for unknown `setId` handling (`Unknown dice set` throw path).
- Confirmed `useDiceContext` remains fail-fast by project preference (throws outside `DiceProvider`).

### 2026-03-23 (runtime DB bootstrap + web asset fix)

- `db.js` now bootstraps SQLite schema at runtime from `/src/db/init-db.sql` (single source of truth preserved; no JS schema duplication).
- Runtime DB open path in `db.js` uses cached `db` + `dbPromise` for concurrency-safe first access.
- Test harness compatibility maintained: when `__setOpenDatabaseForTests()` injects a test opener, runtime SQL-asset bootstrap is skipped.
- Added Metro asset handling for both `wasm` and `sql` in `/metro.config.js` to support Expo web sqlite worker + SQL asset loading.
- Current baseline after merge hardening: lint passes and Jest reports 4 suites / 35 tests passing.

### 2026-03-24 (merge conflict sanity + ownership trace)

- Conflict-line ownership in `src/app/(tabs)/_layout.jsx` was traced with `git blame`/history:
	- `dice-shop` route and DB bootstrap block came from `dallasWed` commits.
	- settings/theme/collection tab changes came from `Sealshusky` commits.
- `dice-collection` route file history: initially created as `src/app/(tabs)/dice-collection.tsx`, then deleted in a follow-up commit as an accidental file.
- Current branch runtime DB bootstrap is implemented in `src/app/(tabs)/_layout.jsx` (initialize-on-first-run flow), not in `db.js`.
- Current validated baseline: Jest 5 suites / 37 tests passing, ESLint with warnings only (no errors).

---
