# MonoFlow

**MonoFlow** is a professional, minimalist, and entirely private Kanban tool that lives in your browser. Designed for high-performance productivity and deep work, it requires no servers, no sign-ups, and guarantees that your data never leaves your device.

## ✨ Core Features

- **Zero Configuration:** No installation or build steps. Open `index.html` and you're ready to go.
- **Total Privacy:** 100% of your data is stored locally via the browser's `Web Storage API`.
- **Advanced Task Engine:**
  - **2-Level Hierarchy:** Manage projects with subtasks, visual progress bars, and strict parent-child logic.
  - **Context Ghosts (Virtual Tickets):** Maintain project context across lanes with placeholders and immediate "Jump & Flash" navigation.
  - **Precise Metadata:** Automatic tracking of creation, update, and completion timestamps.
- **Intelligent Analytics:**
  - **Notification Center:** Real-time bell alerts for overdue and due-today tasks with one-click navigation.
  - **Metrics Dashboard:** Analyze throughput trends, average lead times, and precise cycle times (down to the hour).
  - **Pro Burndown Chart:** Dual-axis visualization showing remaining work alongside daily scope changes (additions vs. completions).
  - **Velocity Forecasting:** Predictive completion dates based on your recent 14-day performance.
- **Modern Workflow:**
  - **Full-text Quick Search:** Instant filtering across titles and detailed notes.
  - **Global Shortcuts:** Move at the speed of thought with physical key-based navigation (e.g., `Alt/Option + M`).
  - **Responsive & Touch-Ready:** Optimized for mobile and tablets (iPad/iPhone) with specialized drag-and-drop logic.
  - **Multilingual & Themed:** Seamless switching between Japanese and English, with a focus-optimized Dark Mode.
- **Data Portability:** Export and import comprehensive JSON backups that include your tasks, labels, and UI preferences.

## 🚀 Getting Started

1.  Download or clone the repository.
2.  Open `index.html` in any modern web browser.
3.  Check out the built-in **User Guide** (click the `?` icon) for a deep dive into the professional methodology behind MonoFlow.

## 🛠️ Tech Stack

- **Core:** HTML5, Vanilla JavaScript (ES6+), CSS3
- **Styling:** Tailwind CSS (via Play CDN)
- **Visualization:** Chart.js v4
- **Interactivity:** SortableJS (Drag & Drop), Lucide Icons
- **Data:** Local Storage
