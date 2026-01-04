# Monoflow Project Context

## Overview
**Monoflow** is a lightweight, browser-based personal Kanban board application.
It is designed to be fully self-contained in a single HTML file (`index.html`) without requiring a build process or a backend server.

## Architecture
- **Single File Component:** All logic (HTML, CSS, JS) resides in `index.html`.
- **Styling:** Tailwind CSS (via CDN).
- **Icons:** Lucide React (via CDN, though used as vanilla JS).
- **Drag & Drop:** SortableJS (via CDN).
- **Data Persistence:** `localStorage` is used to persist tasks and columns.
- **No Build Step:** The project runs directly in the browser.

## Key Features
- **Kanban Board:** Drag-and-drop tasks between columns (ToDo, In Progress, Done).
- **Task Management:** Create, edit, and delete tasks.
- **Task Details:** Modal for editing title, description, and due date.
- **Modern UI:** Clean aesthetic using Inter font and Tailwind CSS.

## Development Guidelines
1.  **Keep it Simple:** Avoid introducing build tools (Webpack, Vite) unless explicitly requested. The goal is "zero-config" usage.
2.  **CDN Usage:** Use CDN links for libraries to maintain the single-file portability.
3.  **Data Structure:**
    - `tasks`: Object map of task details.
    - `columns`: Object map of column details (including `taskIds` array).
    - `columnOrder`: Array defining the visual order of columns.

## Future Roadmap (Potential)
- Dark mode toggle.
- Export/Import JSON data.
- customizable columns.
