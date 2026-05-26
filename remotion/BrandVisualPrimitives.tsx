import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";

export const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const asset = {
  mezoMark: "assets/brand/mezo/Mezo Logo Circle.svg",
  musd: "assets/brand/musd/MUSD Token Logo.svg",
};

export const stage: React.CSSProperties = {
  position: "absolute",
  right: 72,
  top: 120,
  width: 760,
  height: 690,
  perspective: 1200,
  fontFamily: "Arial, sans-serif",
};

export const stageFloor = (color: string, scale: number): React.CSSProperties => ({
  position: "absolute",
  left: 56,
  top: 242,
  width: 640,
  height: 320,
  borderRadius: 28,
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.105), rgba(255,255,255,0.02)), linear-gradient(90deg, rgba(255,0,77,0.12), rgba(247,147,26,0.09), rgba(103,232,167,0.07))",
  border: "1px solid rgba(255,255,255,0.16)",
  boxShadow: `0 70px 130px rgba(0,0,0,0.58), 0 0 110px ${color}28`,
  transform: `rotateX(62deg) rotateZ(-7deg) scale(${0.94 + scale * 0.06})`,
  transformStyle: "preserve-3d",
});

export const BrandMark = ({
  kind,
  size,
  style,
}: {
  kind: "mezo" | "musd";
  size: number;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: size / 2,
      display: "grid",
      placeItems: "center",
      background: "rgba(0,0,0,0.54)",
      border: "1px solid rgba(255,255,255,0.18)",
      boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
      ...style,
    }}
  >
    <Img
      src={staticFile(kind === "mezo" ? asset.mezoMark : asset.musd)}
      style={{ width: size * 0.72, height: size * 0.72, objectFit: "contain" }}
    />
  </div>
);

export const BitcoinCoin = ({
  size,
  style,
}: {
  size: number;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: size / 2,
      display: "grid",
      placeItems: "center",
      color: "#1f1300",
      fontSize: size * 0.62,
      fontWeight: 900,
      background:
        "radial-gradient(circle at 34% 28%, #ffe2a8, #f7931a 48%, #8f4d00 100%)",
      border: "2px solid rgba(255,226,168,0.72)",
      boxShadow:
        "0 28px 70px rgba(247,147,26,0.34), inset 0 -12px 26px rgba(0,0,0,0.25)",
      ...style,
    }}
  >
    ₿
  </div>
);

export const Beam = ({
  from,
  to,
  color,
  delay = 0,
}: {
  from: [number, number];
  to: [number, number];
  color: string;
  delay?: number;
}) => {
  const frame = useCurrentFrame();
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const travel = interpolate((frame + delay) % 90, [0, 90], [-70, length + 20], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: from[0],
        top: from[1],
        width: length,
        height: 4,
        transform: `rotate(${angle}deg) translateZ(70px)`,
        transformOrigin: "0 50%",
        background: "rgba(255,255,255,0.13)",
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: travel,
          top: -3,
          width: 92,
          height: 10,
          borderRadius: 999,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          boxShadow: `0 0 24px ${color}`,
        }}
      />
    </div>
  );
};

export const Plate = ({
  label,
  value,
  color,
  x,
  y,
  active,
}: {
  label: string;
  value?: string;
  color: string;
  x: number;
  y: number;
  active?: boolean;
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 160,
      height: 94,
      borderRadius: 16,
      padding: "16px 18px",
      background: active ? `${color}16` : "rgba(7,7,8,0.68)",
      border: `1px solid ${active ? color : "rgba(255,255,255,0.18)"}`,
      color: active ? color : "rgba(245,245,245,0.74)",
      boxShadow: active ? `0 0 46px ${color}55` : "0 18px 44px rgba(0,0,0,0.34)",
      transform: "translateZ(96px)",
    }}
  >
    <div style={{ fontSize: 17, fontWeight: 900 }}>{label}</div>
    {value && <div style={{ marginTop: 12, color: "#fff", fontSize: 24 }}>{value}</div>}
  </div>
);
