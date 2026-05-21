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

  return Object.freeze({
    formatTime,
    formatDateTime,
    relativeTime,
    formatDuration,
    isStale,
    animateValue,
    debounce,
  });
})();
