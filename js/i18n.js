/**
 * ColdGuard Dashboard — Internationalization (i18n)
 * Supports: English (en), German (de), Arabic (ar/RTL)
 * All user-facing strings are stored here — no hardcoded text in HTML/JS.
 */

const TRANSLATIONS = Object.freeze({
  en: {
    // Header
    appTitle: 'ColdGuard',
    refreshIn: 'Refresh in',
    seconds: 's',

    // Status Card
    currentTemp: 'Current Temperature',
    statusOk: 'OK',
    statusAlarmHigh: 'ALARM HIGH',
    statusAlarmLow: 'ALARM LOW',
    statusNoData: 'NO DATA',
    device: 'Device',
    lastUpdate: 'Last update',
    staleWarning: 'Data may be stale — last reading over 5 min ago',
    waitingForData: 'Waiting for first reading...',
    noDataIcon: '📡',

    // Gauge Card
    thresholdGauge: 'Threshold Gauge',
    minThreshold: 'Min',
    maxThreshold: 'Max',
    safeZone: 'Safe zone',
    belowMin: 'Below min',
    aboveMax: 'Above max',

    // Chart Card
    tempHistory: 'Temperature History',

    // Alarm Card
    alarmHistory: 'Alarm History',
    noAlarms: 'No alarms recorded',
    noAlarmsDesc: 'All temperatures within safe range',
    alarmHigh: 'Temperature exceeded upper threshold',
    alarmLow: 'Temperature dropped below lower threshold',
    peakTemp: 'Peak',
    duration: 'Duration',
    started: 'Started',
    ongoing: 'Ongoing',
    resolved: 'Resolved',

    // Time
    hoursAgo: 'h ago',
    minutesAgo: 'min ago',
    justNow: 'Just now',
    durationHours: 'h',
    durationMinutes: 'min',

    // Error
    connectionError: 'Unable to connect to server',
    retry: 'Retry',

    // Loading
    loading: 'Loading dashboard...',

    // Next-Level Additions
    diagnosticsTitle: 'Telemetry & Diagnostics',
    mkt: 'Mean Kinetic Temp (MKT)',
    uptime: 'Safe Range Uptime',
    compressorCycles: 'Compressor Cycles',
    downloadCSV: 'Export CSV',
    soundOn: 'Sound: On',
    soundOff: 'Sound: Off',
    predictedTemp: 'Forecast (2h)',
    forecastBreach: 'Breach Predicted',
    forecastBreachDesc: 'Breach expected in approx. ',
    active: 'Active',
    inactive: 'Inactive',
  },

  de: {
    appTitle: 'ColdGuard',
    refreshIn: 'Aktualisierung in',
    seconds: 's',

    currentTemp: 'Aktuelle Temperatur',
    statusOk: 'OK',
    statusAlarmHigh: 'ALARM HOCH',
    statusAlarmLow: 'ALARM NIEDRIG',
    statusNoData: 'KEINE DATEN',
    device: 'Gerät',
    lastUpdate: 'Letzte Aktualisierung',
    staleWarning: 'Daten möglicherweise veraltet — letzte Messung vor über 5 Min.',
    waitingForData: 'Warte auf erste Messung...',
    noDataIcon: '📡',

    thresholdGauge: 'Schwellenwert-Anzeige',
    minThreshold: 'Min',
    maxThreshold: 'Max',
    safeZone: 'Sicherer Bereich',
    belowMin: 'Unter Min',
    aboveMax: 'Über Max',

    tempHistory: 'Temperaturverlauf',

    alarmHistory: 'Alarmverlauf',
    noAlarms: 'Keine Alarme aufgezeichnet',
    noAlarmsDesc: 'Alle Temperaturen im sicheren Bereich',
    alarmHigh: 'Temperatur hat oberen Schwellenwert überschritten',
    alarmLow: 'Temperatur ist unter den unteren Schwellenwert gefallen',
    peakTemp: 'Spitze',
    duration: 'Dauer',
    started: 'Begonnen',
    ongoing: 'Aktiv',
    resolved: 'Behoben',

    hoursAgo: 'Std. zuvor',
    minutesAgo: 'Min. zuvor',
    justNow: 'Gerade eben',
    durationHours: 'Std.',
    durationMinutes: 'Min.',

    connectionError: 'Verbindung zum Server nicht möglich',
    retry: 'Erneut versuchen',

    loading: 'Dashboard wird geladen...',

    // Next-Level Additions
    diagnosticsTitle: 'Telemetrie & Diagnose',
    mkt: 'Mittlere kinetische Temp. (MKT)',
    uptime: 'Sichere Betriebszeit',
    compressorCycles: 'Kompressor-Zyklen',
    downloadCSV: 'CSV exportieren',
    soundOn: 'Ton: Ein',
    soundOff: 'Ton: Aus',
    predictedTemp: 'Vorhersage (2h)',
    forecastBreach: 'Grenzüberschreitung vorhergesagt',
    forecastBreachDesc: 'Überschreitung erwartet in ca. ',
    active: 'Aktiv',
    inactive: 'Inaktiv',
  },

  ar: {
    appTitle: 'كولدغارد',
    refreshIn: 'التحديث خلال',
    seconds: 'ث',

    currentTemp: 'درجة الحرارة الحالية',
    statusOk: 'طبيعي',
    statusAlarmHigh: 'إنذار مرتفع',
    statusAlarmLow: 'إنذار منخفض',
    statusNoData: 'لا توجد بيانات',
    device: 'الجهاز',
    lastUpdate: 'آخر تحديث',
    staleWarning: 'قد تكون البيانات قديمة — آخر قراءة منذ أكثر من 5 دقائق',
    waitingForData: 'في انتظار أول قراءة...',
    noDataIcon: '📡',

    thresholdGauge: 'مقياس الحدود',
    minThreshold: 'أدنى',
    maxThreshold: 'أقصى',
    safeZone: 'المنطقة الآمنة',
    belowMin: 'تحت الحد الأدنى',
    aboveMax: 'فوق الحد الأقصى',

    tempHistory: 'سجل درجة الحرارة',

    alarmHistory: 'سجل الإنذارات',
    noAlarms: 'لم يتم تسجيل أي إنذارات',
    noAlarmsDesc: 'جميع درجات الحرارة ضمن النطاق الآمن',
    alarmHigh: 'تجاوزت درجة الحرارة الحد الأعلى',
    alarmLow: 'انخفضت درجة الحرارة تحت الحد الأدنى',
    peakTemp: 'الذروة',
    duration: 'المدة',
    started: 'البداية',
    ongoing: 'نشط',
    resolved: 'تم الحل',

    hoursAgo: 'ساعة مضت',
    minutesAgo: 'دقيقة مضت',
    justNow: 'الآن',
    durationHours: 'ساعة',
    durationMinutes: 'دقيقة',

    connectionError: 'تعذر الاتصال بالخادم',
    retry: 'إعادة المحاولة',

    loading: 'جاري تحميل لوحة المعلومات...',

    // Next-Level Additions
    diagnosticsTitle: 'الاتصال والتشخيص',
    mkt: 'متوسط درجة الحرارة الحركية',
    uptime: 'وقت التشغيل الآمن',
    compressorCycles: 'دورات الضاغط',
    downloadCSV: 'تصدير CSV',
    soundOn: 'الصوت: مفعل',
    soundOff: 'الصوت: صامت',
    predictedTemp: 'التنبؤ (ساعتين)',
    forecastBreach: 'توقع تجاوز الحدود',
    forecastBreachDesc: 'التجاوز متوقع خلال تقريباً ',
    active: 'نشط',
    inactive: 'غير نشط',
  },
});

/** RTL languages */
const RTL_LANGUAGES = Object.freeze(['ar']);

/**
 * i18n Module — manages language state, translation lookups, and RTL toggling.
 */
const I18n = (() => {
  const STORAGE_KEY = 'coldguard-lang';
  let currentLang = 'en';

  /**
   * Initialize language from localStorage or browser preference.
   * @returns {string} The active language code.
   */
  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && TRANSLATIONS[saved]) {
      currentLang = saved;
    } else {
      // Auto-detect from browser
      const browserLang = navigator.language?.slice(0, 2);
      if (browserLang && TRANSLATIONS[browserLang]) {
        currentLang = browserLang;
      }
    }
    applyDirection();
    return currentLang;
  }

  /**
   * Set the active language.
   * @param {string} lang - Language code ('en', 'de', 'ar').
   */
  function setLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    applyDirection();
  }

  /**
   * Get the current language code.
   * @returns {string}
   */
  function getLanguage() {
    return currentLang;
  }

  /**
   * Translate a key to the current language.
   * Falls back to English if key is missing.
   * @param {string} key - Translation key.
   * @returns {string}
   */
  function t(key) {
    return TRANSLATIONS[currentLang]?.[key]
      ?? TRANSLATIONS.en?.[key]
      ?? `[${key}]`;
  }

  /**
   * Check if current language is RTL.
   * @returns {boolean}
   */
  function isRTL() {
    return RTL_LANGUAGES.includes(currentLang);
  }

  /**
   * Apply dir attribute to <html> element.
   */
  function applyDirection() {
    document.documentElement.dir = isRTL() ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }

  return Object.freeze({ init, setLanguage, getLanguage, t, isRTL });
})();
