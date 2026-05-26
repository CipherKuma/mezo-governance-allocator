import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

const rail = "rgba(247,147,26,0.36)";
const glass = "rgba(255,255,255,0.08)";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const CapitalRouterVisual = ({ scale, color }: { scale: number; color: string }) => {
  const frame = useCurrentFrame();
  const pulse = interpolate((frame % 96) / 96, [0, 0.5, 1], [0.18, 1, 0.18], clamp);
  const flow = interpolate(frame % 120, [0, 120], [-80, 520], clamp);

  return (
    <div
      style={{
        position: "absolute",
        right: 112,
        top: 188,
        width: 560,
        height: 520,
        transform: `scale(${0.94 + scale * 0.06})`,
        transformOrigin: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 8,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)), radial-gradient(circle at 50% 48%, rgba(103,232,167,0.16), transparent 44%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 36px 100px rgba(0,0,0,0.42)",
        }}
      />
      {[106, 214, 322, 430].map((top, index) => (
        <div key={top} style={{ position: "absolute", left: 54, right: 82, top }}>
          <div style={{ height: 2, background: rail, opacity: 0.58 }} />
          <div
            style={{
              position: "absolute",
              top: -4,
              left: (flow + index * 92) % 420,
              width: 64,
              height: 10,
              borderRadius: 999,
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              opacity: pulse,
            }}
          />
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: 228,
          top: 150,
          width: 126,
          height: 126,
          borderRadius: 8,
          background: "rgba(5,5,5,0.72)",
          border: `2px solid ${color}`,
          boxShadow: `0 0 ${32 + pulse * 24}px ${color}`,
          display: "grid",
          placeItems: "center",
        }}
      >
        <div style={{ color, fontSize: 20, letterSpacing: 0 }}>ALLOCATOR</div>
      </div>
      {["MUSD", "MEZO", "BTC", "PROOF"].map((label, index) => (
        <div
          key={label}
          style={{
            position: "absolute",
            left: index % 2 === 0 ? 72 : 390,
            top: index < 2 ? 72 : 340,
            width: 94,
            height: 94,
            borderRadius: 8,
            border: `1px solid ${index === 1 ? color : "rgba(255,255,255,0.18)"}`,
            background: glass,
            display: "grid",
            placeItems: "center",
            color: index === 1 ? color : "rgba(245,245,245,0.72)",
            fontSize: 20,
          }}
        >
          {label}
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: 138,
          right: 128,
          bottom: 58,
          height: 44,
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(5,5,5,0.5)",
          overflow: "hidden",
        }}
      >
        <div style={{ width: `${42 + pulse * 44}%`, height: "100%", background: color }} />
      </div>
    </div>
  );
};
