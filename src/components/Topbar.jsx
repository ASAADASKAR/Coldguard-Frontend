/**
 * ColdGuard Topbar Component
 * Displays the app logo, refresh countdown and language toggle.
 *
 * @param {Object} props
 * @param {number} props.countdown - Seconds until next refresh
 * @param {string} props.lang - Current language (en, de, ar)
 * @param {function} props.onLangChange - Language change handler
 * @param {function} props.onRefresh - Manual refresh handler
 */
function Topbar({ countdown, lang, onLangChange, onRefresh }) {
  return (
    <header className="topbar">

      {/* Logo */}
      <div className="logo">
        <div className="logo-mark">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </div>
        ColdGuard
      </div>

      <div className="spacer" />

      {/* Actions */}
      <div className="topbar-actions">

        {/* Countdown */}
        <div className="refresh-pill">
          <span className="pulse" />
          <span>{countdown}s</span>
        </div>

        {/* Refresh Button */}
        <button className="icon-btn" onClick={onRefresh} title="Refresh">
          🔄
        </button>

        {/* Language Toggle */}
        <div className="lang-toggle">
          {['de', 'en', 'ar'].map(l => (
            <button
              key={l}
              data-lang={l}
              className={lang === l ? 'active' : ''}
              onClick={() => onLangChange(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

      </div>
    </header>
  );
}

export default Topbar;