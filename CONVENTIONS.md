# ColdGuard — Development Conventions & Standards

## Introduction

This document defines the coding standards, naming conventions, and
workflows for the ColdGuard Frontend project.

**All contributors must read and follow these conventions before
writing any code.**

ColdGuard is built by a small team — consistency is what keeps the
codebase readable and maintainable as we grow.

---

## Golden Rules

1. **English only** — code, comments, commits, PRs, documentation
2. **Never push directly to main** — always Branch → PR → Review → Merge
3. **Never merge your own PR** — another person must review and approve
4. **Never use magic numbers** — always use constants
5. **Never hardcode API URLs** — always use environment variables
6. **Tests must pass** — never merge a PR with failing CI

---

## JavaScript / React

| Type | Format | Example |
|---|---|---|
| Files (Components) | PascalCase | `MetricCard.jsx`, `TempChart.jsx` |
| Files (utils/api) | camelCase | `client.js`, `formatDate.js` |
| Variables | camelCase | `tempReading`, `deviceKey` |
| Constants | UPPER_CASE | `DEVICE_KEY`, `HOURS_MAP` |
| Functions | camelCase | `fetchCurrent()`, `formatDuration()` |
| Components | PascalCase | `MetricCard`, `DeviceLogs` |
| CSS Classes | kebab-case | `metric-card`, `panel-head` |

---

## Component Structure

Every component follows this order:

```jsx
// 1. Imports
import { useState } from 'react';

// 2. Constants (if component-specific)
const DEFAULT_RANGE = '24h';

// 3. Component
function MetricCard({ kind, label, value, unit, foot, badge, dim }) {
  // 4. State
  const [loading, setLoading] = useState(false);

  // 5. Effects
  useEffect(() => { ... }, []);

  // 6. Handlers
  const handleClick = () => { ... };

  // 7. Render
  return (
    <div className={`card metric ${kind}`}>
      ...
    </div>
  );
}

// 8. Export
export default MetricCard;
```

---

## Git Workflow

### Branch naming
```
KAN-{number}-{short-description}
```
Examples:
```
KAN-15-New-Dashboard
KAN-38-Customer-Registration
KAN-51-Heartbeat-Offline-UI
```

### Commit messages
```
[KAN-{number}]: {description}
```
Examples:
```
[KAN-15]: add temperature chart with recharts
[KAN-51]: show offline state in metric cards
[KAN-15]: fix MetricCard prop mismatch
```

### Commit types
| Type | When |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code restructuring |
| `test` | Adding or updating tests |
| `chore` | Dependencies, config, tooling |

### Pull Requests
- Title: `[KAN-{number}]: {description}`
- Link the Jira ticket in the description
- Never merge your own PR
- Only merge when CI is green ✅

---

## CSS & Styling

All styles live in `index.css` using CSS variables defined at `:root`.

```css
/* Use CSS variables — never hardcode colors */

/* Wrong ❌ */
color: #1D9E75;
background: #0b0f0e;

/* Correct ✅ */
color: var(--green);
background: var(--bg-0);
```

### Available CSS Variables
```css
--green, --green-soft, --green-line
--red, --red-soft, --red-line
--amber, --amber-soft, --amber-line
--bg-0, --bg-1, --bg-2, --bg-3
--fg-0, --fg-1, --fg-2, --fg-3
--line, --line-2
--radius, --radius-sm
--shadow
```

---

## Constants & Magic Values

Never use magic strings or numbers directly in code.

```jsx
// Wrong ❌
const hours = range === '24h' ? 24 : range === '7d' ? 168 : 720;
const isAlarm = status === 'ALARM_HIGH' || status === 'ALARM_LOW';

// Correct ✅
const HOURS_MAP = { '24h': 24, '7d': 168, '30d': 720 };
const ALARM_STATUSES = ['ALARM_HIGH', 'ALARM_LOW'];

const hours = HOURS_MAP[range];
const isAlarm = ALARM_STATUSES.includes(status);
```

---

## i18n (Multilingual)

All user-facing text goes through the `I18N` object in `App.jsx`.
Never hardcode text directly in JSX.

```jsx
// Wrong ❌
<span>Device unreachable</span>

// Correct ✅
<span>{t.device_unreachable}</span>
```

Supported languages: `de`, `en`, `ar` (RTL)

---

## API Calls

All API calls go through `src/api/client.js`.
Never call `fetch()` directly in components.

```jsx
// Wrong ❌
const res = await fetch('http://localhost:8000/api/dashboard/current/');

// Correct ✅
import { fetchCurrent } from './api/client';
const data = await fetchCurrent();
```

---

## Questions?

Open a discussion in the GitHub repository or ask in the team chat.
If a convention is missing or unclear → update this document!