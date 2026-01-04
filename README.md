# MonoFlow

**MonoFlow** is a professional, high-performance personal Kanban application designed for those who value **total privacy** and **zero-config portability**.

Unlike cloud-based tools, MonoFlow lives entirely in your browser. It requires no servers, no accounts, and no internet connection to operate. Every task, note, and metric stays on your machine, ensuring your data is 100% private and under your control.

## 🛡️ Privacy & Local-First Philosophy

- **100% Local Data:** All information is stored exclusively in your browser's `localStorage`. No data ever leaves your device.
- **Offline Operation:** Fully functional without an internet connection. Ideal for secure environments or focus-heavy offline sessions.
- **Zero Tracking:** No telemetry, no cookies, no analytics scripts. Pure productivity without the prying eyes.
- **Instant Portability:** The entire system is a collection of static files. Move it to a USB drive, a private server, or just keep it on your desktop.

## ✨ Core Features

- **Advanced Task Engine:**
  - **Smart 2-Level Hierarchy:** Powerful parent-child task management with automatic progress tracking and subtask previews.
  - **Dependency Management (Blockers):** Define tasks that must be completed first. Visualize dependencies with **dynamic flowing connectors** by hovering over the link icon.
  - **Stale Task Detection:** Automatically highlights tasks in the "To Do" lane that haven't been touched for over a week with a "Dust" icon.
  - **Context Ghosts:** Maintain project visibility across lanes with placeholders and "Jump & Flash" navigation.
  - **Notification Center:** Centralized alerts for overdue and due-today tasks.
- **Deep Analytics:**
  - **Metrics Dashboard:** High-precision tracking of Throughput, Lead Time, and Cycle Time (down to the hour).
  - **Burndown Dynamics:** Pro-grade progress visualization with ideal trend lines and scope change tracking.
  - **Velocity Forecasting:** Predictive algorithms that estimate completion dates based on your actual performance.
- **Professional Workflow:**
  - **Masterful Keyboard Navigation:** Navigate instantly with global shortcuts (e.g., `Alt/Option + M/B/L/A`) and `?` for help.
  - **Full-text Real-time Search:** Instant filtering across titles and detailed notes as you type.
  - **Compact Done Lane:** Completed tasks are automatically compacted to reduce visual clutter and keep focus on active work.
  - **Touch-Optimized:** Seamless drag-and-drop experience on iPad, iPhone, and Android devices.
- **Highly Customizable:**
  - **Unified Dark Mode:** A sleek, high-contrast dark theme designed to reduce eye strain.
  - **Bilingual Support:** Full, native localization for both Japanese and English.
  - **Comprehensive Backups:** Export/Import entire system states via JSON.

## 🚀 Getting Started

1.  **Download/Clone** this repository.
2.  **Open `index.html`** in any modern web browser.
3.  **Start Working.** No setup, no installation, just flow.

*For a detailed operating manual, click the **Help (?)** icon within the application.*

## 🛠️ Architecture & Tech Stack

MonoFlow is built with a focus on simplicity, speed, and standard web technologies:

- **Logic:** Vanilla JavaScript (ES6+) with a modular `DataService` and `Modal` architecture.
- **Styling:** Tailwind CSS (Modern, utility-first design).
- **Charts:** Chart.js v4 (High-performance data visualization).
- **Icons:** Lucide Icons (Clean, consistent vector iconography).
- **Drag & Drop:** SortableJS (Reliable, touch-compatible reordering).

---
**MonoFlow** - Built for High-Performance Personal Productivity.
