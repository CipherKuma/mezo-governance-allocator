import { Suspense, lazy } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { Activity, Shield } from "lucide-react";

const Spline = lazy(() => import("@splinetool/react-spline"));

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function Landing() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[hsl(0,0%,5%)]">
      <Suspense
        fallback={
          <div className="absolute inset-0 bg-[hsl(0,0%,5%)]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(247,147,26,0.06)_0%,transparent_70%)]" />
          </div>
        }
      >
        <div className="absolute inset-0">
          <Spline
            scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode"
            className="h-full w-full"
          />
        </div>
      </Suspense>

      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(0,0%,5%)] via-transparent to-transparent" />

      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-5 lg:px-12">
        <span className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-white">
          <img
            src="/borealis.png"
            alt="Borealis"
            className="h-8 w-8 rounded-md"
          />
          BOREALIS
        </span>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/50 backdrop-blur-md sm:inline-flex">
            <Activity size={12} className="text-musd" />
            Mezo Testnet
          </span>
          <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/50 backdrop-blur-md sm:inline-flex">
            <Shield size={12} className="text-btc" />
            Live
          </span>
        </div>
      </nav>

      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.12, delayChildren: 0.6 }}
        className="absolute bottom-0 left-0 z-10 flex max-w-2xl flex-col gap-6 px-6 pb-16 lg:px-12 lg:pb-20"
      >
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-btc"
        >
          MEZO Utilization Track · Live on Mezo Testnet
        </motion.p>

        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-6xl"
        >
          MEZO-powered{" "}
          <span className="bg-gradient-to-r from-musd to-emerald-300 bg-clip-text text-transparent">
            MUSD capital router
          </span>{" "}
          for the Mezo ecosystem.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-lg text-base leading-relaxed text-white/50"
        >
          Lock MEZO for veMEZO voting power. Direct the MUSD treasury across
          ecosystem gauges. Epoch settlement routes capital where the community
          governs — verifiable on-chain, every vote.
        </motion.p>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <ConnectButton label="Connect Mezo Wallet" />
        </motion.div>
      </motion.div>
    </div>
  );
}
