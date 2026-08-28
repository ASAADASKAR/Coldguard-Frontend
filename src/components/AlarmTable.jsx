/**
 * ColdGuard AlarmTable Component
 * Displays alarm history in a table format.
 * Shows time, peak temperature, type, duration and status.
 *
 * @param {Object} props
 * @param {Array} props.alarms - Array of alarm objects from API
 * @param {string} props.lang - Current language (en, de, ar)
 */

/**
 * Formats a timestamp to a localized date/time string.
 * @param {string} ts - ISO timestamp string
 * @param {string} lang - Language code
 * @returns {string} Formatted date/time string
 */
function formatDateTime(ts, lang) {
  return new Date(ts).toLocaleString(
    lang === 'ar' ? 'ar-SA' : lang === 'de' ? 'de-DE' : 'en-GB',
    { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );
}

/**
 * Calculates duration between two timestamps.
 * @param {string} start - Start ISO timestamp
 * @param {string} end - End ISO timestamp
 * @returns {string} Formatted duration string (e.g. "2h 30m")
 */
function formatDuration(start, end) {
  const s = (new Date(end) - new Date(start)) / 1000;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const LABELS = {
  en: { time: 'Time', temp: 'Temp', type: 'Type', duration: 'Duration', status: 'Status',
        title: 'Alarm History', noAlarms: 'No alarms recorded',
        typeHigh: 'High temp', typeLow: 'Low temp',
        ongoing: 'Ongoing', resolved: 'Resolved' },
  de: { time: 'Zeit', temp: 'Temp', type: 'Typ', duration: 'Dauer', status: 'Status',
        title: 'Alarmverlauf', noAlarms: 'Keine Alarme aufgezeichnet',
        typeHigh: 'Übertemp.', typeLow: 'Untertemp.',
        ongoing: 'Aktiv', resolved: 'Behoben' },
  ar: { time: 'الوقت', temp: 'الحرارة', type: 'النوع', duration: 'المدة', status: 'الحالة',
        title: 'سجل الإنذارات', noAlarms: 'لم يتم تسجيل أي إنذارات',
        typeHigh: 'حرارة عالية', typeLow: 'حرارة منخفضة',
        ongoing: 'نشط', resolved: 'تم الحل' },
};

function AlarmTable({ alarms = [], lang = 'en' }) {
  const L = LABELS[lang] || LABELS.en;

  return (
    <div className="panel" style={{ marginBottom: 12 }}>

      {/* Header */}
      <div className="panel-head">
        <div className="panel-title">
          🛡️ <span>{L.title}</span>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {[L.time, L.temp, L.type, L.duration, L.status].map(col => (
                <th key={col} style={{
                  textAlign: lang === 'ar' ? 'right' : 'left',
                  fontWeight: 500, color: 'var(--fg-2)',
                  fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
                  padding: '8px 18px', borderBottom: '1px solid var(--line)',
                  background: 'var(--bg-1)',
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alarms.length === 0 ? (
              <tr>
                <td colSpan={5} style={{
                  textAlign: 'center', padding: 32, color: 'var(--fg-2)'
                }}>
                  🛡️ {L.noAlarms}
                </td>
              </tr>
            ) : (
              alarms.map((alarm, i) => {
                const isHigh = alarm.status === 'ALARM_HIGH';
                const peak   = isHigh ? alarm.max_temp : alarm.min_temp;
                const dur    = alarm.resolved_at
                  ? formatDuration(alarm.started_at, alarm.resolved_at)
                  : L.ongoing;
                const isResolved = !!alarm.resolved_at;

                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--line)' }}>

                    {/* Time */}
                    <td style={{ padding: '12px 18px', color: 'var(--fg-0)',
                      fontFamily: 'IBM Plex Mono', fontSize: 12 }}>
                      {formatDateTime(alarm.started_at, lang)}
                    </td>

                    {/* Peak Temp */}
                    <td style={{ padding: '12px 18px',
                      color: isHigh ? 'var(--red)' : '#378ADD',
                      fontFamily: 'IBM Plex Mono', fontWeight: 500 }}>
                      {peak !== null && peak !== undefined ? `${peak.toFixed(1)}°C` : '—'}
                    </td>

                    {/* Type */}
                    <td style={{ padding: '12px 18px', color: 'var(--fg-1)' }}>
                      {isHigh ? `🌡️ ${L.typeHigh}` : `❄️ ${L.typeLow}`}
                    </td>

                    {/* Duration */}
                    <td style={{ padding: '12px 18px', color: 'var(--fg-1)' }}>
                      {dur}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '12px 18px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 100,
                        background: isResolved ? 'var(--green-soft)' : 'var(--red-soft)',
                        color: isResolved ? 'var(--green)' : 'var(--red)',
                        border: `1px solid ${isResolved ? 'var(--green-line)' : 'var(--red-line)'}`,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%',
                          background: 'currentColor', display: 'inline-block' }} />
                        {isResolved ? L.resolved : L.ongoing}
                      </span>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AlarmTable;