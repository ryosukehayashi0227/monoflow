# Test Specification - MonoFlow

## 1. Overview
This document outlines the testing strategy, tools, and coverage for the MonoFlow application to ensure reliability, data integrity, and UI correctness.

## 2. Testing Tools
- **Unit Testing**: [Vitest](https://vitest.dev/)
    - Fast execution, compatible with Vite-like setups.
    - Used for core logic and utility functions.
- **E2E Testing**: [Playwright](https://playwright.dev/)
    - Reliable browser automation.
    - Used for user flows, UI interaction, and integration scenarios.

## 3. Test Coverage Strategy

### 3.1 Unit Level (Logic & Data)
Focus on pure functions and rigorous data manipulation logic.

| Suite | File | Scope |
|-------|------|-------|
| **I18n** | `unit/i18n.test.js` | Verifies translation keys exist for all supported languages (EN/JA) to prevent missing text. |
| **DataService** | `unit/data-service.test.js` | Tests foundational CRUD operations, LocalStorage interaction, and data integrity checks. |
| **Metrics** | `unit/metrics.test.js` | Validate calculation logic for Lead Time, Cycle Time, and Completion Rates. |

### 3.2 End-to-End Level (User Flows)
Focus on critical user journeys and browser interactions.

| Suite | File | Scenarios Covered |
|-------|------|-------------------|
| **Basic** | `e2e/basic.spec.js` | App load, Title verification, Simple Add/Edit Task flows. |
| **Drag & Drop** | `e2e/drag-drop.spec.js` | Moving tasks between columns (ToDo -> Done), state updates. |
| **Blocker** | `e2e/blocker.spec.js` | Dependency assignment, Connector drawing triggers, Done-guard warnings. |
| **Filter** | `e2e/filter-search.spec.js` | Real-time text search, Label filtering logic. |
| **Import/Export** | `e2e/import-export.spec.js` | JSON export generation, Valid JSON import, Data restoration. |
| **Archive** | `e2e/archive.spec.js` | Archiving tasks, restoring from archive, verification of removal from board. |
| **Data Integrity** | `e2e/import-integrity.spec.js` | Handling of *corrupted* or *invalid* JSON files. Ensures app robustly alerts instead of crashing. |
| **Localization** | `e2e/localization.spec.js` | Switching languages (JA <-> EN) via UI. Verifying text updates (e.g., "Board") and persistence. |
| **Theme** | `e2e/theme.spec.js` | Toggling Dark/Light mode, verifying class updates on `<html>` and persistence. |

## 4. Manual Verification Logic
While automated tests cover regressions, the following requires periodic manual review:
- **Visual Glitches**: Checking complex animations (e.g., Connector Bézier curves) for visual smoothness.
- **Mobile Usability**: Touch interaction quality on physical devices.
- **Accessibility**: Keyboard navigation (Tab index) and screen reader checks.

## 5. Execution
Run the full suite using the standard NPM scripts:

```bash
# Unit Tests
npm run test

# E2E Tests
npm run test:e2e

# E2E with UI Debugger
npm run test:e2e:ui
```
