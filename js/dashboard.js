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
      gaugePeakMin: document.getElementById('gauge-peak-min'),
      gaugePeakMax: document.getElementById('gauge-peak-max'),
      gaugeCompressor: document.getElementById('gauge-compressor'),
      
      // Chart Card
      chartCanvas: document.getElementById('temp-chart'),
      rangeSelector: document.getElementById('range-selector'),
      
      // Alarms Card
      alarmList: document.getElementById('alarm-list'),

      // Diagnostics & Telemetry
      diagMkt: document.getElementById('diag-mkt'),
      diagUptime: document.getElementById('diag-uptime'),
      diagCycles: document.getElementById('diag-cycles'),
      exportCsvBtn: document.getElementById('export-csv-btn'),
      forecastWarning: document.getElementById('forecast-warning'),
      forecastMinutes: document.getElementById('forecast-minutes'),

      // Audio Toggle
      audioToggle: document.getElementById('audio-toggle'),
      audioIcon: document.getElementById('audio-icon'),
    };
  }

  // Audio Engine
  const AudioEngine = (() => {
    let ctx = null;
    let enabled = false;
    let alarmOscillator = null;
    let alarmGain = null;
    let pulseInterval = null;

    function init() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      ctx = new AudioContext();
    }

    function toggle() {
      enabled = !enabled;
      if (enabled && !ctx) init();
      if (enabled && ctx && ctx.state === 'suspended') ctx.resume();
      
      if (!enabled) stopAlarm();
      return enabled;
    }

    function playRefreshChime() {
      if (!enabled || !ctx) return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 1);
    }

    function playAlarm(status) {
      if (!enabled || !ctx) return;
      
      if (status !== CONFIG.STATUS.ALARM_HIGH && status !== CONFIG.STATUS.ALARM_LOW) {
        stopAlarm();
        return;
      }
      
      if (!alarmOscillator) {
        alarmOscillator = ctx.createOscillator();
        alarmGain = ctx.createGain();
        alarmOscillator.connect(alarmGain);
        alarmGain.connect(ctx.destination);
        alarmOscillator.start();
        
        pulseInterval = setInterval(() => {
           if (ctx && alarmGain) {
             const now = ctx.currentTime;
             if (status === CONFIG.STATUS.ALARM_HIGH) {
                alarmGain.gain.cancelScheduledValues(now);
                alarmGain.gain.setValueAtTime(0.05, now);
                alarmGain.gain.linearRampToValueAtTime(0.2, now + 0.2);
                alarmGain.gain.linearRampToValueAtTime(0.05, now + 0.5);
             } else {
                alarmGain.gain.cancelScheduledValues(now);
                alarmGain.gain.setValueAtTime(0.01, now);
                alarmGain.gain.linearRampToValueAtTime(0.08, now + 1);
                alarmGain.gain.linearRampToValueAtTime(0.01, now + 2);
             }
           }
        }, status === CONFIG.STATUS.ALARM_HIGH ? 500 : 2000);
      }
      
      if (status === CONFIG.STATUS.ALARM_HIGH) {
        alarmOscillator.type = 'sawtooth';
        alarmOscillator.frequency.setValueAtTime(110, ctx.currentTime); // Deep A2
      } else {
        alarmOscillator.type = 'sine';
        alarmOscillator.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6 crystal hum
      }
    }

    function stopAlarm() {
      if (pulseInterval) clearInterval(pulseInterval);
      if (alarmOscillator) {
        alarmOscillator.stop();
        alarmOscillator.disconnect();
        alarmGain.disconnect();
        alarmOscillator = null;
        alarmGain = null;
      }
    }

    return { toggle, playRefreshChime, playAlarm, isEnabled: () => enabled };
  })();

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
    
    if (dom.audioToggle) {
      dom.audioToggle.addEventListener('click', () => {
        const isEnabled = AudioEngine.toggle();
        dom.audioToggle.classList.toggle('active', isEnabled);
        if (dom.audioIcon) {
          dom.audioIcon.textContent = isEnabled ? '🔊' : '🔇';
          dom.audioIcon.title = isEnabled ? I18n.t('soundOn') : I18n.t('soundOff');
        }
      });
    }

    if (dom.exportCsvBtn) {
      dom.exportCsvBtn.addEventListener('click', exportToCSV);
    }

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

    // Audio status translation
    if (dom.audioIcon && dom.audioToggle) {
      dom.audioToggle.title = AudioEngine.isEnabled() ? I18n.t('soundOn') : I18n.t('soundOff');
    }
  }

  function calculateUptime(readings) {
    if (!readings || readings.length === 0) return 0;
    let safeCount = 0;
    for (const r of readings) {
      if (r.temperature >= CONFIG.THRESHOLDS.MIN && r.temperature <= CONFIG.THRESHOLDS.MAX) {
        safeCount++;
      }
    }
    return (safeCount / readings.length) * 100;
  }

  function calculateCycles(readings) {
    if (!readings || readings.length < 3) return 0;
    let cycles = 0;
    // Simple peak detection to estimate compressor cycles
    for (let i = 1; i < readings.length - 1; i++) {
      if (readings[i].temperature > readings[i-1].temperature && readings[i].temperature > readings[i+1].temperature) {
        cycles++;
      }
    }
    return cycles;
  }

  function exportToCSV() {
    Api.getHistory(activeHours).then(readings => {
      if (!readings || readings.length === 0) return;
      
      const header = "Timestamp,Temperature,Unit,Status\n";
      const rows = readings.map(r => `${new Date(r.timestamp).toISOString()},${r.temperature},${r.unit},${r.status}`).join('\n');
      
      const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `coldguard-export-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }).catch(err => console.error("CSV Export Error:", err));
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

      // Process Diagnostics & Telemetry
      const mkt = Utils.calculateMKT(historyData);
      if (dom.diagMkt) {
        dom.diagMkt.textContent = mkt !== null ? mkt.toFixed(2) : '—';
      }
      
      if (dom.diagUptime) {
        dom.diagUptime.textContent = calculateUptime(historyData).toFixed(1);
      }
      
      if (dom.diagCycles) {
        dom.diagCycles.textContent = calculateCycles(historyData);
      }

      // Update Gauge Peaks & Compressor Status
      updateGaugeExtra(historyData, currentData);

      // Process Chart and Forecast
      TempChart.render(dom.chartCanvas, historyData);
      const forecast = Utils.predictFutureTrend(historyData);
      if (forecast && forecast.breach) {
        dom.forecastWarning.classList.remove('hidden');
        dom.forecastMinutes.textContent = forecast.breach.minutes;
        if (forecast.breach.type === CONFIG.STATUS.ALARM_LOW) {
           dom.forecastWarning.classList.add('frost');
        } else {
           dom.forecastWarning.classList.remove('frost');
        }
      } else {
        dom.forecastWarning.classList.add('hidden');
      }

      // Process Alarms
      updateAlarms(alarmsData);
      
      // Update ambient background based on current status
      updateAurora(currentData ? currentData.status : null);
      
      // Play Audio Chime
      AudioEngine.playRefreshChime();

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
    
    // Play ongoing alarm sound if necessary
    AudioEngine.playAlarm(data.status);
  }

  function updateAurora(status) {
    dom.html.classList.remove('aurora-safe', 'aurora-heat', 'aurora-frost');
    dom.html.style.background = ''; // remove inline styles if any
    document.body.className = '';
    
    if (status === CONFIG.STATUS.OK) {
      document.body.classList.add('aurora-safe');
    } else if (status === CONFIG.STATUS.ALARM_HIGH) {
      document.body.classList.add('aurora-heat');
    } else if (status === CONFIG.STATUS.ALARM_LOW) {
      document.body.classList.add('aurora-frost');
    }
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

  function updateGaugeExtra(readings, currentData) {
    if (!readings || readings.length === 0) return;
    
    // Peak Markers
    const peaks = Utils.getPeaks(readings);
    const minSens = CONFIG.SENSOR_RANGE.MIN;
    const maxSens = CONFIG.SENSOR_RANGE.MAX;
    
    if (peaks.min !== null && dom.gaugePeakMin) {
      dom.gaugePeakMin.classList.remove('hidden');
      const clampMin = Math.min(Math.max(peaks.min, minSens), maxSens);
      const pctMin = (clampMin - minSens) / (maxSens - minSens);
      const rotMin = -90 + (pctMin * 180);
      dom.gaugePeakMin.style.transform = `rotate(${rotMin}deg)`;
    }
    
    if (peaks.max !== null && dom.gaugePeakMax) {
      dom.gaugePeakMax.classList.remove('hidden');
      const clampMax = Math.min(Math.max(peaks.max, minSens), maxSens);
      const pctMax = (clampMax - minSens) / (maxSens - minSens);
      const rotMax = -90 + (pctMax * 180);
      dom.gaugePeakMax.style.transform = `rotate(${rotMax}deg)`;
    }
    
    // Compressor Status indicator (simple heuristic: if cooling down or safe zone and active)
    if (dom.gaugeCompressor && currentData) {
      const isCooling = (previousTemperature !== null && currentTemperature < previousTemperature) || (currentTemperature > CONFIG.THRESHOLDS.MAX);
      if (isCooling) {
        dom.gaugeCompressor.classList.add('compressor-active');
      } else {
        dom.gaugeCompressor.classList.remove('compressor-active');
      }
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
