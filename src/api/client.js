/**
 * ColdGuard API Client
 * Handles all HTTP requests to the Django REST Backend.
 * Base URL: http://localhost:8000
 */

const BASE_URL = 'http://localhost:8000';
const DEVICE_KEY = 'coldguard-device-003';

/**
 * Fetches the current temperature reading from the backend.
 * @returns {Promise<{temperature: number, status: string, device: string, timestamp: string, unit: string}>}
 */
export async function fetchCurrent() {
  const res = await fetch(`${BASE_URL}/api/dashboard/current/`);
  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  return res.json();
}

/**
 * Fetches temperature history for a given number of hours.
 * @param {number} hours - Number of hours to fetch (default: 24)
 * @returns {Promise<Array<{temperature: number, status: string, timestamp: string, unit: string}>>}
 */
export async function fetchHistory(hours = 24) {
  const res = await fetch(`${BASE_URL}/api/dashboard/history/?hours=${hours}`);
  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  return res.json();
}

/**
 * Fetches alarm history from the backend.
 * @returns {Promise<Array<{status: string, started_at: string, resolved_at: string, max_temp: number, min_temp: number}>>}
 */
export async function fetchAlarms() {
  const res = await fetch(`${BASE_URL}/api/dashboard/alarms/`);
  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  return res.json();
}

/**
 * Fetches device error logs from the backend.
 * @param {string} lang - Language code for translated messages (en, de, ar)
 * @returns {Promise<Array<{level: string, message: string, friendly_message: string, timestamp: string}>>}
 */
export async function fetchLogs(lang = 'en') {
  const res = await fetch(`${BASE_URL}/api/logs/?device_key=${DEVICE_KEY}&lang=${lang}`);
  if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
  return res.json();
}