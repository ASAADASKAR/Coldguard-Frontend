/**
 * ColdGuard Dashboard — Configuration
 * Central configuration for API endpoints, thresholds, and timing.
 */

const CONFIG = Object.freeze({
  // Backend API base URL — change this for production deployment
  BASE_URL: 'http://localhost:8000',

  // API endpoints (relative to BASE_URL)
  ENDPOINTS: Object.freeze({
    CURRENT:  '/api/dashboard/current/',
    HISTORY:  '/api/dashboard/history/',
    ALARMS:   '/api/dashboard/alarms/',
  }),

  // Temperature thresholds (must match backend constants)
  THRESHOLDS: Object.freeze({
    MIN: 1.0,   // Lower limit in Celsius
    MAX: 8.0,   // Upper limit in Celsius
  }),

  // Sensor physical range (DS18B20)
  SENSOR_RANGE: Object.freeze({
    MIN: -10.0,
    MAX: 15.0,
  }),

  // Auto-refresh interval in milliseconds
  REFRESH_INTERVAL_MS: 60_000,

  // Data is considered stale after this many milliseconds
  STALE_THRESHOLD_MS: 5 * 60_000,

  // Default time range for chart (hours)
  DEFAULT_HOURS: 24,

  // Available time ranges for chart selector
  TIME_RANGES: Object.freeze([
    { label: '6h',  hours: 6   },
    { label: '12h', hours: 12  },
    { label: '24h', hours: 24  },
    { label: '48h', hours: 48  },
    { label: '7d',  hours: 168 },
  ]),

  // Status constants (must match backend TemperatureStatus)
  STATUS: Object.freeze({
    OK:         'OK',
    ALARM_HIGH: 'ALARM_HIGH',
    ALARM_LOW:  'ALARM_LOW',
    NO_DATA:    'NO_DATA',
  }),
});
