# SPEC.md - MonoFlow System Specification

This document provides detailed technical specifications for MonoFlow, including data models, functional requirements, and non-functional requirements.

---

## 1. Project Overview

### 1.1 Purpose
**MonoFlow** is a privacy-first, browser-based personal Kanban application. By storing all data within the user's browser rather than relying on cloud services, it achieves 100% data privacy.

### 1.2 Key Features
- **100% Local Data**: All information is stored in the browser's `localStorage`, with no external server transmission
- **Offline Operation**: Fully functional without internet connection
- **Zero Configuration**: No installation required, just open `index.html` to start
- **Advanced Task Management**: 2-level hierarchy, dependency tracking, stale task detection
- **Analytics**: Metrics dashboard and burndown charts
- **Multi-language Support**: Full localization for Japanese and English
- **Dark Mode**: High-contrast dark theme to reduce eye strain
- **Touch-Optimized**: Seamless drag-and-drop on iPad, iPhone, and Android devices

### 1.3 Design Philosophy
- **Privacy First**: User data remains 100% under user control
- **Simplicity**: No complex configuration or setup required
- **Portability**: Consists only of static files, easily movable to USB drives or private servers
- **Performance**: Smooth 60fps operation even with thousands of tasks

---

## 2. Technology Stack

### 2.1 Frontend
- **Language**: Vanilla JavaScript (ES6+)
  - Modular architecture
  - Clear separation of responsibilities with `DataService` and `Modal`
- **Styling**: Tailwind CSS
  - Utility-first design
  - Responsive design support
  - Custom dark mode theme

### 2.2 Data Storage
- **LocalStorage**: Browser LocalStorage API
  - Key: `monoflow-v10-refactored`
  - Data format: JSON
  - Capacity limit: Browser-dependent (typically 5-10MB)

### 2.3 Libraries (via CDN)
- **Chart.js v4**: Data visualization
  - Donut charts (status distribution)
  - Bar charts (priority distribution)
  - Line charts (throughput history, burndown)
- **SortableJS**: Drag and drop
  - Touch device support
  - iOS compatibility ensured with `forceFallback: true`
- **Lucide Icons**: Icon library
  - SVG-based lightweight icons
  - Consistent visual design

### 2.4 Testing Tools
- **Vitest v1.0.0**: Unit testing
- **Playwright v1.40.0**: E2E testing
- **jsdom v23.0.0**: DOM environment simulation
- **http-server v14.1.1**: Local test server

---

## 3. Data Model

### 3.1 Application State
Application state is stored as a single JSON object in LocalStorage key `monoflow-v10-refactored`.

```javascript
{
  "tasks": { /* Map of task objects */ },
  "columns": { /* Map of column objects */ },
  "columnOrder": ["c1", "c2", "c3"],
  "labels": [ /* Array of label definitions */ ]
}
```

### 3.2 Task Object
Each task has the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | String | Unique identifier (e.g., `task-1700000000000`) |
| `content` | String | Task title |
| `description` | String | Detailed notes |
| `priority` | Enum | Priority: `'high'`, `'medium'`, `'low'`, `'none'` |
| `status` | String | Derived from column position: `'todo'`, `'progress'`, `'done'` |
| `dueDate` | String | Due date (ISO format: YYYY-MM-DD) |
| `parentId` | String \| null | Parent task ID (parent-child relationship) |
| `blockers` | Array\<String\> | Array of task IDs that block this task |
| `labels` | Array\<String\> | Array of label IDs |
| `createdAt` | String | Creation timestamp (ISO 8601) |
| `updatedAt` | String | Last update timestamp (ISO 8601) |
| `completedDate` | String \| null | Completion timestamp (set when moved to "Done") |
| `archived` | Boolean | Archive flag (soft delete) |

**Example**:
```javascript
{
  "id": "task-1705123456789",
  "content": "Implement new feature",
  "description": "Add user authentication functionality",
  "priority": "high",
  "dueDate": "2026-01-25",
  "parentId": null,
  "blockers": ["task-1705123456700"],
  "labels": ["label-1"],
  "createdAt": "2026-01-19T02:00:00.000Z",
  "updatedAt": "2026-01-19T02:30:00.000Z",
  "completedDate": null,
  "archived": false
}
```

### 3.3 Column Structure
Fixed 3-column configuration:

| Column ID | Title | Description |
|-----------|-------|-------------|
| `c1` | To Do | Unstarted tasks |
| `c2` | In Progress | Tasks in progress |
| `c3` | Done | Completed tasks |

Each column object:
```javascript
{
  "id": "c1",
  "title": "To Do",
  "taskIds": ["task-1", "task-2", "task-3"]
}
```

### 3.4 Labels
Labels are used for task categorization.

```javascript
{
  "id": "label-1",
  "name": "Bug Fix",
  "color": "#ef4444"  // Tailwind red-500
}
```

### 3.5 Settings
Application settings are stored in separate LocalStorage keys:

| Key | Default Value | Description |
|-----|---------------|-------------|
| `monoflow-lang` | `ja` | UI language (`ja` or `en`) |
| `monoflow-theme` | `light` | Theme (`light` or `dark`) |

---

## 4. Functional Requirements

### 4.1 Board Management

#### 4.1.1 Drag & Drop
- Tasks can be freely moved between columns
- Smooth animations using SortableJS
- Touch device support (iPad, iPhone, Android)
- Auto-save on move

#### 4.1.2 Auto-save
- All changes are immediately saved to LocalStorage
- No manual save operation required
- Data integrity check (`BoardData.ensureIntegrity()`)

#### 4.1.3 Stale Task Detection
- Tasks in "To Do" column not updated for 7+ days display "wind" icon
- Notifies users of abandoned tasks

### 4.2 Task Management

#### 4.2.1 CRUD Operations
- **Create**: Enter title in input field and press Enter to create
- **Read**: Click task card to display details in modal
- **Update**: Edit title, description, priority, labels, due date in modal
- **Delete**: Delete task with delete button in modal

#### 4.2.2 Archive
- Soft-delete tasks (set archive flag)
- Archived tasks hidden from board
- Restorable from archive modal
- Analytics include archived tasks in calculations

#### 4.2.3 Search and Filtering
- **Real-time text search**: Targets title and description notes
- **Label filter**: Display only tasks with specific label
- **Priority filter**: Display only tasks with specific priority
- Filters can be combined

### 4.3 Advanced Hierarchy (Parent-Child Relationships)

#### 4.3.1 Nesting Restrictions
- **2-level depth**: Parent → Child only (no grandchild tasks)
- Tasks with children cannot become children of other tasks

#### 4.3.2 Virtual Cards
- **Virtual parent card**: When child task's column differs from parent, displays parent overview
- **Virtual child UI**: Parent task card displays mini-list of children in other columns
- **Navigation**: Clicking virtual card jumps to actual card with flash animation

#### 4.3.3 Progress Display
- Parent task card displays progress bar showing child task completion rate
- Calculated as: completed child tasks / total child tasks

### 4.4 Dependency Tracking (Blockers)

#### 4.4.1 Blocker Assignment
- Tasks can define other tasks as dependencies (blockers)
- Multiple blockers can be set

#### 4.4.2 Visual Flow
- Hovering over blocker indicator draws Bézier curves connecting blocker and task
- Visually displays dependencies with animated dashed lines

#### 4.4.3 Completion Guard
- Warning dialog appears when attempting to move task to "Done" with incomplete blockers
- User can override warning and force completion

### 4.5 Analytics (Metrics)

#### 4.5.1 Dashboard
Dedicated view (`metrics.html`) provides statistical insights

#### 4.5.2 Key Metrics
- **Total Tasks**: Total task count including archived
- **Completion Rate**: Completed tasks / total tasks
- **Average Lead Time**: Average time from creation to completion (days)
- **Average Cycle Time**: Average time from "In Progress" to "Done" (days)
- **Estimated Completion Date**: Prediction based on current velocity

#### 4.5.3 Charts
- **Status Distribution**: Donut chart (To Do / In Progress / Done)
- **Priority Distribution**: Bar chart (High / Medium / Low / None)
- **Throughput History**: Line chart (daily completed task count)

### 4.6 Burndown Chart

#### 4.6.1 Display Content
- **Ideal line**: Remaining task count if completed at even pace
- **Actual line**: Actual remaining task count trend
- **Scope changes**: Daily added and completed task counts

#### 4.6.2 Purpose
- Track project velocity
- Visualize scope creep (unplanned task additions)
- Improve completion date accuracy

### 4.7 Data Management

#### 4.7.1 Export
- Download entire state as `monoflow-backup-YYYY-MM-DD.json`
- Includes all tasks, columns, and labels

#### 4.7.2 Import
- Restore state from JSON file
- Confirmation dialog warns of current data overwrite
- Error handling for invalid JSON files

#### 4.7.3 Reset
- Clear all data
- Confirmation dialog prevents accidental operations

---

## 5. Non-Functional Requirements

### 5.1 Privacy
- **No data transmission**: No data sent to external servers
- **LocalStorage only**: All data stored within user's browser
- **No tracking**: No telemetry, cookies, or analytics scripts used

### 5.2 Performance
- **60fps operation**: Smooth interaction even with thousands of tasks
- **Incremental rendering**: Efficient DOM updates via `RenderCache`
- **Optimized DOM manipulation**: Efficient manual DOM operations without virtual DOM

### 5.3 Responsive Design
- **Mobile support**: Optimized for smartphones, tablets, and desktops
- **Touch operations**: SortableJS `forceFallback` ensures touch device reliability
- **Breakpoints**: Flexible layouts with Tailwind CSS utility classes

### 5.4 Browser Compatibility
- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **ES6+ support**: Uses modern JavaScript features
- **LocalStorage required**: Won't work in browsers without LocalStorage support

### 5.5 Accessibility
- **Keyboard navigation**: Alt/Option + M/B/L/A for page navigation
- **Semantic HTML**: Uses appropriate HTML5 elements
- **Contrast**: High contrast ensured in dark mode

---

## 6. UI/UX Specifications

### 6.1 Keyboard Shortcuts
| Shortcut | Function |
|----------|----------|
| `Alt/Option + M` | Navigate to Metrics page |
| `Alt/Option + B` | Navigate to Burndown page |
| `Alt/Option + L` | Navigate to Board (index.html) |
| `Alt/Option + A` | Navigate to About page |
| `?` | Open Help page |
| `N` | Focus on new task input |
| `S` | Focus on search input |

### 6.2 Dark Mode
- **Toggle**: Click moon icon in header
- **Persistence**: Saved to LocalStorage with `monoflow-theme` key
- **Styling**: Defined with Tailwind CSS `dark:` prefix

### 6.3 Multi-language Support
- **Supported languages**: Japanese (ja), English (en)
- **Toggle**: Click language button in header
- **Persistence**: Saved to LocalStorage with `monoflow-lang` key
- **Translation management**: Centrally managed in `Common.I18N` object

### 6.4 Notification Center
- **Due date notifications**: Displays overdue and due-today tasks
- **Cross-page navigation**: Jump to tasks via URL parameter `?jumpTaskId=xxx`
- **Flash animation**: Temporarily highlights jumped-to task card

### 6.5 Compact Done Lane
- **Reduced display**: Completed tasks shown smaller
- **Hidden elements**: Description, progress bar, metadata hidden
- **Purpose**: Enable focus on active work

---

## 7. Data Flow

### 7.1 Application Startup
1. `App.init()` executes
2. `BoardData.init()` loads data from LocalStorage
3. If no data exists, creates default template (sample tasks)
4. `App.render()` renders board
5. `App.initDragAndDrop()` initializes SortableJS

### 7.2 Task Creation
1. User enters title in input field and presses Enter
2. `App.handleAddTask()` executes
3. Creates new task object (generates unique ID)
4. Adds to `State.data.tasks`
5. Adds to `State.data.columns['c1'].taskIds` (To Do column)
6. `BoardData.save()` saves to LocalStorage
7. `App.render()` updates UI

### 7.3 Task Editing
1. User clicks task card
2. `Modal.open(taskId)` executes
3. Displays current task data in modal
4. User edits fields
5. Clicks save button
6. `Modal.save()` executes
7. Updates `State.data.tasks[taskId]`
8. `BoardData.save()` saves to LocalStorage
9. `App.render()` updates UI

### 7.4 Drag & Drop
1. User drags task card
2. SortableJS `onEnd` event fires
3. Gets source and destination column IDs
4. Updates `State.data.columns` (modifies taskIds arrays)
5. If task moved to "Done", sets `completedDate`
6. Blocker check: displays warning dialog if incomplete blockers exist
7. `BoardData.save()` saves to LocalStorage
8. `App.render()` updates UI

---

## 8. Security and Privacy

### 8.1 Data Protection
- **LocalStorage only**: Data not transmitted externally
- **No encryption**: LocalStorage stored in plain text, physical device security important
- **Backup recommended**: Users should regularly create backups using export function

### 8.2 XSS Protection
- **Text escaping**: User input inserted via `textContent` (not interpreted as HTML)
- **innerHTML usage**: Limited (icons and markdown only, trusted sources only)

### 8.3 CSRF Protection
- **Not required**: No server-side processing, no CSRF risk

---

## 9. Limitations

### 9.1 Browser Dependencies
- **LocalStorage capacity**: Varies by browser (typically 5-10MB)
- **Data persistence**: Data may be lost if browser cache is cleared

### 9.2 No Sync Functionality
- **Single device**: No data sync across multiple devices
- **Manual sync**: Manual sync required via export/import functions

### 9.3 Hierarchy Restrictions
- **2 levels only**: Parent → Child only (no grandchild tasks)
- **Design intent**: Maintains simplicity by avoiding complexity

---

## 10. Future Extensibility

### 10.1 Features Under Consideration
- **Recurring tasks**: Automatic creation of periodic tasks
- **Custom columns**: User-defined column additions
- **File attachments**: File attachment to tasks (Base64 encoding)
- **Collaboration**: Sharing via WebRTC or P2P

### 10.2 Technical Improvements
- **IndexedDB migration**: Avoid LocalStorage capacity limitations
- **Service Worker**: Enhanced offline support
- **PWA conversion**: Distribute as installable application

---

**MonoFlow** - Simple Yet Powerful Personal Kanban
