import { Coins, Gauge, Landmark } from "lucide-react";
import type { ReactNode } from "react";
import type { AllocationImpact } from "../lib/allocator";

type Props = {
  impact: AllocationImpact;
};

export function ImpactStrip({ impact }: Props) {
  return (
    <div className="grid gap-4 rounded-lg border border-white/10 bg-black/55 p-4 sm:grid-cols-3">
      <ImpactCard
        icon={<Gauge size={18} />}
        label="Emission delta"
        value={`${impact.totalEmissionShare >= 0 ? "+" : ""}${impact.totalEmissionShare.toLocaleString()} MEZO`}
      />
      <ImpactCard
        icon={<Coins size={18} />}
        label="MUSD flow shift"
        value={`${impact.musdFlowDelta >= 0 ? "+" : ""}${Math.round(impact.musdFlowDelta).toLocaleString()} MUSD`}
      />
      <ImpactCard
        icon={<Landmark size={18} />}
        label="BTC depth shift"
        value={`${impact.btcDepthDelta >= 0 ? "+" : ""}${impact.btcDepthDelta.toFixed(3)} BTC`}
      />
    </div>
  );
}

function ImpactCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-6 flex items-center justify-between text-white/45">
        <span className="text-musd">{icon}</span>
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-xl font-semibold text-white">{value}</div>
    </div>
  );
}
