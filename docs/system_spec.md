# System Specification - MonoFlow

## 1. Overview
MonoFlow is a browser-based, personal Kanban productivity tool designed for high performance and privacy. It features advanced task hierarchy, dependency tracking, and built-in analytics, all while storing data 100% locally in the user's browser.

## 2. Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS (Utility-first)
- **Icons**: Lucide Icons
- **Data Storage**: Browser LocalStorage
- **Charts**: Chart.js (via CDN)
- **Drag & Drop**: SortableJS (via CDN)

## 3. Data Model
The application state is stored in a single JSON object in LocalStorage key `monoflow-v10-refactored`.

### 3.1 Tasks
Each task object contains:
- `id`: Unique string (e.g., `task-1700000000000`)
- `content`: Title string
- `description`: Detailed notes
- `priority`: Enum (`'high'`, `'medium'`, `'low'`, `'none'`)
- `status`: Derived from column location (`'todo'`, `'progress'`, `'done'`)
- `dueDate`: ISO Date string (YYYY-MM-DD)
- `parentId`: ID of parent task (or null)
- `blockers`: Array of Task IDs that block this task
- `labels`: Array of Label IDs
- `createdAt`: ISO Timestamp
- `updatedAt`: ISO Timestamp
- `completedDate`: ISO Timestamp (set when moved to Done)
- `archived`: Boolean

### 3.2 Columns
Fixed columns structure:
1. **To Do** (`c1`)
2. **In Progress** (`c2`)
3. **Done** (`c3`)

### 3.3 Application Settings
- **Language**: English (`en`) / Japanese (`ja` - default)
- **Theme**: Light (`light`) / Dark (`dark`)

## 4. Functional Requirements

### 4.1 Board Management
- **Drag & Drop**: Tasks can be moved between columns.
- **Auto-save**: All changes are instantly saved to LocalStorage.
- **Stale Detection**: Tasks in "To Do" unmodified for 7+ days show a "Wind" icon.

### 4.2 Task Management
- **CRUD**: Create, Read, Update, Delete tasks.
- **Archive**: Soft-delete tasks. Archived tasks are excluded from the board but available for analytics and restoration.
- **Search & Filter**: Real-time filtering by text (title/notes), Label, and Priority.

### 4.3 Advanced Hierarchy (Parent-Child)
- **Nesting**: 2-level depth (Parent -> Child).
- **Virtual Ghost Cards**:
    - **Virtual Parent**: Shown in child's column if parent is elsewhere.
    - **Virtual Child UI**: Parent card displays a mini-list of children located in other columns.
- **Navigation**: Clicking virtual cards jumps to the actual card.
- **Progress**: Parent card shows a progress bar based on children completion.

### 4.4 Dependency Tracking (Blockers)
- **Blocker Assignment**: Tasks can define other tasks as dependencies.
- **Visual Flow**: Hovering over a dependency indicator draws Bézier curves on screen connecting the blocker to the blocked task.
- **Completion Guard**: Warning prompt when moving a task to Done if its blockers are incomplete.

### 4.5 Analytics (Metrics)
- **Dashboard**: Dedicated view for statistical insights.
- **Key Metrics**:
    - Total Tasks / Completion Rate
    - Average Lead Time (Creation to Done)
    - Average Cycle Time (In Progress to Done)
    - Estimated Completion Date
- **Charts**:
    - Status Distribution (Donut)
    - Priority Distribution (Bar)
    - Throughput History (Line)

### 4.6 Burndown Chart
- Displays "Ideal" vs "Actual" remaining work over time.
- Helps track project velocity and scope creep.

### 4.7 Data Management
- **Export**: Download full state as `monoflow-backup-YYYY-MM-DD.json`.
- **Import**: Restore state from JSON file (Merge/Overwrite logic).
- **Reset**: Clear all data.

## 5. Non-Functional Requirements
- **Privacy**: No data transmission to external servers.
- **Performance**: Optimized for thousands of tasks. Virtual DOM not used, but efficient DOM manipulation ensures 60fps interaction.
- **Responsiveness**: Fully responsive design (Mobile/Tablet/Desktop).
