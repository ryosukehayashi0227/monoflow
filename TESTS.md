# MonoFlow Test Documentation

This document describes MonoFlow's testing strategy, test suite details, and execution methods.

---

## Testing Strategy

MonoFlow ensures code quality and reliability through a two-tier testing structure: unit tests and E2E tests.

### Testing Tools
- **Unit Tests**: [Vitest](https://vitest.dev/) v1.0.0
  - Fast execution, Vite-compatible test framework
  - Used for testing core logic and utility functions
- **E2E Tests**: [Playwright](https://playwright.dev/) v1.40.0
  - Reliable browser automation
  - Used for testing user flows, UI interactions, and integration scenarios
- **Test Server**: http-server v14.1.1
  - Local server for E2E tests
- **DOM Environment**: jsdom v23.0.0
  - DOM environment simulation for unit tests

---

## Unit Tests (3 files)

### tests/unit/i18n.test.js
Checks translation key completeness and ensures no missing translations across all languages.

| Test Name | Description |
|-----------|-------------|
| should have matching keys for all languages | Verifies that Japanese and English translation keys match completely. Checks for missing or extra keys. |

**Purpose**: Prevents missing UI string translations and ensures multi-language support quality.

---

### tests/unit/data-service.test.js
Tests DataService CRUD operations and LocalStorage integration.

| Test Name | Description |
|-----------|-------------|
| should save data to localStorage | Verifies data can be correctly saved to LocalStorage |
| should load data from localStorage | Verifies data can be correctly loaded from LocalStorage |
| should return null if no data in localStorage | Verifies null is returned when no data exists |

**Purpose**: Ensures reliability of DataService, the foundation of data persistence.

---

### tests/unit/metrics.test.js
Tests metrics calculation logic (lead time, cycle time, completion rate) accuracy.

| Test Name | Description |
|-----------|-------------|
| should calculate average lead time correctly | Verifies correct calculation of average lead time (time from creation to completion) |
| should calculate completion rate correctly | Verifies correct calculation of completion rate (completed tasks / total tasks) |
| should handle zero tasks gracefully | Verifies no errors occur with zero tasks and appropriate default values (0%) are returned |

**Purpose**: Ensures accuracy of analytics feature calculation logic.

---

## E2E Tests (11 files)

### tests/e2e/basic.spec.js
Tests basic task creation and editing functionality.

| Test Name | Description |
|-----------|-------------|
| should load the page and show title | Verifies page loads correctly and displays "MonoFlow" title |
| should add a new task | Verifies entering task name in input field and pressing Enter adds new task to "To Do" column |
| should edit a task | Verifies clicking task card opens modal, editing task name and saving updates the task name on the board |

**Purpose**: Ensures the most basic application functionality works correctly.

---

### tests/e2e/drag-drop.spec.js
Tests drag-and-drop functionality and status updates.

| Test Name | Description |
|-----------|-------------|
| should move a task from To Do to In Progress | Verifies task can be moved from "To Do" to "In Progress" via drag-and-drop. Validates task disappears from original column and appears in new column. Confirms changes persist after reload. |

**Purpose**: Ensures drag-and-drop functionality using SortableJS and data persistence work correctly.

---

### tests/e2e/blocker.spec.js
Tests blocker (dependency task) functionality and connector drawing.

| Test Name | Description |
|-----------|-------------|
| should warn when moving blocked task to Done | Verifies setting Task A as blocker for Task B, then attempting to move Task B to "Done" while Task A is incomplete displays warning dialog. Validates Task B can be moved to "Done" after completing Task A. |

**Purpose**: Maintains dependency relationship integrity and prevents tasks with incomplete blockers from being incorrectly marked as complete.

---

### tests/e2e/filter-search.spec.js
Tests search and filtering functionality.

| Test Name | Description |
|-----------|-------------|
| should filter tasks by search query | Verifies entering text in search input displays only tasks with matching title or description notes, hiding non-matching tasks |
| should filter tasks by priority | Verifies selecting "High" in priority filter displays only high-priority tasks, hiding other priority tasks |

**Purpose**: Ensures real-time search and filtering functionality works correctly, enabling quick information retrieval from large task lists.

---

### tests/e2e/import-export.spec.js
Tests data import/export functionality.

| Test Name | Description |
|-----------|-------------|
| should export data as JSON | Verifies clicking export button downloads current application state in JSON format |
| should import valid JSON data | Verifies importing valid JSON file correctly restores data and displays tasks on board |
| should restore state after import | Verifies all state (task content, priority, labels, parent-child relationships) is correctly restored after import |

**Purpose**: Ensures data backup and restoration functionality works correctly, enabling users to safely manage their data.

---

### tests/e2e/import-integrity.spec.js
Tests handling of invalid data.

| Test Name | Description |
|-----------|-------------|
| should handle corrupted JSON gracefully | Verifies attempting to import corrupted JSON file (invalid syntax) displays error message and application doesn't crash |
| should show error message for invalid data | Verifies importing JSON file with invalid data structure (missing required fields) displays appropriate error message |
| should not crash on malformed import | Verifies application continues to operate stably even when malformed import occurs |

**Purpose**: Ensures robustness against unexpected data and maintains user experience.

---

### tests/e2e/import-confirm.spec.js
Tests import confirmation dialog.

| Test Name | Description |
|-----------|-------------|
| should show confirmation dialog on import | Verifies confirmation dialog "Current data will be lost, are you sure?" appears when importing data |
| should cancel import on user rejection | Verifies selecting "Cancel" in confirmation dialog aborts import and preserves current data |

**Purpose**: Prevents accidental data overwrites and provides clear choices to users.

---

### tests/e2e/archive.spec.js
Tests archive functionality.

| Test Name | Description |
|-----------|-------------|
| should archive and restore a task | Verifies archiving task hides it from board and displays it in archive modal. Validates clicking restore button returns task to board. |

**Purpose**: Ensures task soft-delete (archive) functionality works correctly and tasks can be restored when needed.

---

### tests/e2e/localization.spec.js
Tests language switching functionality.

| Test Name | Description |
|-----------|-------------|
| should switch language from Japanese to English | Verifies clicking language toggle button to switch from Japanese to English updates all UI text to English |
| should switch language from English to Japanese | Verifies clicking language toggle button to switch from English to Japanese updates all UI text to Japanese |
| should persist language preference | Verifies language setting persists after page reload |

**Purpose**: Ensures multi-language support works correctly and user language settings are persisted.

---

### tests/e2e/theme.spec.js
Tests theme switching functionality.

| Test Name | Description |
|-----------|-------------|
| should toggle dark mode | Verifies clicking theme toggle button to switch to dark mode adds `dark` class to `<html>` element and applies dark theme styles |
| should toggle light mode | Verifies clicking theme toggle button to switch to light mode removes `dark` class from `<html>` element and applies light theme styles |
| should persist theme preference | Verifies theme setting persists after page reload |

**Purpose**: Ensures dark/light mode switching works correctly and user settings are persisted.

---

### tests/e2e/grouping.spec.js
Tests parent-child hierarchy and virtual card functionality.

| Test Name | Description |
|-----------|-------------|
| should group children under a single virtual parent in Done column | Verifies when parent task is in "To Do" column and two child tasks are in "Done" column, "Done" column displays exactly one virtual parent card with two child tasks below. Validates virtual parent card is not duplicated. |

**Purpose**: Ensures visual representation of parent-child hierarchy (virtual cards) works correctly and relationships between tasks in different columns are clearly displayed.

---

## Test Summary

- **Unit Tests**: 3 files
- **E2E Tests**: 11 files
- **Total**: 14 test files
- **Coverage**: Covers major functionality

### Coverage Areas
- ✅ Data persistence (DataService)
- ✅ Multi-language support (i18n)
- ✅ Metrics calculation
- ✅ Task CRUD operations
- ✅ Drag & drop
- ✅ Blockers/dependencies
- ✅ Search and filtering
- ✅ Data import/export
- ✅ Archive functionality
- ✅ Language switching
- ✅ Theme switching
- ✅ Parent-child hierarchy

---

## Test Execution

### Unit Tests
```bash
# Run all unit tests
npm test

# Watch mode (auto-rerun on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run in UI mode (useful for debugging)
npm run test:e2e:ui

# Run specific test file only
npx playwright test tests/e2e/basic.spec.js

# Disable headless mode (show browser)
npx playwright test --headed
```

### Pre-test Setup
E2E tests automatically start a local server, but for manual verification:
```bash
# Start local server
npx http-server -p 8080

# Open http://localhost:8080 in browser
```

---

## Test Creation Guidelines

### Unit Test Best Practices
1. **Test pure functions**: Prioritize testing functions without side effects
2. **Use mocks**: Mock LocalStorage and DOM
3. **Cover edge cases**: Test empty data, null, undefined, boundary values
4. **Clear test names**: Use names that clearly indicate test purpose

### E2E Test Best Practices
1. **Cleanup in beforeEach**: Clear LocalStorage before each test
2. **Stable selectors**: Use IDs or data attributes (avoid class names)
3. **Explicit waits**: Confirm element visibility with `expect().toBeVisible()`
4. **User perspective**: Mimic actual user operations

### Test Naming Conventions
```javascript
// Unit tests
describe('ModuleName', () => {
    it('should [expected behavior]', () => {
        // Test implementation
    });
});

// E2E tests
test.describe('Feature Name', () => {
    test('should [user action]', async ({ page }) => {
        // Test implementation
    });
});
```

---

## Continuous Integration

### Pre-commit Checklist
- [ ] All unit tests pass (`npm test`)
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] Added corresponding tests for new features
- [ ] Verified existing tests aren't broken

### Pre-pull Request Checklist
- [ ] All tests pass
- [ ] Added new test cases (for new features)
- [ ] Updated TESTS.md (if new test files added)
- [ ] Verified test coverage hasn't decreased

---

## Troubleshooting

### Unit Test Failures
1. **LocalStorage clearing**: Verify cleared in `beforeEach`
2. **Mock setup**: Verify required global variables and DOM are mocked
3. **Async handling**: Verify `async/await` is used appropriately

### E2E Test Failures
1. **Timeout**: Adjust wait time if element loading takes time
2. **Selector changes**: Verify selectors aren't invalidated by HTML changes
3. **Browser state**: Verify LocalStorage is correctly cleared
4. **Debug with UI mode**: Visually verify with `npm run test:e2e:ui`

### Common Errors
```bash
# Error: Timeout waiting for element
# Solution: Use more specific selector or increase wait time

# Error: localStorage is not defined
# Solution: Verify jsdom is correctly configured

# Error: Cannot find module
# Solution: Verify import path is correct (relative path)
```

---

## Future Test Expansion Plans

### Planned Test Cases
- [ ] Performance tests (verify operation with large task volumes)
- [ ] Accessibility tests (keyboard navigation)
- [ ] Visual regression tests (screenshot comparison)
- [ ] Mobile device tests (touch operations)

### Test Coverage Goals
- Unit tests: 80%+ coverage
- E2E tests: 100% coverage of major user flows

---

**MonoFlow** - Quality Assured Through Reliable Testing
