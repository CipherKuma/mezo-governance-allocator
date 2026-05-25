// Lightweight SVG donut (no chart lib) showing each gauge's share of routed MUSD.
const COLORS = ["#f7931a", "#34d399", "#38bdf8", "#a78bfa"];

export function AllocationDonut({
  shares,
  labels,
  centerLabel,
  centerValue,
}: {
  shares: number[]; // percentages summing to ~100
  labels: string[];
  centerLabel: string;
  centerValue: string;
}) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const total = shares.reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90">
        {shares.map((s, i) => {
          const frac = s / total;
          const dash = frac * circumference;
          const seg = (
            <circle
              key={i}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={COLORS[i % COLORS.length]}
              strokeWidth="16"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              className="transition-[stroke-dasharray] duration-700"
            />
          );
          offset += dash;
          return seg;
        })}
      </svg>
      <div className="flex flex-col gap-2">
        <div className="rotate-0 text-center sm:text-left">
          <div className="text-2xl font-bold text-ivory">{centerValue}</div>
          <div className="text-xs uppercase tracking-wider text-white/40">
            {centerLabel}
          </div>
        </div>
        <ul className="mt-1 space-y-1.5">
          {labels.map((label, i) => (
            <li key={label} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="text-white/70">{label}</span>
              <span className="ml-auto font-mono text-white/45">
                {shares[i].toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
