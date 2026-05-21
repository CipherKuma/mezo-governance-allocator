import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  LockKeyhole,
  RadioTower,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import {
  buildFixtureReceipt,
  calculateImpact,
  updateGaugeWeight,
  type Gauge,
  type Position,
  type VoteReceipt,
} from "./lib/allocator";
import { initialGauges, initialPosition } from "./lib/fixtures";
import { getReceiptExplorerUrl, MEZO_NETWORK } from "./lib/mezo";
import { useIsLiveMode } from "./hooks/useAllocatorContract";
import { AllocatorWorkbench } from "./components/AllocatorWorkbench";
import { ReceiptPanel } from "./components/ReceiptPanel";
import { ImpactStrip } from "./components/ImpactStrip";
import { GaugeConstellation } from "./components/GaugeConstellation";
import { WalletAuthPanel } from "./components/WalletAuthPanel";
import { TreasuryPanel } from "./components/TreasuryPanel";
import { LockPanel } from "./components/LockPanel";
import { FaucetPanel } from "./components/FaucetPanel";

const fadeUp = {
  hidden: { opacity: 0, y: 22, filter: "blur(12px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

function App() {
  const { isConnected } = useAccount();
  const isLive = useIsLiveMode();
  const showLivePanels = isLive && isConnected;

  const [gauges, setGauges] = useState<Gauge[]>(initialGauges);
  const [position, setPosition] = useState<Position>(initialPosition);
  const [receipt, setReceipt] = useState<VoteReceipt>(() =>
    buildFixtureReceipt(initialGauges, initialPosition),
  );
  const impact = useMemo(
    () => calculateImpact(gauges, position),
    [gauges, position],
  );
  const explorerUrl = getReceiptExplorerUrl(receipt.txHash);

  const mode = isLive ? "MUSD Treasury · Live" : "Fixture demo mode";

  function onGaugeWeightChange(gaugeId: string, nextWeight: number) {
    setGauges((current) => updateGaugeWeight(current, gaugeId, nextWeight));
  }

  function onSimulate() {
    setReceipt(buildFixtureReceipt(gauges, position));
  }

  return (
    <main className="min-h-screen bg-graphite text-ivory">
      <section className="relative min-h-screen overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(to_top,rgba(8,9,7,1),rgba(8,9,7,0))]" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-32px)] max-w-7xl flex-col rounded-lg border border-white/10 bg-black/45 shadow-glass backdrop-blur">
          <nav className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-btc/40 bg-btc/15 text-btc">
                <RadioTower size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  Mezo Allocator
                </p>
                <p className="text-xs text-white/45">
                  MUSD governance · veMEZO voting · Passport
                </p>
              </div>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <StatusPill icon={<BadgeCheck size={14} />} label={mode} />
              <StatusPill
                icon={<Activity size={14} />}
                label={`Chain ${MEZO_NETWORK.id ?? 31611}`}
              />
            </div>
          </nav>

          <div className="grid flex-1 gap-8 px-4 pb-6 sm:px-6 lg:grid-cols-[0.9fr_1.35fr] lg:px-8 lg:pb-8">
            <motion.div
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.08 }}
              className="flex flex-col justify-end pb-2 lg:pb-8"
            >
              <motion.p
                variants={fadeUp}
                className="mb-5 text-xs font-semibold text-btc"
              >
                MEZO Utilization · Governance & DAO Tools
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="max-w-2xl text-[42px] font-semibold leading-[0.98] text-white sm:text-[58px] lg:text-[72px]"
              >
                veMEZO holders allocate{" "}
                <span className="font-serif italic font-normal text-musd">
                  MUSD treasury
                </span>{" "}
                via gauge votes.
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-5 max-w-xl text-base leading-7 text-white/62 sm:text-lg"
              >
                Lock MEZO → get veMEZO voting power → vote on which protocols
                receive MUSD grants. Mezo Passport gates voters. Epoch
                settlement distributes treasury proportionally.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="mt-7 flex flex-wrap gap-3"
              >
                <button
                  onClick={onSimulate}
                  className="inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-3 text-sm font-semibold text-black transition hover:bg-white"
                >
                  Simulate Allocation <ArrowUpRight size={16} />
                </button>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3"
              >
                <Metric
                  icon={<LockKeyhole size={16} />}
                  label="veBTC base"
                  value={impact.baseVotingPower.toFixed(3)}
                />
                <Metric
                  icon={<Wallet size={16} />}
                  label="MEZO boost"
                  value={`${impact.boostMultiplier.toFixed(2)}x`}
                />
                <Metric
                  icon={<Activity size={16} />}
                  label="Power"
                  value={impact.effectiveVotingPower.toFixed(3)}
                />
              </motion.div>
            </motion.div>

            <div className="flex flex-col justify-end gap-4">
              <GaugeConstellation
                gauges={gauges}
                leadingGaugeId={impact.leadingGaugeId}
              />
              <AllocatorWorkbench
                gauges={gauges}
                position={position}
                impact={impact}
                hasAllocator={isLive}
                onGaugeWeightChange={onGaugeWeightChange}
                onPositionChange={setPosition}
                onSimulate={onSimulate}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-start gap-4 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
        <div className="grid gap-4">
          <WalletAuthPanel />
          {showLivePanels && <TreasuryPanel />}
          {showLivePanels && <LockPanel />}
          {showLivePanels && <FaucetPanel />}
          <ImpactStrip impact={impact} />
        </div>
        <ReceiptPanel
          receipt={receipt}
          explorerUrl={explorerUrl}
          allocatorAddress={
            isLive ? import.meta.env.VITE_MUSD_ALLOCATOR_ADDRESS : undefined
          }
        />
      </section>
    </main>
  );
}

function StatusPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full liquid-glass px-3 py-2 text-xs text-white/65">
      {icon}
      {label}
    </span>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-5 flex items-center justify-between text-white/45">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

export default App;
