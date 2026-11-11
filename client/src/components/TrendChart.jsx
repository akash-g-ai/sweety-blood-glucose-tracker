export default function TrendChart({ trend }) {
  const data = trend.data;
  const points = data.filter(function(d) { return d.average !== null; });

  if (points.length === 0) {
    return (
      <div className="trend-chart__empty">No readings to chart this month yet.</div>
    );
  }

  const W = 800;
  const H = 220;
  const pad = { top: 20, right: 24, bottom: 36, left: 48 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const values = points.map(function(p) { return p.average; });
  let yMin = Math.max(40, Math.min.apply(null, values) - 20);
  let yMax = Math.min(600, Math.max.apply(null, values) + 20);
  if (yMin === yMax) { yMin = yMin - 20; yMax = yMax + 20; }

  function xScale(i) {
    if (data.length === 1) return pad.left + cw / 2;
    return pad.left + (i / (data.length - 1)) * cw;
  }
  function yScale(v) {
    return pad.top + ch - ((v - yMin) / (yMax - yMin)) * ch;
  }

  // Build line segments, breaking at null averages
  var segments = [];
  var current = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i].average !== null) {
      current.push({ x: xScale(i), y: yScale(data[i].average), date: data[i].date, average: data[i].average });
    } else {
      if (current.length > 0) { segments.push(current); current = []; }
    }
  }
  if (current.length > 0) segments.push(current);

  // Build SVG path strings
  var linePaths = segments.map(function(seg) {
    if (seg.length < 2) return null;
    return seg.map(function(p, idx) {
      return (idx === 0 ? "M " : "L ") + p.x + " " + p.y;
    }).join(" ");
  }).filter(Boolean);

  // All data point circles for rendering
  var allPoints = segments.flat();

  // Y-axis grid lines (4 divisions = 5 lines)
  var gridLines = [];
  var gridCount = 4;
  for (var g = 0; g <= gridCount; g++) {
    var gv = yMin + (yMax - yMin) * (1 - g / gridCount);
    var gy = pad.top + (g / gridCount) * ch;
    gridLines.push({ y: gy, value: Math.round(gv) });
  }

  // X-axis labels: first, middle, last
  var xLabels = [];
  if (data.length > 0) {
    var indices = [0, Math.floor((data.length - 1) / 2), data.length - 1];
    var seen = {};
    indices.forEach(function(idx) {
      if (!seen[idx] && data[idx]) {
        seen[idx] = true;
        xLabels.push({ x: xScale(idx), label: data[idx].date.slice(5) });
      }
    });
  }

  return (
    <div className="trend-chart">
      <svg viewBox={"0 0 " + W + " " + H} className="trend-chart__svg" preserveAspectRatio="xMidYMid meet">
        {gridLines.map(function(gl, i) {
          return (
            <g key={"g" + i}>
              <line x1={pad.left} y1={gl.y} x2={W - pad.right} y2={gl.y} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="3 3" />
              <text x={pad.left - 6} y={gl.y + 3} textAnchor="end" fontSize="10" fill="var(--color-text-light)">{gl.value}</text>
            </g>
          );
        })}
        {linePaths.map(function(d, i) {
          return <path key={"p" + i} d={d} fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />;
        })}
        {allPoints.map(function(p, i) {
          return <circle key={"c" + i} cx={p.x} cy={p.y} r="3.5" fill="var(--color-primary)" />;
        })}
        {xLabels.map(function(l, i) {
          return <text key={"xl" + i} x={l.x} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--color-text-light)">{l.label}</text>;
        })}
      </svg>
    </div>
  );
}