/**
 * ColdGuard TempChart Component
 * Displays temperature history as a line chart using Recharts.
 * Shows threshold lines at MIN (1°C) and MAX (8°C).
 *
 * @param {Object} props
 * @param {Array} props.data - Array of temperature readings
 * @param {string} props.lang - Current language (en, de, ar)
 */
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

const THRESHOLDS = { MIN: 1.0, MAX: 8.0 };

/**
 * Formats timestamp for X axis display.
 * @param {string} ts - ISO timestamp string
 * @returns {string} Formatted time string (HH:MM)
 */
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Returns dot color based on temperature value.
 * @param {number} temp - Temperature value
 * @returns {string} CSS color string
 */
function dotColor(temp) {
  if (temp > THRESHOLDS.MAX) return '#E24B4A';
  if (temp < THRESHOLDS.MIN) return '#378ADD';
  return '#1D9E75';
}

/**
 * Custom tooltip for the chart.
 */
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: '#161d1b', border: '1px solid #232c29',
      borderRadius: 8, padding: '8px 12px', fontSize: 12,
    }}>
      <div style={{ color: '#7f8a85', marginBottom: 4 }}>{formatTime(d.timestamp)}</div>
      <div style={{ color: dotColor(d.temperature), fontFamily: 'IBM Plex Mono', fontWeight: 500 }}>
        {d.temperature.toFixed(1)}°C
      </div>
    </div>
  );
}

function TempChart({ data = [], lang }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>

        <CartesianGrid stroke="rgba(35,44,41,0.8)" strokeDasharray="3 3" />

        <XAxis
          dataKey="timestamp"
          tickFormatter={formatTime}
          tick={{ fill: '#7f8a85', fontSize: 11 }}
          axisLine={{ stroke: '#232c29' }}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={40}
        />

        <YAxis
          tick={{ fill: '#7f8a85', fontSize: 11 }}
          axisLine={{ stroke: '#232c29' }}
          tickLine={false}
          tickFormatter={v => `${v}°`}
          width={36}
        />

        <Tooltip content={<CustomTooltip />} />

        {/* Max threshold line */}
        <ReferenceLine
          y={THRESHOLDS.MAX}
          stroke="rgba(226,75,74,0.4)"
          strokeDasharray="4 4"
          label={{ value: 'Max: 8°C', fill: '#E24B4A', fontSize: 11, position: 'right' }}
        />

        {/* Min threshold line */}
        <ReferenceLine
          y={THRESHOLDS.MIN}
          stroke="rgba(55,138,221,0.4)"
          strokeDasharray="4 4"
          label={{ value: 'Min: 1°C', fill: '#378ADD', fontSize: 11, position: 'right' }}
        />

        <Line
          type="monotone"
          dataKey="temperature"
          stroke="#1D9E75"
          strokeWidth={2}
          dot={(props) => {
            const { cx, cy, payload } = props;
            return (
              <circle
                key={payload.timestamp}
                cx={cx} cy={cy} r={3}
                fill={dotColor(payload.temperature)}
                stroke="none"
              />
            );
          }}
          activeDot={{ r: 5, fill: '#1D9E75' }}
        />

      </LineChart>
    </ResponsiveContainer>
  );
}

export default TempChart;