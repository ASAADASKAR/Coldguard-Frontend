/**
 * ColdGuard Dashboard Hook
 * Custom React hook that manages all dashboard data fetching and state.
 * Automatically refreshes data every 40 seconds.
 */

import { useCallback, useEffect, useState } from 'react';
import { fetchAlarms, fetchCurrent, fetchHistory, fetchLogs } from '../api/client';

/**
 * Custom hook for dashboard data management.
 * @param {number} hours - Number of hours for history (default: 24)
 * @param {string} lang - Language code (en, de, ar)
 * @returns {{
 *   current: object|null,
 *   history: Array,
 *   alarms: Array,
 *   logs: Array,
 *   loading: boolean,
 *   error: string|null,
 *   refresh: function,
 *   countdown: number
 * }}
 */
export function useDashboard(hours = 24, lang = 'en') {
  const [current, setCurrent]   = useState(null);
  const [history, setHistory]   = useState([]);
  const [alarms,  setAlarms]    = useState([]);
  const [logs,    setLogs]      = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);
  const [countdown, setCountdown] = useState(40);

  /**
   * Fetches all dashboard data concurrently.
   */
  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [cur, hist, alrm, lgz] = await Promise.all([
        fetchCurrent(),
        fetchHistory(hours),
        fetchAlarms(),
        fetchLogs(lang),
      ]);
      setCurrent(cur);
      setHistory(hist);
      setAlarms(alrm);
      setLogs(lgz);
      setCountdown(40);
    } catch (err) {
      setError('Unable to connect to server');
      console.error('Dashboard refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, [hours, lang]);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { refresh(); return 40; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [refresh]);

  return { current, history, alarms, logs, loading, error, refresh, countdown };
}