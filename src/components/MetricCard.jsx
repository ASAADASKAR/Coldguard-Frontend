const ICONS = {
  thermometer: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4 4 0 1 0 5 0Z"/></svg>,
  wifi: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>,
  alert: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>,
  shield: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>,
};

function Icon({ name, size = 12 }) {
  const icon = ICONS[name];
  if (!icon) return null;
  return <span style={{ display: 'inline-flex', alignItems: 'center', width: size, height: size }}>{icon}</span>;
}

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

export default MetricCard;
