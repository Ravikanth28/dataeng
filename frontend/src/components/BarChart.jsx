// Lightweight animated SVG bar chart — no external libraries.
// Takes a table { columns, rows }, auto-picks a label column + numeric column.

const PALETTE = ["#6c8cff", "#3ddc97", "#f5b74e", "#b98bff", "#ff7eb6", "#4ec9e0"];

function pickColumns(table) {
  const { columns, rows } = table;
  if (!rows.length) return null;
  const isNum = (i) => rows.every((r) => typeof r[i] === "number" || (!isNaN(parseFloat(r[i])) && r[i] !== null && r[i] !== ""));
  let valueIdx = -1;
  for (let i = columns.length - 1; i >= 0; i--) {
    if (isNum(i)) { valueIdx = i; break; }
  }
  if (valueIdx === -1) return null;
  let labelIdx = columns.findIndex((_, i) => i !== valueIdx);
  if (labelIdx === -1) labelIdx = valueIdx;
  return { labelIdx, valueIdx };
}

export default function BarChart({ table, title }) {
  if (!table || !table.rows?.length) return null;
  const picked = pickColumns(table);
  if (!picked) return null;

  const { labelIdx, valueIdx } = picked;
  const data = table.rows
    .map((r) => ({ label: String(r[labelIdx]), value: parseFloat(r[valueIdx]) || 0 }))
    .slice(0, 8);
  const max = Math.max(...data.map((d) => d.value), 1);

  const W = 460, H = 220, padL = 48, padB = 46, padT = 12;
  const chartW = W - padL - 12;
  const chartH = H - padB - padT;
  const bw = chartW / data.length;

  return (
    <div className="card mt-2 anim-pop" style={{ padding: 14 }}>
      <div className="row between" style={{ marginBottom: 6 }}>
        <strong style={{ fontSize: 14 }}>📊 {title || `${table.columns[valueIdx]} by ${table.columns[labelIdx]}`}</strong>
        <span className="pill" style={{ padding: "2px 8px" }}>live chart</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
        {/* axis */}
        <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="var(--border-strong)" />
        <line x1={padL} y1={padT + chartH} x2={W - 12} y2={padT + chartH} stroke="var(--border-strong)" />
        {data.map((d, i) => {
          const h = (d.value / max) * chartH;
          const x = padL + i * bw + bw * 0.15;
          const y = padT + chartH - h;
          const w = bw * 0.7;
          const color = PALETTE[i % PALETTE.length];
          return (
            <g key={i}>
              <rect
                x={x} y={y} width={w} height={h} rx="4" fill={color}
                style={{ transformOrigin: `${x + w / 2}px ${padT + chartH}px`, animation: `growBar 0.6s ease ${i * 0.08}s both` }}
              />
              <text x={x + w / 2} y={y - 5} textAnchor="middle" fontSize="11" fill="var(--text)">
                {Math.round(d.value).toLocaleString()}
              </text>
              <text x={x + w / 2} y={padT + chartH + 16} textAnchor="middle" fontSize="10" fill="var(--text-dim)">
                {d.label.length > 8 ? d.label.slice(0, 7) + "…" : d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
