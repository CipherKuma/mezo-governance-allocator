import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

const clipStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const veil =
  "linear-gradient(90deg, rgba(5,5,5,0.82), rgba(5,5,5,0.2) 52%, rgba(5,5,5,0.76))";

type ClipProps = {
  src: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  startVisible?: boolean;
  holdToEnd?: boolean;
};

const AiClip = ({
  src,
  eyebrow,
  title,
  subtitle,
  align = "left",
  startVisible = false,
  holdToEnd = false,
}: ClipProps) => {
  const frame = useCurrentFrame();
  const opacity = holdToEnd
    ? interpolate(frame, [0, 12], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : startVisible
      ? interpolate(frame, [84, 96], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : interpolate(frame, [0, 12, 84, 96], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const textY = interpolate(frame, [0, 24], [22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity, background: "#050505" }}>
      <OffthreadVideo src={staticFile(src)} muted style={clipStyle} />
      <AbsoluteFill style={{ background: veil }} />
      <div
        style={{
          position: "absolute",
          left: align === "center" ? 0 : 112,
          right: align === "center" ? 0 : 112,
          bottom: align === "center" ? 148 : 138,
          textAlign: align,
          transform: `translateY(${textY}px)`,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ color: "#67e8a7", fontSize: 26, marginBottom: 16 }}>
          {eyebrow}
        </div>
        <div
          style={{
            color: "#f5f5f5",
            fontSize: align === "center" ? 86 : 72,
            fontWeight: 700,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              color: "rgba(245,245,245,0.7)",
              fontSize: 28,
              marginTop: 18,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const AiVideoInserts = ({ publicUrl }: { publicUrl: string }) => (
  <>
    <Sequence from={0} durationInFrames={96}>
      <AiClip
        src="assets/ai-video/ai-01-cold-open-liquidity.mp4"
        eyebrow="MEZO Utilization"
        title="Borealis routes MUSD."
        subtitle="MEZO signals become verifiable capital operations."
        startVisible
      />
    </Sequence>
    <Sequence from={1008} durationInFrames={96}>
      <AiClip
        src="assets/ai-video/ai-02-demo-transition-gauges.mp4"
        eyebrow="Demo"
        title="Signals become allocations."
        subtitle="Now cut to the real product."
      />
    </Sequence>
    <Sequence from={4151} durationInFrames={169}>
      <AiClip
        src="assets/ai-video/ai-03-final-ecosystem-sting.mp4"
        eyebrow="Borealis"
        title="MEZO-powered MUSD routing"
        subtitle={publicUrl}
        align="center"
        holdToEnd
      />
    </Sequence>
  </>
);
