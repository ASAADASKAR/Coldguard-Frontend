/**
 * ColdGuard Sidebar Component
 * Displays the device list with status indicator and current temperature.
 *
 * @param {Object} props
 * @param {object|null} props.current - Current temperature data from API
 * @param {string} props.lang - Current language (en, de, ar)
 */
function Sidebar({ current, lang }) {
  const isAlarm = current?.status === 'ALARM_HIGH' || current?.status === 'ALARM_LOW';
  const isOnline = current && (Date.now() - new Date(current.timestamp)) < 5 * 60 * 1000;

  return (
    <aside className="sidebar">

      {/* Header */}
      <div className="sidebar-head">
        {lang === 'de' ? 'Geräte' : lang === 'ar' ? 'الأجهزة' : 'Devices'}
      </div>

      {/* Device List */}
      <div className="device-list">
        <div className="device-row active">

          {/* Status Dot */}
          <span className={`dot ${isAlarm ? 'red' : ''}`} />

          {/* Device Info */}
          <div>
            <div className="device-name-sidebar">
              {current?.device || '—'}
            </div>
            <div className="device-loc-sidebar">
              {isOnline
                ? (lang === 'de' ? 'Online' : lang === 'ar' ? 'متصل' : 'Online')
                : (lang === 'de' ? 'Offline' : lang === 'ar' ? 'غير متصل' : 'Offline')
              }
            </div>
          </div>

          {/* Temperature */}
          <div className={`device-temp-sidebar ${isAlarm ? 'alarm' : ''}`}>
            {current?.temperature !== null && current?.temperature !== undefined
              ? `${current.temperature.toFixed(1)}°C`
              : '—'
            }
          </div>

        </div>
      </div>
    </aside>
  );
}

export default Sidebar;