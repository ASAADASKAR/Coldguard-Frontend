/**
 * ColdGuard DeviceLogs Component
 * Displays device error and warning logs from the backend.
 * Shows last 10 logs with level badge, message and timestamp.
 *
 * @param {Object} props
 * @param {Array} props.logs - Array of log objects from API
 * @param {string} props.lang - Current language (en, de, ar)
 */

/**
 * Returns relative time string from a timestamp.
 * @param {string} ts - ISO timestamp string
 * @returns {string} Relative time (e.g. "5 min ago")
 */
function relativeTime(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

const TITLES = {
  en: { title: 'Device Logs', noLogs: 'No errors recorded' },
  de: { title: 'Geräte Logs', noLogs: 'Keine Fehler aufgezeichnet' },
  ar: { title: 'سجلات الجهاز', noLogs: 'لا توجد أخطاء' },
};

/**
 * Returns styles for log level badge.
 * @param {string} level - Log level (ERROR, WARN, INFO)
 * @returns {Object} Style object
 */
function levelStyle(level) {
  switch (level) {
    case 'ERROR': return {
      background: 'var(--red-soft)', color: 'var(--red)',
      border: '1px solid var(--red-line)',
    };
    case 'WARN': return {
      background: 'var(--amber-soft)', color: 'var(--amber)',
      border: '1px solid var(--amber-line)',
    };
    default: return {
      background: 'var(--green-soft)', color: 'var(--green)',
      border: '1px solid var(--green-line)',
    };
  }
}

function DeviceLogs({ logs = [], lang = 'en' }) {
  const L = TITLES[lang] || TITLES.en;

  return (
    <div className="panel">

      {/* Header */}
      <div className="panel-head">
        <div className="panel-title">
          ⚠️ <span>{L.title}</span>
        </div>
      </div>

      {/* Logs List */}
      {logs.length === 0 ? (
        <div style={{
          display: 'grid', placeItems: 'center',
          padding: '48px 24px', color: 'var(--fg-2)', textAlign: 'center',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'var(--bg-2)', border: '1px solid var(--line)',
            display: 'grid', placeItems: 'center', fontSize: 18, marginBottom: 8,
          }}>✅</div>
          <div>{L.noLogs}</div>
        </div>
      ) : (
        logs.slice(0, 10).map((log, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '12px 18px',
            borderBottom: i < logs.length - 1 ? '1px solid var(--line)' : 'none',
          }}>

            {/* Level Badge */}
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              padding: '2px 7px', borderRadius: 100, flexShrink: 0, marginTop: 2,
              ...levelStyle(log.level),
            }}>
              {log.level}
            </span>

            {/* Message + Time */}
            <div>
              <div style={{ fontSize: 13, color: 'var(--fg-0)', marginBottom: 3 }}>
                {log.friendly_message || log.message}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-2)' }}>
                {relativeTime(log.timestamp)}
              </div>
            </div>

          </div>
        ))
      )}
    </div>
  );
}

export default DeviceLogs;