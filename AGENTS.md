# AGENTS.md - AI Agent Collaboration Guide

## Overview

This document provides guidelines for AI coding assistants (Claude, Gemini, etc.) working on the MonoFlow project. It covers project structure, development workflows, testing requirements, and common patterns to help agents contribute effectively.

## Project Summary

**MonoFlow** is a professional, browser-based personal Kanban application designed for high-performance productivity. It prioritizes zero-config portability, **100% local data privacy (Offline-First)**, and actionable analytics.

### Key Features
- **Privacy-First**: All data stored locally in browser's LocalStorage
- **Offline Operation**: Fully functional without internet connection
- **Advanced Task Management**: 2-level hierarchy, dependency tracking, stale detection
- **Analytics**: Metrics dashboard and burndown charts
- **Bilingual**: Full support for Japanese and English
- **Touch-Optimized**: Seamless drag-and-drop on mobile devices

---

## Tech Stack

### Core Technologies
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS (Utility-first design)
- **Data Storage**: Browser LocalStorage
- **Icons**: Lucide Icons (CDN)

### Libraries (CDN)
- **Chart.js v4**: High-performance data visualization
- **SortableJS**: Reliable, touch-compatible drag-and-drop

### Testing Tools
- **Vitest v1.0.0**: Unit testing framework
- **Playwright v1.40.0**: E2E browser automation
- **jsdom v23.0.0**: DOM environment for unit tests
- **http-server v14.1.1**: Local test server

---

## Architecture & Core Agents

MonoFlow follows a modular architecture with specialized agents/services handling distinct responsibilities.

### DataService (`js/common.js`)
**Responsibility**: Centralized data persistence and LocalStorage management

**Key Methods**:
- `load()`: Load application state from LocalStorage
- `save(data)`: Save application state to LocalStorage
- `exportJSON()`: Generate JSON backup file
- `importJSON(file)`: Restore state from JSON file
- `reset()`: Clear all data

**Critical Rule**: All LocalStorage access MUST go through DataService. Direct `localStorage` access is prohibited.

---

### NotificationService (`js/common.js`)
**Responsibility**: Due date notifications and cross-page task navigation

**Key Methods**:
- `check()`: Scan for overdue and due-today tasks
- `render()`: Display notification center UI
- `jumpToTask(taskId)`: Navigate to specific task with flash animation

**Features**:
- Supports URL parameter `?jumpTaskId=xxx` for cross-page navigation
- "Jump & Flash" animation for visual feedback

---

### Common (`js/common.js`)
**Responsibility**: Shared utilities, i18n, theme management

**Key Components**:
- `I18N`: Translation dictionary (Japanese/English)
- `setT(elementId, key)`: Set element text content from i18n key
- `setAttr(elementId, attr, key)`: Set element attribute from i18n key
- `parseDate(dateString)`: Consistent ISO date parsing
- `toggleTheme()`: Switch between light/dark mode
- `toggleLanguage()`: Switch between Japanese/English

**Critical Rule**: All UI text MUST be defined in `Common.I18N` and applied via `setT()` or `setAttr()`. No hardcoded strings.

---

### BoardData (`js/app.js`)
**Responsibility**: Board data initialization and integrity checks

**Key Methods**:
- `init()`: Initialize board with saved data or default template
- `save()`: Persist current state via DataService
- `ensureIntegrity()`: Verify all tasks exist in a column (prevent orphaned tasks)
- `deleteTask(taskId, columnId)`: Remove task from board
- `archiveTask(taskId)`: Soft-delete task (archived flag)
- `restoreTask(taskId)`: Restore archived task

---

### Modal (`js/app.js`)
**Responsibility**: Task editing modal UI and interactions

**Key Methods**:
- `init()`: Set up event listeners
- `open(taskId)`: Open modal for editing task
- `close()`: Close modal
- `save()`: Save changes to task
- `renderLabels()`: Render label selection UI
- `renderBlockers(currentTaskId)`: Render blocker selection dropdown

**Features**:
- Handles all task properties: title, description, priority, labels, parent, blockers, due date
- Validates parent assignment (prevents circular dependencies)
- Manages blocker list UI

---

### LabelManager (`js/app.js`)
**Responsibility**: Label CRUD operations

**Key Methods**:
- `create()`: Create new label
- `delete(id)`: Delete label and remove from all tasks

---

### UI (`js/app.js`)
**Responsibility**: Task card rendering and visual effects

**Key Methods**:
- `createTaskCard(task, columnId, visibleTasksContext)`: Generate task card HTML
- `createVirtualParent(parentTask)`: Generate virtual parent card for child's column
- `createVirtualChild(childTask)`: Generate virtual child indicator for parent card
- `drawConnectors(taskId)`: Draw Bézier curves connecting task to its blockers
- `clearConnectors()`: Remove all connector SVG elements
- `formatTime(iso)`: Format ISO date to local locale

**Features**:
- Compact rendering for Done column (reduced size, hidden metadata)
- Stale task detection (7+ days without update in To Do)
- Dynamic connector drawing with animated dash offsets

---

### Archive (`js/app.js`)
**Responsibility**: Archive modal and restoration logic

**Key Methods**:
- `open()`: Open archive modal
- `close()`: Close archive modal
- `render()`: Render list of archived tasks

---

### App (`js/app.js`)
**Responsibility**: Main application logic and orchestration

**Key Methods**:
- `init()`: Initialize application, set up event listeners, render board
- `render()`: Render all columns and task cards (incremental updates via RenderCache)
- `handleAddTask(e)`: Create new task from input
- `initDragAndDrop()`: Configure SortableJS for drag-and-drop
- `translateUI()`: Apply i18n translations to all UI elements
- `jumpToTask(id)`: Navigate to task with flash animation

**Features**:
- Incremental DOM updates for performance (RenderCache)
- Keyboard shortcuts (Alt/Option + M/B/L/A)
- Real-time search and filtering
- Blocker completion guard (warns when moving blocked task to Done)

---

## Development Workflow

### Branch Strategy
1. **Always start from `main`**: `git checkout main && git pull origin main`
2. **Create feature branch**: `git checkout -b feature/[descriptive-name]`
   - Examples: `feature/export-pdf`, `feature/recurring-tasks`, `feature/add-documentation`
3. **Never commit directly to `main`**

### Commit Messages
Follow **Conventional Commits** format:
```
<type>(<scope>): <description>

[optional body]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `style`: Code style changes (formatting, etc.)
- `chore`: Maintenance tasks

**Examples**:
```
feat(metrics): add velocity forecasting chart
fix(drag-drop): resolve touch event handling on iOS
test: add missing tests for blocker functionality
docs: update AGENTS.md with new architecture details
```

### Pull Request Process
1. **Commit changes**: Use conventional commit messages
2. **Push branch**: `git push origin feature/[branch-name]`
3. **Create PR**: Use GitHub UI or `gh pr create`
4. **PR Title**: Same as commit message (for single-commit PRs) or descriptive summary
5. **PR Body**: Use the template below

#### PR Template
```markdown
## 変更点
- [変更内容を箇条書きで記載]

## テスト済み
- ✅ ユニットテスト: すべてパス
- ✅ E2Eテスト: すべてパス
- ✅ 手動検証: [検証内容]

## 破壊的変更
- [ある場合は記載、なければこのセクションを削除]
```

---

## Code Organization

### Directory Structure
```
/monoflow
  ├── index.html        # Main Kanban Board
  ├── metrics.html      # Performance & Throughput Analytics
  ├── burndown.html     # Progress Tracking & Scope Analysis
  ├── help.html         # Comprehensive Operating Manual
  ├── about.html        # Branding & Methodology
  ├── css/
  │   └── style.css     # Unified styling, animations, Dark Mode
  ├── js/
  │   ├── common.js     # Core Library: I18N, DataService, NotificationService
  │   ├── app.js        # Kanban board core logic & Modal management
  │   ├── metrics.js    # Metrics logic (Throughput, Cycle Time, Forecasting)
  │   ├── burndown.js   # Burndown logic with Scope change tracking
  │   ├── help.js       # Localization logic for User Guide
  │   └── about.js      # Localization logic for About page
  ├── img/              # SVG assets (localized screenshots)
  ├── tests/
  │   ├── unit/         # Vitest unit tests
  │   └── e2e/          # Playwright E2E tests
  └── docs/             # Legacy documentation
```

### File Naming Conventions
- **JavaScript**: Lowercase with hyphens (`data-service.js`, `task-card.js`)
- **HTML**: Lowercase with hyphens (`index.html`, `help.html`)
- **CSS**: Lowercase with hyphens (`style.css`)
- **Tests**: `*.test.js` (unit), `*.spec.js` (E2E)

---

## Coding Conventions

### Variable Naming
- **camelCase**: Variables and functions (`taskId`, `columnData`, `handleAddTask`)
- **UPPER_SNAKE_CASE**: Constants (`STORAGE_KEY`, `LANG_KEY`, `CONSTANTS`)
- **PascalCase**: Object constructors/namespaces (`DataService`, `Modal`, `App`)

### i18n Requirements
- **All UI text** must be defined in `Common.I18N` (both `ja` and `en`)
- Use `Common.setT(elementId, key)` for text content
- Use `Common.setAttr(elementId, attr, key)` for attributes (title, placeholder)
- Maintain standard element IDs for consistent translation

### Data Access
- **NEVER** access `localStorage` directly
- **ALWAYS** use `DataService.load()` and `DataService.save()`
- **ALWAYS** use `Common.parseDate()` for date parsing (browser compatibility)

### DOM Selection
- **Prefer ID-based selection**: `document.getElementById('task-modal')`
- **Avoid index-based selection**: `document.querySelectorAll('.task-card')[0]` (brittle)
- **Use data attributes for dynamic elements**: `data-column-id`, `data-task-id`

---

## Testing Requirements

### Before Every Commit
```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

**All tests must pass before pushing.**

### Test File Organization
- **Unit tests**: `tests/unit/[module-name].test.js`
- **E2E tests**: `tests/e2e/[feature-name].spec.js`

### Common Test Patterns
```javascript
// Unit test pattern (Vitest)
import { describe, it, expect, beforeEach } from 'vitest';
import { DataService } from '../../js/common.js';

describe('DataService', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should save data to localStorage', () => {
        const testData = { tasks: {} };
        DataService.save(testData);
        expect(localStorage.getItem('monoflow-v10-refactored')).toBeTruthy();
    });
});

// E2E test pattern (Playwright)
const { test, expect } = require('@playwright/test');

test.describe('Feature Name', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('should perform action', async ({ page }) => {
        // Test implementation
    });
});
```

---

## Quick Reference

### Common Commands
```bash
# Testing
npm test              # Run unit tests
npm run test:e2e      # Run E2E tests
npm run test:e2e:ui   # Run E2E tests with UI

# Development
# (No build step - open index.html directly in browser)
```

### Key Files to Review
- `README.md` - User-facing documentation
- `SPEC.md` - Technical specifications
- `TESTS.md` - Test documentation
- `GEMINI.md` - AI assistant context
- `js/common.js` - Core shared logic
- `js/app.js` - Main application logic

### Default Values
- **LocalStorage Key**: `monoflow-v10-refactored`
- **Language Key**: `monoflow-lang` (default: `ja`)
- **Theme Key**: `monoflow-theme` (default: `light`)
- **Stale Task Threshold**: 7 days
- **Column IDs**: `c1` (To Do), `c2` (In Progress), `c3` (Done)

---

## Best Practices

### DO ✅
- Run tests before committing
- Use `DataService` for all data access
- Use `Common.I18N` for all UI text
- Follow conventional commit format
- Update documentation when adding features
- Add tests for new features
- Use ID-based DOM selection
- Maintain 2-level hierarchy limit (Parent → Child only)

### DON'T ❌
- Commit directly to `main`
- Skip running tests
- Access `localStorage` directly
- Hardcode UI text strings
- Use index-based DOM selection
- Break existing tests
- Add dependencies without justification
- Create deeper than 2-level task hierarchy

---

## Prohibited Practices

### 🚫 Direct LocalStorage Access
```javascript
// ❌ WRONG
localStorage.setItem('monoflow-v10-refactored', JSON.stringify(data));

// ✅ CORRECT
DataService.save(data);
```

### 🚫 Hardcoded UI Text
```javascript
// ❌ WRONG
element.textContent = 'Add Task';

// ✅ CORRECT
Common.setT('add-task-btn', 'btn_add_task');
```

### 🚫 Index-Based Selection
```javascript
// ❌ WRONG
const firstCard = document.querySelectorAll('.task-card')[0];

// ✅ CORRECT
const card = document.querySelector(`[data-task-id="${taskId}"]`);
```

### 🚫 Direct Main Branch Commits
```bash
# ❌ WRONG
git checkout main
git commit -m "fix: bug fix"

# ✅ CORRECT
git checkout -b feature/fix-bug
git commit -m "fix: bug fix"
git push origin feature/fix-bug
# Then create PR
```

---

## Known Issues & Solutions

### 1. SortableJS Touch Events on iOS
**Issue**: Drag-and-drop may not work reliably on iOS Safari without `forceFallback`.

**Solution**: Always use `forceFallback: true` and `fallbackOnBody: true` in SortableJS config.

```javascript
Sortable.create(element, {
    forceFallback: true,
    fallbackOnBody: true,
    // ... other options
});
```

### 2. LocalStorage Quota Exceeded
**Issue**: Browser may throw `QuotaExceededError` with large datasets.

**Solution**: Implement data cleanup or warn users. Current implementation assumes reasonable task count (<10,000).

### 3. Keyboard Shortcuts Conflict
**Issue**: Browser shortcuts may conflict with app shortcuts (e.g., Alt+M).

**Solution**: Use `e.code` instead of `e.key` for physical key detection. Document shortcuts in help.html.

---

## Documentation Standards

### When to Update Documentation
- Adding new features → Update `README.md`, `SPEC.md`, `TESTS.md`
- Changing architecture → Update `AGENTS.md`, `GEMINI.md`
- Adding tests → Update `TESTS.md`
- Fixing bugs → Update relevant docs if behavior changes

### Documentation Style
- Use clear, concise language
- Include code examples where helpful
- Keep README user-facing, SPEC/AGENTS technical
- Use Markdown formatting (headers, lists, code blocks)
- Include Japanese translations for user-facing docs

---

## Getting Help

### Documentation Hierarchy
1. **AGENTS.md** (this file) - Development guidelines
2. **SPEC.md** - Technical specifications
3. **TESTS.md** - Test documentation
4. **GEMINI.md** - AI assistant context
5. **README.md** - User documentation

### When Stuck
1. Check existing code patterns in `js/app.js` and `js/common.js`
2. Review test files for usage examples
3. Consult SPEC.md for data model details
4. Run tests to verify assumptions
5. Check browser console for errors

---

**MonoFlow** - Built for High-Performance Personal Productivity.
