/**
 * ColdGuard Dashboard — Main Controller
 * Orchestrates all modules (I18n, Utils, Api, TempChart) to drive the dashboard application.
 */

const Dashboard = (() => {
  // State
  let activeHours = CONFIG.DEFAULT_HOURS;
  let countdownSeconds = CONFIG.REFRESH_INTERVAL_MS / 1000;
  let countdownTimer = null;
  let currentTemperature = null;
  let previousTemperature = null;

  // DOM Elements cache
  let dom = {};

  /**
   * Cache all required DOM elements.
   */
  function cacheDOM() {
    dom = {
      html: document.documentElement,
      appLoader: document.getElementById('app-loader'),
      appContent: document.getElementById('app-content'),
      errorOverlay: document.getElementById('error-overlay'),
      retryBtn: document.getElementById('retry-btn'),
      
      // Header
      langSelector: document.getElementById('lang-selector'),
      refreshTimerVal: document.getElementById('refresh-timer-val'),
      refreshBtn: document.getElementById('refresh-btn'),
      
      // Alerts & Warnings
      staleAlert: document.getElementById('stale-alert'),
      
      // Main Reading Card
      currentTempVal: document.getElementById('current-temp-val'),
      currentTempUnit: document.getElementById('current-temp-unit'),
      statusBadge: document.getElementById('status-badge'),
      deviceName: document.getElementById('device-name'),
      lastUpdateVal: document.getElementById('last-update-val'),
      
      // Gauge
      gaugeSvg: document.getElementById('gauge-svg'),
      gaugePointer: document.getElementById('gauge-pointer'),
      gaugeFill: document.getElementById('gauge-fill'),
      gaugeValMin: document.getElementById('gauge-val-min'),
      gaugeValMax: document.getElementById('gauge-val-max'),
      
      // Chart Card
      chartCanvas: document.getElementById('temp-chart'),
      rangeSelector: document.getElementById('range-selector'),
      
      // Alarms Card
      alarmList: document.getElementById('alarm-list'),
    };
  }

  /**
   * Initialize the dashboard application.
   */
  async function init() {
    cacheDOM();
    
    // Initialize internationalization
    I18n.init();
    setupLanguageSelector();
    
    // Initial page translation
    translatePage();

    // Bind event listeners
    dom.refreshBtn.addEventListener('click', () => refresh(true));
    dom.retryBtn.addEventListener('click', () => refresh(true));
    setupRangeSelector();

    // Load first batch of data
    await refresh(false);

    // Hide loader, show app content
    if (dom.appLoader) dom.appLoader.classList.add('hidden');
    if (dom.appContent) dom.appContent.classList.remove('hidden');

    // Start auto-refresh interval countdown
    startCountdown();
  }

  /**
   * Set up the language dropdown list and change handler.
   */
  function setupLanguageSelector() {
    if (!dom.langSelector) return;
    
    // Set initial value
    dom.langSelector.value = I18n.getLanguage();
    
    dom.langSelector.addEventListener('change', (e) => {
      I18n.setLanguage(e.target.value);
      translatePage();
      
      // Re-fetch/re-render to apply localized values & chart scales
      refresh(false);
    });
  }

  /**
   * Setup range buttons (6h, 12h, 24h, etc.) for chart selection.
   */
  function setupRangeSelector() {
    if (!dom.rangeSelector) return;

    dom.rangeSelector.innerHTML = '';
    CONFIG.TIME_RANGES.forEach(range => {
      const btn = document.createElement('button');
      btn.className = `btn btn-outline-sm ${range.hours === activeHours ? 'active' : ''}`;
      btn.textContent = range.label;
      btn.setAttribute('data-hours', range.hours);
      
      btn.addEventListener('click', (e) => {
        // Toggle active status
        dom.rangeSelector.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        activeHours = parseInt(e.target.getAttribute('data-hours'));
        loadChartData();
      });
      
      dom.rangeSelector.appendChild(btn);
    });
  }

  /**
   * Translate all DOM nodes containing data-i18n attribute.
   */
  function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = I18n.t(key);
      } else {
        el.textContent = I18n.t(key);
      }
    });

    // Update gauge threshold texts
    if (dom.gaugeValMin) dom.gaugeValMin.textContent = `${CONFIG.THRESHOLDS.MIN.toFixed(1)}°C`;
    if (dom.gaugeValMax) dom.gaugeValMax.textContent = `${CONFIG.THRESHOLDS.MAX.toFixed(1)}°C`;
  }

  /**
   * Main fetch orchestration.
   * @param {boolean} animate - Whether to animate values counting up/down.
   */
  async function refresh(animate = true) {
    try {
      // Hide error screen
      if (dom.errorOverlay) dom.errorOverlay.classList.add('hidden');
      
      // Rotate refresh button icon for user feedback
      dom.refreshBtn.classList.add('spinning');
      setTimeout(() => dom.refreshBtn.classList.remove('spinning'), 1000);

      // Fetch all endpoints concurrently
      const [currentData, historyData, alarmsData] = await Promise.all([
        Api.getCurrentStatus(),
        Api.getHistory(activeHours),
        Api.getAlarms(),
      ]);

      // Process current reading card & Gauge
      updateCurrentReading(currentData, animate);

      // Process Chart
      TempChart.render(dom.chartCanvas, historyData);

      // Process Alarms
      updateAlarms(alarmsData);

      // Reset auto-refresh timer countdown
      countdownSeconds = CONFIG.REFRESH_INTERVAL_MS / 1000;
      updateCountdownUI();

    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      // Show connection error panel
      if (dom.errorOverlay) dom.errorOverlay.classList.remove('hidden');
    }
  }

  /**
   * Separately updates chart data on range click to avoid overall page refresh.
   */
  async function loadChartData() {
    try {
      const historyData = await Api.getHistory(activeHours);
      TempChart.render(dom.chartCanvas, historyData);
    } catch (error) {
      console.error('Error reloading chart data:', error);
    }
  }

  /**
   * Update the primary temperature metrics, badge, and gauge pointer.
   */
  function updateCurrentReading(data, animate) {
    if (!data) return;

    previousTemperature = currentTemperature;
    currentTemperature = data.temperature;

    // Check for stale readings
    const isReadingStale = Utils.isStale(data.timestamp);
    if (isReadingStale && data.timestamp) {
      dom.staleAlert.classList.remove('hidden');
    } else {
      dom.staleAlert.classList.add('hidden');
    }

    // Temperature text update (animate if applicable)
    if (currentTemperature !== null) {
      if (animate && previousTemperature !== null) {
        Utils.animateValue(dom.currentTempVal, previousTemperature, currentTemperature);
      } else {
        dom.currentTempVal.textContent = currentTemperature.toFixed(1);
      }
      dom.currentTempUnit.textContent = `°${data.unit}`;
    } else {
      dom.currentTempVal.textContent = '—';
      dom.currentTempUnit.textContent = '';
    }

    // Status Badge & Classes
    dom.statusBadge.className = 'status-badge'; // Reset classes
    dom.statusBadge.classList.add(`status-${data.status.toLowerCase()}`);
    
    // Status text lookup key
    let statusKey = 'statusOk';
    if (data.status === CONFIG.STATUS.ALARM_HIGH) statusKey = 'statusAlarmHigh';
    if (data.status === CONFIG.STATUS.ALARM_LOW) statusKey = 'statusAlarmLow';
    if (data.status === CONFIG.STATUS.NO_DATA) statusKey = 'statusNoData';
    dom.statusBadge.textContent = I18n.t(statusKey);

    // Metadata
    dom.deviceName.textContent = data.device ? data.device : `—`;
    dom.lastUpdateVal.textContent = data.timestamp ? Utils.relativeTime(data.timestamp) : I18n.t('waitingForData');

    // Update circular SVG Gauge
    updateGauge(currentTemperature);
  }

  /**
   * Draw the gauge angle position and colored filling path.
   * SVG Gauge uses 180 degrees (semi-circle) from 180deg (left) to 0deg (right).
   * Range: SENSOR_RANGE.MIN (-10°C) to SENSOR_RANGE.MAX (+15°C)
   * Safe zone: Thresh.MIN (1°C) to Thresh.MAX (8°C)
   */
  function updateGauge(temp) {
    if (temp === null || isNaN(temp)) {
      if (dom.gaugePointer) dom.gaugePointer.style.transform = 'rotate(-90deg)'; // Centered
      return;
    }

    // Clamp temp within sensor limit bounds
    const minSens = CONFIG.SENSOR_RANGE.MIN;
    const maxSens = CONFIG.SENSOR_RANGE.MAX;
    const clampedTemp = Math.min(Math.max(temp, minSens), maxSens);

    // Calculate percentage across the range
    const percent = (clampedTemp - minSens) / (maxSens - minSens);

    // Map percentage to rotation degrees (semi-circle goes from -90deg to +90deg in our CSS/SVG setup)
    const minDegrees = -90;
    const maxDegrees = 90;
    const rotation = minDegrees + (percent * (maxDegrees - minDegrees));

    // Rotate needle path
    if (dom.gaugePointer) {
      dom.gaugePointer.style.transform = `rotate(${rotation}deg)`;
    }

    // Update gauge fill color matches status
    let fillColor = '#14b8a6'; // Safe Teal
    if (temp > CONFIG.THRESHOLDS.MAX) {
      fillColor = '#ef4444'; // Red alarm
    } else if (temp < CONFIG.THRESHOLDS.MIN) {
      fillColor = '#3b82f6'; // Blue alarm
    }

    if (dom.gaugeFill) {
      dom.gaugeFill.style.stroke = fillColor;
    }
  }

  /**
   * Renders consecutive grouped alarm event items.
   */
  function updateAlarms(alarms) {
    if (!dom.alarmList) return;

    dom.alarmList.innerHTML = '';

    if (!alarms || alarms.length === 0) {
      dom.alarmList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🛡️</div>
          <h3 data-i18n="noAlarms">${I18n.t('noAlarms')}</h3>
          <p data-i18n="noAlarmsDesc">${I18n.t('noAlarmsDesc')}</p>
        </div>
      `;
      return;
    }

    alarms.forEach(alarm => {
      const item = document.createElement('div');
      item.className = `alarm-item border-${alarm.status.toLowerCase()}`;

      // Status indicator bubble
      const icon = alarm.status === CONFIG.STATUS.ALARM_HIGH ? '⚠️' : '❄️';
      
      // Calculate duration or display "ongoing"
      const durationStr = alarm.resolved_at 
        ? Utils.formatDuration(alarm.started_at, alarm.resolved_at)
        : I18n.t('ongoing');
      
      const badgeClass = alarm.resolved_at ? 'badge-resolved' : 'badge-ongoing';
      const badgeText = alarm.resolved_at ? I18n.t('resolved') : I18n.t('ongoing');

      // Peaks
      const peakVal = alarm.status === CONFIG.STATUS.ALARM_HIGH ? alarm.max_temp : alarm.min_temp;

      item.innerHTML = `
        <div class="alarm-header">
          <span class="alarm-title">
            <span class="alarm-icon">${icon}</span>
            ${alarm.message}
          </span>
          <span class="alarm-status-badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="alarm-details">
          <div class="alarm-meta">
            <span><strong>${I18n.t('device')}:</strong> ${alarm.device}</span>
            <span><strong>${I18n.t('started')}:</strong> ${Utils.formatDateTime(alarm.started_at)}</span>
            <span><strong>${I18n.t('duration')}:</strong> ${durationStr}</span>
          </div>
          <div class="alarm-metric">
            <span class="alarm-metric-label">${I18n.t('peakTemp')}</span>
            <span class="alarm-metric-val">${peakVal.toFixed(1)}°C</span>
          </div>
        </div>
      `;

      dom.alarmList.appendChild(item);
    });
  }

  /**
   * Run interval timers for periodic refreshing.
   */
  function startCountdown() {
    if (countdownTimer) clearInterval(countdownTimer);
    
    countdownTimer = setInterval(() => {
      countdownSeconds--;
      
      if (countdownSeconds <= 0) {
        refresh(true);
      } else {
        updateCountdownUI();
      }
    }, 1000);
  }

  /**
   * Update the navbar refresh time ticker.
   */
  function updateCountdownUI() {
    if (dom.refreshTimerVal) {
      dom.refreshTimerVal.textContent = countdownSeconds;
    }
  }

  return Object.freeze({
    init,
    refresh,
  });
})();

// Document Ready Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  Dashboard.init();
});
