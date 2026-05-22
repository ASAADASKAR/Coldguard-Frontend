/**
 * ColdGuard Dashboard — Utility Functions
 * Date formatting, relative time, duration helpers.
 */

const Utils = (() => {

  /**
   * Format an ISO timestamp to a localized time string.
   * @param {string} isoString - ISO 8601 timestamp.
   * @returns {string} Formatted time (e.g. "14:32" or "2:32 PM").
   */
  function formatTime(isoString) {
    if (!isoString) return '—';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleTimeString(I18n.getLanguage(), {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Format an ISO timestamp to a localized date + time string.
   * @param {string} isoString - ISO 8601 timestamp.
   * @returns {string} Formatted date/time (e.g. "19 May, 14:32").
   */
  function formatDateTime(isoString) {
    if (!isoString) return '—';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(I18n.getLanguage(), {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Get a human-readable relative time string.
   * @param {string} isoString - ISO 8601 timestamp.
   * @returns {string} e.g. "3 min ago", "2 h ago", "Just now"
   */
  function relativeTime(isoString) {
    if (!isoString) return '—';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '—';

    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    const diffHrs = Math.floor(diffMs / 3_600_000);

    if (diffMin < 1) return I18n.t('justNow');
    if (diffMin < 60) return `${diffMin} ${I18n.t('minutesAgo')}`;
    return `${diffHrs} ${I18n.t('hoursAgo')}`;
  }

  /**
   * Calculate duration between two ISO timestamps.
   * @param {string} startIso - Start time.
   * @param {string} endIso - End time (null = ongoing).
   * @returns {string} e.g. "1h 23min"
   */
  function formatDuration(startIso, endIso) {
    if (!startIso) return '—';
    const start = new Date(startIso);
    const end = endIso ? new Date(endIso) : new Date();

    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return '—';

    const hours = Math.floor(diffMs / 3_600_000);
    const minutes = Math.floor((diffMs % 3_600_000) / 60_000);

    if (hours > 0) {
      return `${hours}${I18n.t('durationHours')} ${minutes}${I18n.t('durationMinutes')}`;
    }
    return `${minutes}${I18n.t('durationMinutes')}`;
  }

  /**
   * Check if a timestamp is older than the stale threshold.
   * @param {string} isoString - ISO 8601 timestamp.
   * @returns {boolean}
   */
  function isStale(isoString) {
    if (!isoString) return false;
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return false;
    return (Date.now() - date.getTime()) > CONFIG.STALE_THRESHOLD_MS;
  }

  /**
   * Animate a numeric value counting up/down.
   * @param {HTMLElement} el - Target element.
   * @param {number} from - Start value.
   * @param {number} to - End value.
   * @param {number} durationMs - Animation duration in ms.
   */
  function animateValue(el, from, to, durationMs = 800) {
    if (from === to || isNaN(from) || isNaN(to)) {
      el.textContent = to != null ? to.toFixed(1) : '—';
      return;
    }

    const startTime = performance.now();
    const diff = to - from;

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + diff * eased;
      el.textContent = current.toFixed(1);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  /**
   * Debounce a function.
   * @param {Function} fn - Function to debounce.
   * @param {number} delayMs - Delay in ms.
   * @returns {Function}
   */
  function debounce(fn, delayMs) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delayMs);
    };
  }

  /**
   * Calculate the Mean Kinetic Temperature (MKT) for a series of readings.
   * Standard activation energy (dH) is 83.144 kJ/mol.
   * Gas constant (R) is 0.0083144 kJ/mol*K.
   * dH / R = 10000 K.
   * @param {Array} readings - Array of temperature readings.
   * @returns {number|null} MKT in Celsius.
   */
  function calculateMKT(readings) {
    if (!readings || readings.length === 0) return null;

    const DH_R = 10000.0; // dH / R in Kelvin
    let sumExp = 0;
    let validCount = 0;

    for (const r of readings) {
      if (r.temperature === null || isNaN(r.temperature)) continue;
      const tempKelvin = r.temperature + 273.15;
      sumExp += Math.exp(-DH_R / tempKelvin);
      validCount++;
    }

    if (validCount === 0) return null;

    const mktKelvin = DH_R / -Math.log(sumExp / validCount);
    return mktKelvin - 273.15; // Convert back to Celsius
  }

  /**
   * Fits a linear regression trend line to the last N readings
   * and projects temperature readings into the future.
   * Also computes predictions on bounds crossings (if any).
   * @param {Array} readings - Current history data.
   * @param {number} minutesIntoFuture - Projection timeline duration (default 120m).
   * @param {number} N - Number of recent elements to evaluate (default 12 = 2 hours).
   * @returns {object|null}
   */
  function predictFutureTrend(readings, minutesIntoFuture = 120, N = 12) {
    if (!readings || readings.length < 2) return null;

    // Capture the recent trend (last N points)
    const recent = readings.slice(-Math.min(N, readings.length));
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    const count = recent.length;

    // Use seconds from first recent point as X coordinates to avoid float issues
    const t0 = new Date(recent[0].timestamp).getTime() / 1000;

    for (const r of recent) {
      const x = (new Date(r.timestamp).getTime() / 1000) - t0;
      const y = r.temperature;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }

    const denominator = (count * sumX2) - (sumX * sumX);
    if (denominator === 0) return null;

    const slope = ((count * sumXY) - (sumX * sumY)) / denominator; // Change in °C per second
    const intercept = (sumY - (slope * sumX)) / count;

    const lastReading = readings[readings.length - 1];
    const lastTime = new Date(lastReading.timestamp);
    const lastX = (lastTime.getTime() / 1000) - t0;

    const forecastPoints = [];
    const stepMin = 10; // Generate prediction points every 10 min
    const steps = Math.ceil(minutesIntoFuture / stepMin);

    for (let i = 1; i <= steps; i++) {
      const futureTime = new Date(lastTime.getTime() + i * stepMin * 60 * 1000);
      const futureX = lastX + (i * stepMin * 60);
      const predictedTemp = (slope * futureX) + intercept;

      // Clamp within realistic sensor bounds
      const clampedTemp = Math.min(Math.max(predictedTemp, CONFIG.SENSOR_RANGE.MIN), CONFIG.SENSOR_RANGE.MAX);

      forecastPoints.push({
        temperature: clampedTemp,
        timestamp: futureTime.toISOString(),
        isForecast: true,
        status: 'OK' // Default status
      });
    }

    // Scan the forecast path to predict exact breaches
    let breach = null;
    for (const pt of forecastPoints) {
      if (pt.temperature > CONFIG.THRESHOLDS.MAX) {
        breach = {
          minutes: Math.round((new Date(pt.timestamp) - lastTime) / 60_000),
          temperature: pt.temperature,
          type: CONFIG.STATUS.ALARM_HIGH
        };
        break;
      } else if (pt.temperature < CONFIG.THRESHOLDS.MIN) {
        breach = {
          minutes: Math.round((new Date(pt.timestamp) - lastTime) / 60_000),
          temperature: pt.temperature,
          type: CONFIG.STATUS.ALARM_LOW
        };
        break;
      }
    }

    return {
      points: forecastPoints,
      slopePerMinute: slope * 60,
      breach: breach
    };
  }

  /**
   * Computes the maximum and minimum readings in a history set.
   * @param {Array} readings - Array of readings.
   * @returns {object} { min, max }
   */
  function getPeaks(readings) {
    if (!readings || readings.length === 0) return { min: null, max: null };
    let min = Infinity;
    let max = -Infinity;

    for (const r of readings) {
      if (r.temperature === null || isNaN(r.temperature)) continue;
      if (r.temperature < min) min = r.temperature;
      if (r.temperature > max) max = r.temperature;
    }

    return {
      min: min === Infinity ? null : min,
      max: max === -Infinity ? null : max
    };
  }

  return Object.freeze({
    formatTime,
    formatDateTime,
    relativeTime,
    formatDuration,
    isStale,
    animateValue,
    debounce,
    calculateMKT,
    predictFutureTrend,
    getPeaks,
  });
})();

