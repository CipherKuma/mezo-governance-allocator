import type { Gauge } from "../lib/allocator";

type Props = {
  gauges: Gauge[];
  leadingGaugeId: string;
};

export function GaugeConstellation({ gauges, leadingGaugeId }: Props) {
  return (
    <div className="hidden rounded-lg border border-white/10 bg-black/42 p-4 lg:block">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Gauge routing map</p>
        <p className="text-xs text-white/45">visual proof surface</p>
      </div>
      <svg
        viewBox="0 0 720 190"
        role="img"
        aria-label="Gauge routing map"
        className="h-[190px] w-full"
      >
        <defs>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect
          x="1"
          y="1"
          width="718"
          height="188"
          rx="22"
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.08)"
        />
        <circle
          cx="105"
          cy="95"
          r="39"
          fill="rgba(247,147,26,0.14)"
          stroke="rgba(247,147,26,0.7)"
        />
        <text
          x="105"
          y="91"
          textAnchor="middle"
          fill="#f8f3e7"
          fontSize="13"
          fontWeight="700"
        >
          veBTC
        </text>
        <text
          x="105"
          y="109"
          textAnchor="middle"
          fill="rgba(248,243,231,0.55)"
          fontSize="11"
        >
          base vote
        </text>
        <circle
          cx="250"
          cy="95"
          r="30"
          fill="rgba(104,230,177,0.12)"
          stroke="rgba(104,230,177,0.65)"
        />
        <text
          x="250"
          y="99"
          textAnchor="middle"
          fill="#68e6b1"
          fontSize="12"
          fontWeight="700"
        >
          MEZO
        </text>
        <path
          d="M144 95 H220"
          stroke="rgba(248,243,231,0.35)"
          strokeWidth="2"
          strokeDasharray="6 8"
        />
        {gauges.map((gauge, index) => {
          const x = 445 + (index % 2) * 168;
          const y = 55 + Math.floor(index / 2) * 82;
          const active = gauge.id === leadingGaugeId;
          return (
            <g key={gauge.id}>
              <path
                d={`M280 95 C340 ${y}, 360 ${y}, ${x - 48} ${y}`}
                stroke={active ? "#68e6b1" : "rgba(248,243,231,0.22)"}
                strokeWidth={active ? 3 : 1.4}
                fill="none"
                filter={active ? "url(#softGlow)" : undefined}
              />
              <rect
                x={x - 48}
                y={y - 24}
                width="142"
                height="48"
                rx="16"
                fill={
                  active ? "rgba(104,230,177,0.13)" : "rgba(255,255,255,0.035)"
                }
                stroke={
                  active ? "rgba(104,230,177,0.7)" : "rgba(255,255,255,0.1)"
                }
              />
              <text
                x={x - 33}
                y={y - 2}
                fill="#f8f3e7"
                fontSize="11"
                fontWeight="700"
              >
                {gauge.label}
              </text>
              <text
                x={x - 33}
                y={y + 15}
                fill="rgba(248,243,231,0.55)"
                fontSize="10"
              >
                {gauge.proposedWeightBps} bps
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
