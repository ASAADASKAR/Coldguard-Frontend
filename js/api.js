/**
 * ColdGuard Dashboard — API Client Module
 * Handles all network requests to the Django REST API with error handling.
 */

const Api = (() => {

  /**
   * Helper to perform fetch requests with error handling.
   * @param {string} url - Absolute endpoint URL.
   * @returns {Promise<any>} Response JSON data.
   */
  async function request(url) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for [${url}]:`, error);
      throw error;
    }
  }

  /**
   * Fetch the current temperature status.
   * Endpoint: /api/dashboard/current/
   * @returns {Promise<object>}
   */
  async function getCurrentStatus() {
    const url = `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.CURRENT}`;
    return await request(url);
  }

  /**
   * Fetch the temperature history for a given number of hours.
   * Endpoint: /api/dashboard/history/?hours=N
   * @param {number} hours - Number of hours of history to fetch.
   * @returns {Promise<Array>}
   */
  async function getHistory(hours = CONFIG.DEFAULT_HOURS) {
    const url = `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.HISTORY}?hours=${hours}`;
    return await request(url);
  }

  /**
   * Fetch consecutive alarm events.
   * Endpoint: /api/dashboard/alarms/
   * @returns {Promise<Array>}
   */
  async function getAlarms() {
    const url = `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.ALARMS}`;
    return await request(url);
  }

  return Object.freeze({
    getCurrentStatus,
    getHistory,
    getAlarms,
  });
})();
