# ColdGuard — Temperature Monitoring Dashboard

A responsive, high-performance web dashboard for the **ColdGuard IoT Temperature Monitoring System**. 

Built with standard web technologies (HTML5, Vanilla CSS, clean ES6 Javascript Modules) and **Chart.js**, this dashboard features a modern glassmorphism design, interactive widgets, robust error-recovery, and full internationalization (EN/DE/AR) including custom right-to-left (RTL) rendering.

---

## 🌟 Key Features

1. **Modern Glassmorphism UI:** Deep color palette, subtle gradients, rich animations, and interactive hover effects.
2. **Current Status Card:** A real-time temperature viewer displaying the current reading, device name, relative last updated time, and an animated pulsing alert badge for active warnings.
3. **Threshold Gauge Card:** A premium custom SVG circular gauge visualizing the safety limits (1.0°C – 8.0°C) and mapping the pointer position dynamically.
4. **Interactive Temperature History:** Fully responsive Chart.js line graph featuring custom-themed grid lines, threshold limit lines, gradient fills under curves, and localized hover state details.
5. **Trilingual System (i18n):** Dynamically switches between English (EN), German (DE), and Arabic (AR) with persistent language storage (`localStorage`).
6. **Native RTL Layouts:** Setting the language to Arabic triggers a flip to native Right-to-Left formatting using CSS logical properties and flexible grid templates.
7. **Auto-refresh System:** Automatic network sync running every 60 seconds with an animated counting progress display in the header.
8. **Fault Tolerance & Warnings:**
   - **Connection Error Screen:** A full-screen fallback banner with a Retry callback if the Django API is unreachable.
   - **Stale Data Banner:** Automatic warning if the most recent reading is more than 5 minutes old.
   - **Empty States:** Clean placeholders if there is no current reading or if the alarm log is empty.

---

## 🛠️ Technology Stack

- **Core Structure:** HTML5
- **Styling & Theme:** Pure CSS3 (CSS Variables, Flexbox, CSS Grid, Media Queries, CSS Transitions)
- **Application Logic:** Vanilla JS (ES6 Modules, Fetch API, IIFE namespaces)
- **Data Visualization:** [Chart.js (v4+)](https://www.chartjs.org/)
- **Chart Extensions:**
  - [chartjs-adapter-date-fns](https://github.com/chartjs/chartjs-adapter-date-fns) (supports time scales)
  - [chartjs-plugin-annotation](https://github.com/chartjs/chartjs-plugin-annotation) (renders horizontal threshold guidelines)

---

## 📂 Project Directory Structure

```
Coldguard-Frontend/
├── index.html            # Main dashboard container & CDNs
├── css/
│   └── style.css         # Typography, glassmorphism, responsive grids, & RTL styles
└── js/
    ├── config.js         # API endpoints, temperature thresholds, sensor limits, and timers
    ├── i18n.js           # Dictionary translations (EN/DE/AR) + dir state toggle logic
    ├── utils.js          # Localized datetime formats, duration counters, value counters, & debouncers
    ├── api.js            # Network client handling current readings, history plots, and alarm logs
    ├── chart.js          # Chart.js time scale adapter initialization & limits drawing
    └── dashboard.js      # Main controller coordinating UI loops, status animations, and timers
```

---

## 🚀 Quick Start Guide

To run the ColdGuard Dashboard locally, you can serve the static files using any standard HTTP server.

### Option A: Serve with Python (Easiest)
Make sure you are in the `Coldguard-Frontend` directory and run:
```bash
python3 -m http.server 5500
```
Then open [http://localhost:5500](http://localhost:5500) in your browser.

### Option B: Run via VS Code Live Server
1. Open the `Coldguard-Frontend` folder in VS Code.
2. Click **Go Live** in the bottom right corner (requires the *Live Server* extension).
3. The dashboard will launch automatically at `http://127.0.0.1:5500`.

---

## 📡 Connecting to the Django Backend API

By default, the frontend is configured to fetch data from `http://localhost:8000`. You can change this base URL inside `js/config.js` to match your production backend server address:

```javascript
const CONFIG = Object.freeze({
  BASE_URL: 'http://localhost:8000', // Change this to your production API server
  // ...
});
```

The app communicates with the following endpoints:
- `GET /api/dashboard/current/` — returns the latest reading.
- `GET /api/dashboard/history/?hours=24` — returns chronological readings for temperature graphs.
- `GET /api/dashboard/alarms/` — returns grouped alarms of low/high alerts.