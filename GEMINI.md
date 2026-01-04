# Monoflow Project Context

## Overview
**Monoflow** is a lightweight, professional, browser-based personal Kanban board application.
It is designed to be fully self-contained in a single HTML file (`index.html`) without requiring a build process or a backend server.

## Architecture
- **Structure:** `index.html` (Main entry point).
- **Logic:** `app.js` (Core application logic, modularized).
- **Styling:** 
    - Tailwind CSS (via Play CDN).
    - `style.css` (Custom styles for Kanban specific UI).
- **Icons:** Lucide Icons (via CDN).
- **Drag & Drop:** SortableJS (via CDN).
- **Data Persistence:** `localStorage` is used to persist tasks, columns, and custom labels.
- **No Build Step:** The project runs directly by opening `index.html` in a browser.

## Key Features
- **Nested Kanban Board:** Support for parent-child relationships (1-level deep).
- **Drag & Drop Subtasks:** Drag a task into another task to create a subtask.
- **Task Management:** Create, edit, and delete tasks.
- **Task Details:** Modal for editing title, description, due date, priority, and labels.
- **Visual Status:**
    - **Done State:** Tasks in the "Done" column are grayed out with a strike-through.
    - **Completed Time:** Records and displays the exact date and time a task was moved to Done.
- **Priorities:** High, Medium, and Low priorities with visual indicators.
- **Custom Labels:** Create, delete, and filter tasks by color-coded labels.
- **Data Portability:** Export and import the entire board data as JSON.

## Data Schema (LocalStorage)
- `tasks`: Object map of task objects.
- `columns`: Object map of column objects containing `taskIds` (flat array of all IDs in order).
- `columnOrder`: Array of column IDs.
- `labels`: Array of custom label definitions.

## Development Guidelines
1.  **Portability First:** Maintain the single-file structure. Avoid external local assets.
2.  **CDN Reliance:** Continue using CDNs for libraries.
3.  **DOM-to-Data Sync:** When updating task order or nesting, ensure the DOM structure is reliably mapped back to the `localStorage` state.
4.  **Safety:** Keep the orphan-recovery logic in `renderBoard` to prevent data loss during schema/logic changes.