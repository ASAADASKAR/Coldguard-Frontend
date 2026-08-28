/**
 * ColdGuard Dashboard — Main App
 * Design based on ColdGuard_Dashboard_Fixed.html
 * Connected to real Django API
 */

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine, ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from 'recharts';
import { fetchAlarms, fetchCurrent, fetchHistory, fetchLogs } from './api/client';

// ── Icons ──────────────────────────────────────────────
const ICONS = {
  thermometer: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4 4 0 1 0 5 0Z"/></svg>,
  wifi: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>,
  alert: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>,
  shield: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>,
  download: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  settings: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>,
  check: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  refresh: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>,
  logo: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M9 12l2 2 4-4"/></svg>,
};

function Icon({ name, size = 12 }) {
  const icon = ICONS[name];
  if (!icon) return null;
  return <span style={{ display: 'inline-flex', alignItems: 'center', width: size, height: size }}>{icon}</span>;
}

// ── i18n ───────────────────────────────────────────────
const I18N = {
  en: {
    dir: 'ltr',
    nav_customer: 'Restaurant Hamburg', nav_plan: 'Pro plan',
    devices: 'Devices', add_device: 'Add device',
    search_placeholder: 'Search devices…',
    last_update: 'Last update', sec_ago: 's ago', min_ago: 'min ago', h_ago: 'h ago',
    dur_h: 'h', dur_m: 'm',
    auto_refresh: 'Auto refresh 40s',
    download_report: 'Download HACCP report',
    metric_current: 'Current temperature', metric_status: 'Device status',
    metric_alarms: 'Alarms today', metric_haccp: 'Next HACCP report',
    online: 'Online', offline: 'Offline', device_unreachable: 'Device unreachable',
    last_seen: 'Last seen', just_now: 'just now',
    alarm_last: 'Last alarm at', no_alarms_short: 'No alarms',
    days: 'days', day: 'day',
    chart_title: 'Temperature history', chart_sub: 'Sampled every 60 seconds',
    in_range: 'In range (1–8°C)', alarm_range: 'Alarm (>8°C or <1°C)',
    threshold: 'Threshold',
    alarms_title: 'Alarm history', alarms_sub: 'Last 7 days',
    col_time: 'Time', col_device: 'Device', col_temp: 'Temp',
    col_type: 'Type', col_duration: 'Duration', col_status: 'Status',
    type_high: 'High temp', type_low: 'Low temp',
    st_active: 'Active', st_resolved: 'Resolved', ongoing: 'Ongoing',
    info_title: 'Device info',
    f_id: 'Device ID', f_location: 'Location', f_plan: 'Plan',
    f_min: 'Min threshold', f_max: 'Max threshold',
    f_firmware: 'Firmware', f_install: 'Installed',
    no_alarms_title: 'No alarms recorded',
    no_alarms_sub: 'All systems operating within safe range',
    logs_title: 'Device Logs', no_logs: 'No errors recorded',
    quick: 'Quick actions', ack_all: 'Acknowledge all',
    export_csv: 'Export CSV', settings: 'Settings',
    ongoing: 'Ongoing',
  },
  de: {
    dir: 'ltr',
    nav_customer: 'Restaurant Hamburg', nav_plan: 'Pro-Tarif',
    devices: 'Geräte', add_device: 'Gerät hinzufügen',
    search_placeholder: 'Geräte suchen…',
    last_update: 'Letzte Aktualisierung', sec_ago: 'Sek.', min_ago: 'Min.', h_ago: 'Std.',
    dur_h: 'Std.', dur_m: 'Min.',
    auto_refresh: 'Auto-Aktualisierung 40s',
    download_report: 'HACCP-Bericht herunterladen',
    metric_current: 'Aktuelle Temperatur', metric_status: 'Gerätestatus',
    metric_alarms: 'Alarme heute', metric_haccp: 'Nächster HACCP-Bericht',
    online: 'Online', offline: 'Offline', device_unreachable: 'Gerät nicht erreichbar',
    last_seen: 'Zuletzt gesehen', just_now: 'gerade eben',
    alarm_last: 'Letzter Alarm', no_alarms_short: 'Keine Alarme',
    days: 'Tage', day: 'Tag',
    chart_title: 'Temperaturverlauf', chart_sub: 'Erfassung alle 60 Sekunden',
    in_range: 'Im Bereich (1–8°C)', alarm_range: 'Alarm (>8°C oder <1°C)',
    threshold: 'Schwellenwert',
    alarms_title: 'Alarmverlauf', alarms_sub: 'Letzte 7 Tage',
    col_time: 'Zeit', col_device: 'Gerät', col_temp: 'Temp',
    col_type: 'Typ', col_duration: 'Dauer', col_status: 'Status',
    type_high: 'Übertemp.', type_low: 'Untertemp.',
    st_active: 'Aktiv', st_resolved: 'Behoben',
    info_title: 'Geräteinfo',
    f_id: 'Geräte-ID', f_location: 'Standort', f_plan: 'Tarif',
    f_min: 'Min. Schwelle', f_max: 'Max. Schwelle',
    f_firmware: 'Firmware', f_install: 'Installiert',
    no_alarms_title: 'Keine Alarme aufgezeichnet',
    no_alarms_sub: 'Alle Systeme im sicheren Bereich',
    logs_title: 'Geräte Logs', no_logs: 'Keine Fehler aufgezeichnet',
    quick: 'Schnellaktionen', ack_all: 'Alle bestätigen',
    export_csv: 'CSV exportieren', settings: 'Einstellungen',
    ongoing: 'Laufend',
  },
  ar: {
    dir: 'rtl',
    nav_customer: 'مطعم هامبورغ', nav_plan: 'خطة برو',
    devices: 'الأجهزة', add_device: 'إضافة جهاز',
    search_placeholder: 'ابحث عن جهاز…',
    last_update: 'آخر تحديث', sec_ago: 'ث', min_ago: 'د', h_ago: 'س',
    dur_h: 'س', dur_m: 'د',
    auto_refresh: 'تحديث تلقائي ٤٠ث',
    download_report: 'تنزيل تقرير HACCP',
    metric_current: 'درجة الحرارة الحالية', metric_status: 'حالة الجهاز',
    metric_alarms: 'إنذارات اليوم', metric_haccp: 'تقرير HACCP القادم',
    online: 'متصل', offline: 'غير متصل', device_unreachable: 'الجهاز غير متاح',
    last_seen: 'آخر اتصال', just_now: 'الآن',
    alarm_last: 'آخر إنذار', no_alarms_short: 'لا إنذارات',
    days: 'أيام', day: 'يوم',
    chart_title: 'سجل درجة الحرارة', chart_sub: 'قياس كل ٦٠ ثانية',
    in_range: 'ضمن النطاق (١–٨°)', alarm_range: 'إنذار (>٨° أو <١°)',
    threshold: 'الحد',
    alarms_title: 'سجل الإنذارات', alarms_sub: 'آخر ٧ أيام',
    col_time: 'الوقت', col_device: 'الجهاز', col_temp: 'الحرارة',
    col_type: 'النوع', col_duration: 'المدة', col_status: 'الحالة',
    type_high: 'حرارة عالية', type_low: 'حرارة منخفضة',
    st_active: 'نشط', st_resolved: 'تم الحل',
    info_title: 'معلومات الجهاز',
    f_id: 'معرّف الجهاز', f_location: 'الموقع', f_plan: 'الخطة',
    f_min: 'الحد الأدنى', f_max: 'الحد الأقصى',
    f_firmware: 'البرنامج الثابت', f_install: 'تم التركيب',
    no_alarms_title: 'لا توجد إنذارات',
    no_alarms_sub: 'جميع الأنظمة تعمل ضمن النطاق الآمن',
    logs_title: 'سجلات الجهاز', no_logs: 'لا توجد أخطاء',
    quick: 'إجراءات سريعة', ack_all: 'تأكيد الكل',
    export_csv: 'تصدير CSV', settings: 'الإعدادات',
    ongoing: 'جارٍ',
  },
};

// ── Helpers ────────────────────────────────────────────
function relativeTime(ts, t) {
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60) return t.just_now;
  if (diff < 3600) return `${Math.floor(diff / 60)} ${t.min_ago}`;
  return `${Math.floor(diff / 3600)} ${t.h_ago}`;
}

function formatDuration(start, end, t) {
  const s = (new Date(end) - new Date(start)) / 1000;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}${t.dur_h} ${m}${t.dur_m}` : `${m}${t.dur_m}`;
}

function formatDateTime(ts, lang) {
  return new Date(ts).toLocaleString(
    lang === 'ar' ? 'ar-SA' : lang === 'de' ? 'de-DE' : 'en-GB',
    { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );
}

function calcUptime(readings) {
  if (!readings?.length) return null;
  const safe = readings.filter(r => r.temperature >= 1 && r.temperature <= 8).length;
  return ((safe / readings.length) * 100).toFixed(1);
}

function calcMKT(readings) {
  if (!readings?.length) return null;
  const temps = readings.map(r => r.temperature);
  const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
  return avg.toFixed(1);
}

// ── MetricCard ─────────────────────────────────────────
/**
 * Single metric card component.
 * @param {Object} props
 * @param {string} props.kind - 'ok' | 'alarm' | 'warn' | ''
 * @param {string} props.icon - Icon name
 * @param {string} props.label - Card label
 * @param {string|number} props.value - Main value
 * @param {string} props.unit - Unit text
 * @param {string} props.foot - Footer text
 * @param {React.ReactNode} props.badge - Badge element
 */
function MetricCard({ kind = '', icon, label, value, unit, foot, badge, dim = false }) {
  return (
    <div className={`card metric ${kind}${dim ? ' dim' : ''}`}>
      <div className="deco" />
      <div className="metric-label">
        {icon && <Icon name={icon} size={12} />}
        {label}
      </div>
      <div className="metric-value">
        {value ?? '—'}
        {unit && <span className="unit">{unit}</span>}
      </div>
      <div className="metric-foot">
        {badge && <>{badge}</>}
        {foot && <span>{foot}</span>}
      </div>
    </div>
  );
}

// ── SimpleChart ─────────────────────────────────────────
/**
 * Simple SVG temperature chart.
 * @param {Object} props
 * @param {Array} props.readings - Temperature readings
 */

function SimpleChart({ readings }) {
  if (!readings?.length) {
    return (
      <div style={{ height: 280, display: 'grid', placeItems: 'center', color: 'var(--fg-3)' }}>
        No data
      </div>
    );
  }

  // Max 80 Balken
  const sample = readings.length > 80
    ? readings.filter((_, i) => i % Math.floor(readings.length / 80) === 0)
    : readings;

  const data = sample.map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: r.temperature,
    alarm: r.temperature > 8 || r.temperature < 1,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barCategoryGap="20%">
        <CartesianGrid stroke="rgba(35,44,41,0.8)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="time" tick={{ fill: '#7f8a85', fontSize: 11 }}
          axisLine={{ stroke: '#232c29' }} tickLine={false} interval="preserveStartEnd" minTickGap={40} />
        <YAxis tick={{ fill: '#7f8a85', fontSize: 11 }}
          axisLine={{ stroke: '#232c29' }} tickLine={false}
          tickFormatter={v => `${v}°`} domain={[-2, 12]} width={36} />
        <Tooltip
          contentStyle={{ background: '#161d1b', border: '1px solid #232c29', borderRadius: 8, fontSize: 12 }}
          formatter={(v) => [`${v.toFixed(1)}°C`, 'Temperature']}
          labelStyle={{ color: '#7f8a85' }}
        />
        <ReferenceLine y={8} stroke="rgba(226,75,74,0.6)" strokeDasharray="4,4"
          label={{ value: 'max 8°C', fill: '#E24B4A', fontSize: 10, position: 'right' }} />
        <ReferenceLine y={1} stroke="rgba(55,138,221,0.4)" strokeDasharray="4,4"
          label={{ value: 'min 1°C', fill: '#378ADD', fontSize: 10, position: 'right' }} />
        <Bar dataKey="temp" radius={[2, 2, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.alarm ? '#E24B4A' : '#1D9E75'} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── App ─────────────────────────────────────────────────
const HOURS_MAP = { '24h': 24, '7d': 168, '30d': 720 };
const DEVICE_KEY = 'coldguard-device-003';

function App() {
  const [lang, setLang]     = useState('en');
  const [range, setRange]   = useState('24h');
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [alarms,  setAlarms]  = useState([]);
  const [logs,      setLogs]      = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(40);

  const t = I18N[lang] || I18N.en;

  // Apply RTL
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir  = t.dir;
  }, [lang, t.dir]);

  // Fetch data
const refresh = async () => {
  try {
    setError(null);
    const [cur, hist, alrm, lgz, adminLgz] = await Promise.all([
      fetchCurrent(),
      fetchHistory(HOURS_MAP[range]),
      fetchAlarms(),
      fetchLogs(lang),
      fetchLogs('admin'),
    ]);
    setCurrent(cur);
    setHistory(hist);

    const combined = [
      ...(alrm || []).map(a => ({ ...a, _type: 'alarm' })),
      ...(lgz  || []).map(l => ({
        _type: 'log',
        started_at: l.timestamp,
        timestamp: l.timestamp,
        resolved_at: l.resolved_at ?? null,
        status: 'DEVICE_ERROR',
        message: l.friendly_message || l.message,
        level: l.level,
      })),
    ].sort((a, b) => {
      const aActive = !a.resolved_at;
      const bActive = !b.resolved_at;
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      const aTime = new Date(a.started_at || a.timestamp);
      const bTime = new Date(b.started_at || b.timestamp);
      return bTime - aTime;
    });

    setAlarms(combined);
    setLogs(lgz);
    setAdminLogs(adminLgz);
    setCountdown(40);
  } catch (err) {
    setError('Unable to connect to server');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { refresh(); }, [range, lang]);

  // Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { refresh(); return 40; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [range, lang]);

  // Derived values
  const temp     = current?.temperature ?? null;
  const status   = current?.status ?? 'NO_DATA';
  const isStale   = current && (Date.now() - new Date(current.timestamp)) > 5 * 60 * 1000;
  const isOffline = status === 'HEARTBEAT_FAILURE' || isStale;
  const isAlarm   = status === 'ALARM_HIGH' || status === 'ALARM_LOW' || isOffline;
  const isOnline  = !isOffline && !!current;
  const uptime   = calcUptime(history);
  const mkt      = calcMKT(history);
  const alarmsToday = alarms?.filter(a =>
    new Date(a.started_at).toDateString() === new Date().toDateString()
  ).length ?? 0;

  // Export CSV
  const exportCSV = () => {
    if (!history?.length) return;
    const csv = "Timestamp,Temperature,Unit,Status\n" +
      history.map(r => `${r.timestamp},${r.temperature},${r.unit},${r.status}`).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `coldguard-${new Date().toISOString().slice(0, 10)}.csv`,
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-0)',
      display: 'grid', placeItems: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%',
        border: '2px solid var(--line-2)', borderTopColor: 'var(--green)',
        animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div className="app">

      {/* Error Banner */}
      {error && (
        <div style={{
          position: 'fixed', top: 64, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--red-soft)', border: '1px solid var(--red-line)',
          borderRadius: 'var(--radius)', color: 'var(--red)',
          padding: '10px 16px', fontSize: 13, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 10, zIndex: 100,
        }}>
          {error}
          <button onClick={refresh} style={{
            background: 'var(--red)', color: 'white', border: 0,
            padding: '4px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 12,
          }}>Retry</button>
        </div>
      )}

      {/* ── Topbar ── */}
      <header className="topbar">
        <div className="topbar-logo">
          <div className="logo-mark"><Icon name="logo" size={14} /></div>
          ColdGuard
        </div>

        <div className="topbar-customer">
          <Icon name="shield" size={12} />
          <strong>{t.nav_customer}</strong>
          <span className="sep" />
          <span className="badge ok" style={{ fontSize: 10 }}>{t.nav_plan}</span>
        </div>

        <div className="topbar-spacer" />

        <div className="topbar-actions">
          <div className="refresh-indicator">
            <span className="pulse" />
            {countdown}s
          </div>
          <button className="icon-btn" onClick={refresh}><Icon name="refresh" size={15} /></button>
          <div className="lang-toggle">
            {['de', 'en', 'ar'].map(l => (
              <button key={l} className={lang === l ? 'active' : ''} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="avatar">AA</div>
        </div>
      </header>

      <div className="body">

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-head">
            <span className="sidebar-head-title">{t.devices}</span>
          </div>
          <div className="sidebar-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input placeholder={t.search_placeholder} />
          </div>
          <div className="device-list">
            <div className="device-row active">
              <span className={`status-dot ${isAlarm ? 'red' : ''}`} />
              <div>
                <div className="device-name">{current?.device || 'Main Fridge'}</div>
                <div className="device-loc">{isOnline ? t.online : t.offline}</div>
              </div>
              <div className={`device-temp ${isAlarm ? 'alarm' : ''}`}>
                {temp !== null ? `${temp.toFixed(1)}°C` : '—'}
              </div>
            </div>
          </div>
          <div className="sidebar-footer">
            <button className="btn-secondary">+ {t.add_device}</button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main">

          {/* Page head */}
          <div className="page-head">
            <div>
              <h1 className="page-title">{current?.device || '—'}</h1>
              <div className="page-sub row-flex">
                <span className={`badge ${isOnline ? 'ok' : ''}`}>
                  <span className="dot" />
                  {isOnline ? t.online : t.offline}
                </span>
                <span className="sep" />
                <span>{t.last_update}: {current?.timestamp ? relativeTime(current.timestamp, t) : '—'}</span>
                <span className="sep" />
                <span className="muted">{DEVICE_KEY}</span>
              </div>
            </div>
            <div className="page-actions">
              <button className="btn-secondary" onClick={exportCSV}>
                <Icon name="download" size={12} /> {t.export_csv}
              </button>
              <button className="btn-primary">
                <Icon name="download" size={12} /> {t.download_report}
              </button>
            </div>
          </div>

          {/* ── 4 Metric Cards ── */}
          <div className="metric-grid">
            <MetricCard
              kind={isAlarm && !isOffline ? 'alarm' : isOffline ? '' : 'ok'}
              icon="thermometer"
              label={t.metric_current}
              value={temp !== null ? temp.toFixed(1) : '—'}
              unit="°C"
              foot={uptime ? `Ø Uptime: ${uptime}%` : '—'}
              dim={isOffline}
              badge={<span className={`badge ${isAlarm && !isOffline ? 'alarm' : isOffline ? 'grey' : 'ok'}`}>
                <span className="dot" />
                {isOffline ? '—' : isAlarm ? (status === 'ALARM_HIGH' ? t.type_high : t.type_low) : 'OK'}
              </span>}
            />

            <MetricCard
              kind={isOffline ? 'alarm' : isOnline ? 'ok' : 'alarm'}
              icon="wifi"
              label={t.metric_status}
              value={isOffline ? t.device_unreachable : isOnline ? t.online : t.offline}
              foot={current?.timestamp ? `${t.last_seen}: ${relativeTime(current.timestamp, t)}` : '—'}
              badge={<span className={`badge ${isOffline ? 'alarm' : isOnline ? 'ok live' : 'alarm'}`}>
                <span className="dot" /> {isOnline ? 'LIVE' : t.offline}
              </span>}
            />

            <MetricCard
              kind={alarmsToday > 0 ? 'warn' : 'ok'}
              icon="alert"
              label={t.metric_alarms}
              value={alarmsToday}
              foot={alarmsToday > 0 ? t.alarm_last : t.no_alarms_short}
              dim={isOffline}
              badge={<span className={`badge ${alarmsToday > 0 ? 'warn' : 'ok'}`}>
                <span className="dot" /> {alarmsToday > 0 ? 'ALARM' : 'OK'}
              </span>}
            />

            <MetricCard
              icon="shield"
              label={t.metric_haccp}
              value={uptime ?? '—'}
              unit="%"
              foot={`${t.in_range.split(' ')[0]} uptime`}
              dim={isOffline}
              badge={<span className="badge"><Icon name="shield" size={10} /> HACCP</span>}
            />
          </div>

          {/* ── Chart + Device Info ── */}
          <div className="section-grid">

            {/* Chart */}
            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">
                    <span className="ticker" />
                    {t.chart_title}
                  </div>
                  <div className="panel-sub">{t.chart_sub}</div>
                </div>
                <div className="panel-actions">
                  <div className="seg">
                    {['24h', '7d', '30d'].map(r => (
                      <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-swatch" style={{ background: '#1D9E75' }} /> {t.in_range}
                </span>
                <span className="legend-item">
                  <span className="legend-swatch" style={{ background: '#E24B4A' }} /> {t.alarm_range}
                </span>
                <span className="legend-item">
                  <span className="legend-line" style={{ borderColor: 'rgba(226,75,74,0.6)' }} /> {t.threshold}
                </span>
                {history.length > 0 && (
                  <span className="stats mono">
                    <span>min <b>{Math.min(...history.map(r => r.temperature)).toFixed(1)}</b>°</span>
                    <span>max <b>{Math.max(...history.map(r => r.temperature)).toFixed(1)}</b>°</span>
                    <span>avg <b>{(history.reduce((a, r) => a + r.temperature, 0) / history.length).toFixed(1)}</b>°</span>
                  </span>
                )}
              </div>
              <div className="panel-body" style={{ paddingTop: 8 }}>
                <div className="chart-wrap">
                  <SimpleChart readings={history} />
                </div>
              </div>
            </div>

            {/* Device Info */}
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">{t.info_title}</div>
                <span className="badge ok">Pro</span>
              </div>
              <div className="panel-body" style={{ paddingTop: 8 }}>
                <div className="info-row"><span className="k">{t.f_id}</span><span className="v">{DEVICE_KEY}</span></div>
                <div className="info-row"><span className="k">{t.f_location}</span><span className="v" style={{ fontFamily: 'inherit', fontSize: 13, color: 'var(--fg-0)' }}>{current?.device || '—'}</span></div>
                <div className="info-row"><span className="k">{t.f_min} / {t.f_max}</span><span className="v">1° / 8°C</span></div>
                <div className="info-row"><span className="k">{t.f_firmware}</span><span className="v">v2.0.0</span></div>
                <div style={{ marginTop: 14 }}>
                  <div className="threshold-bar">
                    <div className="threshold-fill" style={lang === 'ar' ? { right: '21%', left: '33%' } : { left: '21%', right: '33%' }} />
                  </div>
                  <div className="threshold-labels">
                    <span>−2°</span>
                    <span style={{ color: 'var(--green)' }}>1°–8° {lang === 'de' ? 'Sicher' : lang === 'ar' ? 'آمن' : 'Safe'}</span>
                    <span>12°</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button className="btn-secondary"><Icon name="settings" size={12} /> {t.settings}</button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Alarm History ── */}
          <div className="panel" style={{ marginBottom: 12 }}>
            <div className="panel-head">
              <div>
                <div className="panel-title">{t.alarms_title}</div>
                <div className="panel-sub">{t.alarms_sub}</div>
              </div>
              <div className="panel-actions">
                <button className="btn-secondary" style={{ height: 30, padding: '0 10px' }}>
                  <Icon name="check" size={12} /> {t.ack_all}
                </button>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="alarms">
                <thead>
                  <tr>
                    <th>{t.col_time}</th>
                    <th>{t.col_device}</th>
                    <th>{t.col_type}</th>
                    <th>{t.col_duration}</th>
                    <th>{t.col_status}</th>
                  </tr>
                </thead>
                <tbody>
                  {alarms.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty">
                          <div className="glyph"><Icon name="shield" size={20} /></div>
                          <strong>{t.no_alarms_title}</strong>
                          <span>{t.no_alarms_sub}</span>
                        </div>
                      </td>
                    </tr>
                  ) : alarms.map((a, i) => {

                    // ── Device Error Row ──
                    if (a._type === 'log') {
                      return (
                        <tr key={i}>
                          <td className="mono">{formatDateTime(a.started_at, lang)}</td>
                          <td>
                            <div className="row-flex">
                              <span className="status-dot grey" />
                              <span>{current?.device || '—'}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge warn">
                              <Icon name="alert" size={10} />
                              {a.message}
                            </span>
                          </td>
                          <td className="mono">{
                            !a.resolved_at
                              ? t.ongoing
                              : a.resolved_at === a.timestamp || (new Date(a.resolved_at) - new Date(a.timestamp)) < 60000
                              ? '—'
                              : formatDuration(a.timestamp, a.resolved_at, t)
                          }</td>
                          <td>
                            <span className="badge grey">
                              <span className="dot" /> {t.st_resolved}
                            </span>
                          </td>
                        </tr>
                      );
                    }

                    // ── Normal Alarm Row ──
                    const isHigh = a.status === 'ALARM_HIGH';
                    const dur    = a.resolved_at ? formatDuration(a.started_at, a.resolved_at, t) : t.ongoing;
                    const active = !a.resolved_at;

                    return (
                      <tr key={i} style={active ? { background: 'rgba(226,75,74,0.04)' } : undefined}>
                        <td className="mono">{formatDateTime(a.started_at, lang)}</td>
                        <td>
                          <div className="row-flex">
                            <span className={`status-dot ${active ? 'red' : ''}`} />
                            <span>{current?.device || '—'}</span>
                            <span className="muted mono" style={{ fontSize: 11 }}>{DEVICE_KEY}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge alarm">
                            <Icon name="alert" size={10} />
                            {isHigh ? t.type_high : t.type_low}
                          </span>
                        </td>
                        <td className="mono">{dur}</td>
                        <td>
                          <span className={`badge ${active ? 'alarm live' : 'ok'}`}>
                            <span className="dot" /> {active ? t.st_active : t.st_resolved}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Device Logs ── */}
          <div className="panel">
            <div className="panel-head">
              <div className="panel-title">
                <Icon name="alert" size={12} />
                {t.logs_title}
              </div>
            </div>
            {adminLogs.length === 0 ? (
              <div className="empty">
                <div className="glyph">✅</div>
                <strong>{t.no_logs}</strong>
              </div>
            ) : (
              <div>
                {adminLogs.slice(0, 10).map((log, i) => {
                  const colors = {
                    ERROR: { bg: 'var(--red-soft)',   color: 'var(--red)',   border: 'var(--red-line)'   },
                    WARN:  { bg: 'var(--amber-soft)', color: 'var(--amber)', border: 'var(--amber-line)' },
                    INFO:  { bg: 'var(--green-soft)', color: 'var(--green)', border: 'var(--green-line)' },
                  };
                  const c = colors[log.level] || colors.INFO;
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 18px',
                      borderBottom: i < adminLogs.length - 1 ? '1px solid var(--line)' : 'none',
                    }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                        padding: '2px 7px', borderRadius: 100, flexShrink: 0, marginTop: 2,
                        background: c.bg, color: c.color, border: `1px solid ${c.border}`,
                      }}>
                        {log.level}
                      </span>
                      <div>
                        <div style={{ fontSize: 13, color: 'var(--fg-0)', marginBottom: 3 }}>
                          {log.friendly_message || log.message}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--fg-2)' }}>
                          {relativeTime(log.timestamp, t)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%{box-shadow:0 0 0 0 rgba(29,158,117,0.6)}70%{box-shadow:0 0 0 8px rgba(29,158,117,0)}100%{box-shadow:0 0 0 0 rgba(29,158,117,0)} }
        .topbar-logo{display:flex;align-items:center;gap:10px;font-weight:600;font-size:15px;letter-spacing:-0.01em}
        body[dir="rtl"] .topbar-logo{flex-direction:row-reverse}
        .logo-mark{width:26px;height:26px;display:grid;place-items:center;border-radius:7px;background:linear-gradient(160deg,#1D9E75 0%,#167a5a 100%);box-shadow:0 0 0 1px rgba(29,158,117,0.35),0 4px 12px -4px rgba(29,158,117,0.5)}
        .topbar-customer{display:flex;align-items:center;gap:10px;padding:0 12px;height:32px;border-radius:var(--radius-sm);background:var(--bg-2);border:1px solid var(--line);font-size:13px;color:var(--fg-1)}
        body[dir="rtl"] .topbar-customer{flex-direction:row-reverse}
        .topbar-customer strong{color:var(--fg-0);font-weight:500}
        .topbar-spacer{flex:1}
        .topbar-actions{display:flex;align-items:center;gap:8px}
        body[dir="rtl"] .topbar-actions{flex-direction:row-reverse}
        .refresh-indicator{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--fg-2);padding:6px 10px;border-radius:100px;background:var(--bg-2);border:1px solid var(--line)}
        body[dir="rtl"] .refresh-indicator{flex-direction:row-reverse}
        .pulse{width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s infinite}
        .icon-btn{width:32px;height:32px;display:grid;place-items:center;background:var(--bg-2);border:1px solid var(--line);border-radius:var(--radius-sm);color:var(--fg-1);cursor:pointer}
        .icon-btn:hover{color:var(--fg-0);background:var(--bg-3)}
        .avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#2e3a36,#1a2220);display:grid;place-items:center;color:var(--fg-0);font-size:12px;font-weight:600;border:1px solid var(--line-2)}
        .lang-toggle{display:flex;background:var(--bg-2);border:1px solid var(--line);border-radius:var(--radius-sm);padding:2px;gap:2px}
        body[dir="rtl"] .lang-toggle{flex-direction:row-reverse}
        .lang-toggle button{background:transparent;border:0;color:var(--fg-2);font:inherit;font-size:12px;font-weight:500;padding:4px 10px;border-radius:4px;cursor:pointer;letter-spacing:0.04em}
        .lang-toggle button.active{background:var(--bg-3);color:var(--fg-0)}
        .sidebar{background:var(--bg-1);border-right:1px solid var(--line);display:flex;flex-direction:column;min-height:0}
        body[dir="rtl"] .sidebar{border-right:0;border-left:1px solid var(--line)}
        .sidebar-head{padding:16px 16px 12px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between}
        body[dir="rtl"] .sidebar-head{flex-direction:row-reverse}
        .sidebar-head-title{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--fg-2)}
        .sidebar-search{margin:12px 12px 4px;position:relative}
        .sidebar-search input{width:100%;height:32px;background:var(--bg-2);border:1px solid var(--line);border-radius:var(--radius-sm);color:var(--fg-0);padding:0 10px 0 32px;font:inherit;font-size:13px;outline:none}
        body[dir="rtl"] .sidebar-search input{padding:0 32px 0 10px}
        .sidebar-search input::placeholder{color:var(--fg-3)}
        .sidebar-search svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--fg-3);pointer-events:none}
        body[dir="rtl"] .sidebar-search svg{left:auto;right:10px}
        .device-list{padding:4px 8px 16px;flex:1;overflow-y:auto}
        .device-row{display:grid;grid-template-columns:10px 1fr auto;gap:10px;align-items:center;padding:10px;border-radius:var(--radius-sm);cursor:pointer;position:relative}
        body[dir="rtl"] .device-row{direction:rtl}
        .device-row:hover{background:var(--bg-2)}
        .device-row.active{background:var(--bg-2)}
        .device-row.active::before{content:"";position:absolute;left:0;top:8px;bottom:8px;width:2px;background:var(--green);border-radius:0 2px 2px 0}
        body[dir="rtl"] .device-row.active::before{left:auto;right:0;border-radius:2px 0 0 2px}
        .status-dot{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 0 3px var(--green-soft);flex-shrink:0}
        .status-dot.red{background:var(--red);box-shadow:0 0 0 3px var(--red-soft)}
        .status-dot.grey{background:var(--fg-3);box-shadow:none}
        .device-name{font-size:13px;font-weight:500;color:var(--fg-0)}
        .device-loc{font-size:11.5px;color:var(--fg-2);margin-top:2px}
        .device-temp{font-family:"IBM Plex Mono",monospace;font-size:12.5px;font-weight:500;color:var(--fg-1)}
        .device-temp.alarm{color:var(--red)}
        .sidebar-footer{padding:12px;border-top:1px solid var(--line);display:flex;gap:8px}
        body[dir="rtl"] .sidebar-footer{flex-direction:row-reverse}
        .btn-secondary{flex:1;height:32px;background:var(--bg-2);border:1px solid var(--line);border-radius:var(--radius-sm);color:var(--fg-1);cursor:pointer;font:inherit;font-size:12.5px;font-weight:500;display:inline-flex;align-items:center;justify-content:center;gap:6px}
        .btn-secondary:hover{background:var(--bg-3);color:var(--fg-0)}
        .page-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px}
        body[dir="rtl"] .page-head{flex-direction:row-reverse}
        .page-title{font-size:20px;font-weight:600;letter-spacing:-0.01em;margin:0 0 4px}
        body[dir="rtl"] .page-title{text-align:right}
        .page-sub{font-size:13px;color:var(--fg-2);display:flex;align-items:center;gap:10px}
        body[dir="rtl"] .page-sub{flex-direction:row-reverse}
        .page-actions{display:flex;gap:8px;align-items:center}
        body[dir="rtl"] .page-actions{flex-direction:row-reverse}
        .btn-primary{height:34px;padding:0 14px;border-radius:var(--radius-sm);background:var(--green);border:1px solid rgba(255,255,255,0.06);color:white;font:inherit;font-size:13px;font-weight:500;display:inline-flex;align-items:center;gap:6px;cursor:pointer;box-shadow:0 1px 0 rgba(255,255,255,0.12) inset,0 0 0 1px rgba(29,158,117,0.4)}
        .btn-primary:hover{background:#228d6b}
        body[dir="rtl"] .btn-primary{flex-direction:row-reverse}
        .card{background:var(--bg-1);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow)}
        .metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
        .metric{padding:16px 18px 18px;position:relative;overflow:hidden}
        .metric-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--fg-2);display:flex;align-items:center;gap:6px}
        body[dir="rtl"] .metric-label{flex-direction:row-reverse}
        .metric-value{font-family:"IBM Plex Mono",monospace;font-size:30px;font-weight:500;letter-spacing:-0.02em;color:var(--fg-0);margin-top:12px;display:flex;align-items:baseline;gap:4px}
        body[dir="rtl"] .metric-value{flex-direction:row-reverse}
        .unit{font-size:16px;color:var(--fg-2);font-weight:400}
        .metric-foot{margin-top:10px;font-size:12px;color:var(--fg-2);display:flex;align-items:center;gap:6px}
        body[dir="rtl"] .metric-foot{flex-direction:row-reverse}
        .metric.ok .metric-value{color:var(--green)}
        .metric.alarm .metric-value{color:var(--red)}
        .metric.warn .metric-value{color:var(--amber)}
        .metric.dim{opacity:0.38;filter:grayscale(0.6);pointer-events:none}
        .deco{position:absolute;right:-12px;top:-12px;width:84px;height:84px;border-radius:50%;opacity:0.5;background:radial-gradient(circle at 30% 30%,var(--green-soft),transparent 70%);pointer-events:none}
        body[dir="rtl"] .deco{right:auto;left:-12px}
        .metric.alarm .deco{background:radial-gradient(circle at 30% 30%,var(--red-soft),transparent 70%)}
        .metric.warn .deco{background:radial-gradient(circle at 30% 30%,var(--amber-soft),transparent 70%)}
        .badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;padding:3px 8px;border-radius:100px;background:var(--bg-3);color:var(--fg-1);border:1px solid var(--line-2)}
        body[dir="rtl"] .badge{flex-direction:row-reverse}
        .badge.ok{background:var(--green-soft);color:var(--green);border-color:var(--green-line)}
        .badge.alarm{background:var(--red-soft);color:var(--red);border-color:var(--red-line)}
        .badge.warn{background:var(--amber-soft);color:var(--amber);border-color:var(--amber-line)}
        .badge.grey{background:var(--bg-3);color:var(--fg-2);border-color:var(--line-2)}
        .dot{width:6px;height:6px;border-radius:50%;background:currentColor;display:inline-block}
        .badge.live .dot{animation:pulse 2s infinite}
        .section-grid{display:grid;grid-template-columns:1fr 340px;gap:12px;margin-bottom:12px}
        .panel{background:var(--bg-1);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);overflow:hidden}
        .panel-head{padding:14px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid var(--line)}
        body[dir="rtl"] .panel-head{flex-direction:row-reverse}
        .panel-title{font-size:13px;font-weight:600;color:var(--fg-0);display:flex;align-items:center;gap:8px}
        body[dir="rtl"] .panel-title{flex-direction:row-reverse}
        .panel-sub{font-size:12px;color:var(--fg-2)}
        .panel-body{padding:16px 18px 18px}
        .panel-actions{display:flex;gap:6px;align-items:center}
        body[dir="rtl"] .panel-actions{flex-direction:row-reverse}
        .seg{display:inline-flex;background:var(--bg-2);border:1px solid var(--line);border-radius:var(--radius-sm);padding:2px}
        body[dir="rtl"] .seg{flex-direction:row-reverse}
        .seg button{background:transparent;border:0;color:var(--fg-2);font:inherit;font-size:12px;font-weight:500;padding:4px 10px;border-radius:4px;cursor:pointer}
        .seg button.active{background:var(--bg-3);color:var(--fg-0)}
        .chart-legend{display:flex;gap:16px;padding:14px 18px 0;font-size:12px;color:var(--fg-2);align-items:center;flex-wrap:wrap}
        body[dir="rtl"] .chart-legend{flex-direction:row-reverse}
        .chart-legend .stats{margin-inline-start:auto;display:flex;gap:14px}
        body[dir="rtl"] .chart-legend .stats{margin-inline-start:auto;margin-inline-end:0;flex-direction:row-reverse}
        .chart-legend .stats b{color:var(--fg-0);font-family:"IBM Plex Mono",monospace;font-weight:500}
        .legend-item{display:inline-flex;align-items:center;gap:6px}
        body[dir="rtl"] .legend-item{flex-direction:row-reverse}
        .legend-swatch{width:10px;height:10px;border-radius:2px;flex-shrink:0}
        .legend-line{width:14px;height:0;border-top:1px dashed;flex-shrink:0}
        .chart-wrap{position:relative;height:280px}
        .info-row{display:grid;grid-template-columns:1fr auto;gap:10px;padding:10px 0;font-size:13px;border-bottom:1px solid var(--line)}
        .info-row:last-child{border-bottom:0}
        body[dir="rtl"] .info-row{direction:rtl}
        .info-row .k{color:var(--fg-2)}
        .info-row .v{color:var(--fg-0);font-family:"IBM Plex Mono",monospace;font-size:12.5px}
        body[dir="rtl"] .info-row .v{text-align:left}
        .threshold-bar{margin-top:8px;background:var(--bg-3);border:1px solid var(--line);border-radius:100px;height:8px;position:relative;overflow:hidden}
        .threshold-fill{position:absolute;top:0;bottom:0;background:linear-gradient(90deg,var(--green) 0%,var(--green) 100%);border-radius:100px}
        .threshold-labels{margin-top:6px;display:flex;justify-content:space-between;font-size:11px;color:var(--fg-2);font-family:"IBM Plex Mono",monospace}
        body[dir="rtl"] .threshold-labels{flex-direction:row-reverse}
        table.alarms{width:100%;border-collapse:collapse;font-size:13px}
        table.alarms thead th{text-align:left;font-weight:500;color:var(--fg-2);font-size:11px;text-transform:uppercase;letter-spacing:0.06em;padding:8px 18px;border-bottom:1px solid var(--line);background:var(--bg-1);position:sticky;top:0}
        body[dir="rtl"] table.alarms thead th{text-align:right}
        body[dir="rtl"] table.alarms tbody td{text-align:right}
        table.alarms tbody td{padding:12px 18px;border-bottom:1px solid var(--line);color:var(--fg-1);vertical-align:middle}
        table.alarms tbody tr:last-child td{border-bottom:0}
        table.alarms tbody tr:hover{background:var(--bg-2)}
        td.mono{font-family:"IBM Plex Mono",monospace;color:var(--fg-0)}
        td.alarm-temp{color:var(--red);font-family:"IBM Plex Mono",monospace;font-weight:500}
        .empty{display:grid;place-items:center;padding:48px 24px;color:var(--fg-2);text-align:center;gap:8px}
        .empty .glyph{width:44px;height:44px;border-radius:50%;background:var(--bg-2);border:1px solid var(--line);display:grid;place-items:center;color:var(--green);margin-bottom:6px;font-size:18px}
        .ticker{height:6px;width:6px;border-radius:50%;background:var(--green);display:inline-block;vertical-align:middle;animation:pulse 2s infinite}
        .row-flex{display:flex;align-items:center;gap:10px}
        body[dir="rtl"] .row-flex{flex-direction:row-reverse}
        .muted{color:var(--fg-2)}
        .mono{font-family:"IBM Plex Mono",monospace;font-variant-numeric:tabular-nums}
        .sep{width:1px;height:12px;background:var(--line-2);display:inline-block}
        ::-webkit-scrollbar{width:10px;height:10px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#232c29;border-radius:100px;border:2px solid var(--bg-0)}
        ::-webkit-scrollbar-thumb:hover{background:#2c3733}
        @media(max-width:1180px){.metric-grid{grid-template-columns:repeat(2,1fr)!important}.section-grid{grid-template-columns:1fr!important}}
        @media(max-width:820px){.body{grid-template-columns:1fr!important}.sidebar{display:none!important}.main{padding:16px!important}.metric-grid{grid-template-columns:1fr 1fr!important}.topbar-customer{display:none!important}}
      `}</style>

    </div>
  );
}

export default App;
