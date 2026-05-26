import React from "react";
import { Easing, interpolate, spring, useCurrentFrame } from "remotion";
import {
  Beam,
  BitcoinCoin,
  BrandMark,
  Plate,
  clamp,
  stage,
  stageFloor,
} from "./BrandVisualPrimitives";

type VisualProps = {
  sceneId: string;
  color: string;
  scale: number;
};

const LiquidityEngine = ({ color, scale }: { color: string; scale: number }) => {
  const frame = useCurrentFrame();
  const lift = spring({ frame, fps: 24, config: { damping: 18, stiffness: 90 } });
  return (
    <div style={stage}>
      <div style={stageFloor(color, scale)} />
      <Beam from={[210, 220]} to={[388, 322]} color="#f7931a" />
      <Beam from={[568, 232]} to={[410, 326]} color="#ff004d" delay={24} />
      <Beam from={[320, 532]} to={[404, 382]} color="#67e8a7" delay={48} />
      <BitcoinCoin
        size={126}
        style={{ left: 130, top: 126, transform: `translateZ(${140 + lift * 18}px)` }}
      />
      <BrandMark
        kind="mezo"
        size={122}
        style={{ left: 522, top: 142, transform: `translateZ(${142 + lift * 16}px)` }}
      />
      <BrandMark
        kind="musd"
        size={116}
        style={{ left: 250, top: 480, transform: `translateZ(${126 + lift * 18}px)` }}
      />
      <div
        style={{
          position: "absolute",
          left: 302,
          top: 280,
          width: 210,
          height: 150,
          borderRadius: 26,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04))",
          border: `1px solid ${color}`,
          boxShadow: `0 0 82px ${color}66, inset 0 0 42px rgba(255,255,255,0.06)`,
          transform: `translateZ(${168 + Math.sin(frame / 18) * 8}px)`,
          display: "grid",
          placeItems: "center",
          color: "#fff",
          textAlign: "center",
          fontWeight: 900,
          fontSize: 24,
          lineHeight: 1.06,
        }}
      >
        CAPITAL
        <br />
        ROUTER
      </div>
    </div>
  );
};

const TrustBridge = ({ color, scale }: { color: string; scale: number }) => (
  <div style={stage}>
    <div style={stageFloor(color, scale)} />
    <Plate label="OFF-CHAIN ASK" value="opaque" color="#f7931a" x={94} y={230} />
    <Plate label="MEZO SIGNAL" value="weighted" color={color} x={306} y={202} active />
    <Plate label="ON-CHAIN PROOF" value="verifiable" color="#67e8a7" x={520} y={234} active />
    <Beam from={[252, 280]} to={[306, 250]} color={color} />
    <Beam from={[466, 250]} to={[520, 282]} color="#67e8a7" delay={36} />
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: 334,
          top: 364 + i * 42,
          width: 170,
          height: 32,
          borderRadius: 999,
          border: `1px solid ${i === 1 ? color : "rgba(255,255,255,0.16)"}`,
          color: i === 1 ? color : "rgba(255,255,255,0.5)",
          display: "grid",
          placeItems: "center",
          fontWeight: 900,
          fontSize: 14,
          transform: `translateZ(${70 + i * 18}px)`,
        }}
      >
        RECEIPT {i + 1}
      </div>
    ))}
  </div>
);

const GaugeRouter = ({ color, scale }: { color: string; scale: number }) => {
  const frame = useCurrentFrame();
  const gauges = [
    ["LIQ", 72, "#f7931a"],
    ["MUSD", 64, "#67e8a7"],
    ["VAL", 38, "#8ab4ff"],
    ["GRANT", 52, "#ff004d"],
  ] as const;
  return (
    <div style={stage}>
      <div style={stageFloor(color, scale)} />
      <BrandMark kind="mezo" size={118} style={{ left: 318, top: 122, transform: "translateZ(160px)" }} />
      <div style={{ position: "absolute", left: 260, top: 252, width: 240, height: 64, borderRadius: 999, border: `1px solid ${color}`, display: "grid", placeItems: "center", color, fontSize: 22, fontWeight: 900, transform: "translateZ(134px)", boxShadow: `0 0 54px ${color}55` }}>
        MEZO-WEIGHTED ROUTER
      </div>
      {gauges.map(([label, pct, gaugeColor], i) => (
        <div key={label} style={{ position: "absolute", left: 124 + i * 142, top: 398, width: 92, height: 180, transform: "translateZ(92px)" }}>
          <div style={{ position: "absolute", bottom: 0, width: "100%", height: "100%", borderRadius: 18, background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.16)" }} />
          <div style={{ position: "absolute", bottom: 0, width: "100%", height: `${pct + Math.sin(frame / 16 + i) * 4}%`, borderRadius: 18, background: `linear-gradient(180deg, ${gaugeColor}, ${gaugeColor}66)`, boxShadow: `0 0 42px ${gaugeColor}66` }} />
          <div style={{ position: "absolute", top: 194, width: "100%", textAlign: "center", color: "#fff", fontWeight: 900, fontSize: 16 }}>{label}</div>
        </div>
      ))}
    </div>
  );
};

const EcosystemMap = ({ color, scale }: { color: string; scale: number }) => {
  const frame = useCurrentFrame();
  const spin = interpolate(frame % 240, [0, 240], [0, 360], {
    ...clamp,
    easing: Easing.linear,
  });
  return (
    <div style={stage}>
      <div style={stageFloor(color, scale)} />
      <div style={{ position: "absolute", left: 232, top: 170, width: 300, height: 300, borderRadius: 150, border: `2px solid ${color}`, transform: `rotate(${spin}deg) translateZ(110px)`, opacity: 0.72 }} />
      <BrandMark kind="mezo" size={128} style={{ left: 318, top: 250, transform: "translateZ(170px)" }} />
      <Plate label="LIQUIDITY" color="#f7931a" x={84} y={226} active />
      <Plate label="BUILDER GRANTS" color="#67e8a7" x={480} y={194} active />
      <Plate label="VALIDATORS" color="#8ab4ff" x={116} y={448} />
      <Plate label="BUDGETS" color="#ff004d" x={486} y={436} />
      <Beam from={[244, 274]} to={[320, 292]} color="#f7931a" />
      <Beam from={[480, 242]} to={[430, 288]} color="#67e8a7" delay={28} />
      <Beam from={[274, 492]} to={[348, 366]} color="#8ab4ff" delay={56} />
    </div>
  );
};

const ContinuationPath = ({ color, scale }: { color: string; scale: number }) => (
  <div style={stage}>
    <div style={stageFloor(color, scale)} />
    {["PRIZE", "FEEDBACK", "PILOT", "PRIMITIVE"].map((label, i) => (
      <div
        key={label}
        style={{
          position: "absolute",
          left: 104 + i * 132,
          top: 454 - i * 82,
          width: 126,
          height: 96,
          borderRadius: 18,
          display: "grid",
          placeItems: "center",
          background: i > 1 ? "rgba(247,147,26,0.16)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${i > 1 ? color : "rgba(255,255,255,0.18)"}`,
          color: i > 1 ? color : "rgba(255,255,255,0.66)",
          boxShadow: i > 1 ? `0 0 48px ${color}55` : "0 20px 42px rgba(0,0,0,0.3)",
          transform: `translateZ(${70 + i * 32}px)`,
          fontWeight: 900,
          fontSize: 17,
        }}
      >
        {label}
      </div>
    ))}
    <Beam from={[230, 488]} to={[606, 252]} color={color} delay={12} />
    <BrandMark kind="mezo" size={112} style={{ left: 594, top: 184, transform: "translateZ(180px)" }} />
  </div>
);

export const EvidenceLedger = ({ color }: { color: string }) => (
  <div style={{ position: "absolute", right: 86, top: 398, width: 660, height: 344, perspective: 1000, fontFamily: "Arial, sans-serif" }}>
    <div style={stageFloor(color, 1)} />
    <div style={{ position: "absolute", left: 142, top: 66, width: 410, height: 204, borderRadius: 22, background: "rgba(4,5,6,0.82)", border: `1px solid ${color}`, boxShadow: `0 0 70px ${color}45`, transform: "rotateX(16deg) translateZ(126px)", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.55)", fontSize: 16 }}>
        <span>MEZO TESTNET</span>
        <span>CHAIN 31611</span>
      </div>
      <div style={{ marginTop: 20, color: "#fff", fontSize: 30, fontWeight: 900 }}>AllocationUpdated</div>
      <div style={{ marginTop: 22, display: "grid", gap: 10 }}>
        {["contract state", "vote weights", "decoded event", "explorer link"].map((item, i) => (
          <div key={item} style={{ height: 26, borderRadius: 999, background: i > 1 ? `${color}26` : "rgba(255,255,255,0.08)", color: i > 1 ? color : "rgba(255,255,255,0.68)", padding: "4px 12px", fontWeight: 800, fontSize: 15 }}>
            {item.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
    <BrandMark kind="mezo" size={92} style={{ left: 62, top: 148, transform: "translateZ(176px)" }} />
    <BrandMark kind="musd" size={88} style={{ left: 528, top: 164, transform: "translateZ(178px)" }} />
  </div>
);

export const PitchVisual = ({ sceneId, color, scale }: VisualProps) => {
  if (sceneId === "tension") return <TrustBridge color={color} scale={scale} />;
  if (sceneId === "promise") return <GaugeRouter color={color} scale={scale} />;
  if (sceneId === "business") return <EcosystemMap color={color} scale={scale} />;
  if (sceneId === "team") return <ContinuationPath color={color} scale={scale} />;
  return <LiquidityEngine color={color} scale={scale} />;
};
