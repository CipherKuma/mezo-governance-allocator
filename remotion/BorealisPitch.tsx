import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AiVideoInserts } from "./AiVideoInserts";
import { EvidenceLedger, PitchVisual } from "./SlideVisuals";
import type { DemoSlot, Scene } from "./pitchData";

export type BorealisPitchProps = {
  publicUrl: string;
  githubUrl: string;
  chainId: string;
  compositionDate: string;
  demoSlots: DemoSlot[];
  scenes: Scene[];
};

const colors = {
  bg: "#050505",
  panel: "#101012",
  line: "rgba(255,255,255,0.14)",
  text: "#f5f5f5",
  muted: "rgba(245,245,245,0.62)",
  btc: "#f7931a",
  musd: "#67e8a7",
  mezo: "#ff004d",
  proof: "#d8b4fe",
};

const VOICEOVER_PLAYBACK_RATE = 186.30525 / 180;

const fade = (frame: number, start = 0, end = 18) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const yIn = (frame: number) =>
  interpolate(frame, [0, 24], [28, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const accent = (scene?: Scene) => colors[scene?.accent ?? "mezo"];

const Shell = ({
  scene,
  children,
}: {
  scene?: Scene;
  children: React.ReactNode;
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;
  return (
    <AbsoluteFill style={{ background: colors.bg, color: colors.text }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(118deg, rgba(255,0,77,0.12), transparent 28%), linear-gradient(245deg, rgba(247,147,26,0.13), transparent 34%), linear-gradient(180deg, #050505 0%, #070908 58%, #030303 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.24,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          maskImage:
            "linear-gradient(90deg, transparent, black 14%, black 74%, transparent)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          top: 42,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "Arial, sans-serif",
          fontSize: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Img
            src={staticFile("assets/brand/mezo/Mezo Logo White.svg")}
            style={{ width: 126, height: 28, objectFit: "contain" }}
          />
          <span style={{ color: colors.muted, fontWeight: 700 }}>BOREALIS</span>
        </div>
        <span style={{ color: colors.muted }}>Mezo Hackathon Pitch</span>
      </div>
      {scene && (
        <div
          style={{
            position: "absolute",
            left: 64,
            bottom: 46,
            color: colors.muted,
            fontFamily: "Arial, sans-serif",
            fontSize: 22,
          }}
        >
          {scene.beat}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 30,
          height: 4,
          background: "rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: scene ? accent(scene) : colors.btc,
          }}
        />
      </div>
      {children}
    </AbsoluteFill>
  );
};

const TitleScene = ({ scene }: { scene: Scene }) => {
  const frame = useCurrentFrame();
  const scale = spring({
    frame,
    fps: 24,
    config: { damping: 18, stiffness: 110 },
  });
  const titleSize =
    scene.title.length > 72 ? 68 : scene.title.length > 54 ? 76 : 92;
  return (
    <Shell scene={scene}>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 210,
          width: 940,
          opacity: fade(frame),
          transform: `translateY(${yIn(frame)}px)`,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ color: accent(scene), fontSize: 28, marginBottom: 28 }}>
          {scene.kicker}
        </div>
        <h1
          style={{
            fontSize: titleSize,
            lineHeight: 1.04,
            margin: 0,
            letterSpacing: 0,
          }}
        >
          {scene.title}
        </h1>
        <p
          style={{
            color: colors.muted,
            fontSize: 34,
            lineHeight: 1.32,
            width: 880,
          }}
        >
          {scene.narration}
        </p>
      </div>
      <PitchVisual sceneId={scene.id} scale={scale} color={accent(scene)} />
    </Shell>
  );
};

const DemoScene = ({ scene }: { scene: Scene; slots: DemoSlot[] }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: colors.bg }}>
      <OffthreadVideo
        src={staticFile("demo.mp4")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: "linear-gradient(to top, rgba(5,5,5,0.9), transparent)",
          display: "flex",
          alignItems: "flex-end",
          padding: "0 48px 18px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <span
          style={{
            fontSize: 18,
            color: colors.musd,
            opacity: fade(frame, 0, 24),
          }}
        >
          Live demo · Mezo Testnet (chain 31611)
        </span>
      </div>
    </AbsoluteFill>
  );
};

const ProofScene = ({ scene, chainId }: { scene: Scene; chainId: string }) => (
  <Shell scene={scene}>
    <div
      style={{
        position: "absolute",
        left: 114,
        top: 150,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ color: accent(scene), fontSize: 28, marginBottom: 22 }}>
        {scene.kicker}
      </div>
      <h2 style={{ fontSize: 62, margin: 0 }}>{scene.title}</h2>
      <p style={{ color: colors.muted, fontSize: 30, width: 1080 }}>
        {scene.narration}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 18,
          width: 900,
        }}
      >
        <Metric label="Network" value={`Mezo ${chainId}`} color={colors.btc} />
        <Metric
          label="State change"
          value="AllocationUpdated"
          color={colors.mezo}
        />
        <Metric label="Receipts" value="Vote + weights" color={colors.musd} />
        <Metric label="Explorer" value="Open proof" color={colors.proof} />
      </div>
    </div>
    <EvidenceLedger color={accent(scene)} />
  </Shell>
);

const Metric = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        border: `1px solid ${colors.line}`,
        borderRadius: 8,
        background: colors.panel,
        padding: 26,
        transform: `translateY(${interpolate(frame, [0, 20], [24, 0], { extrapolateRight: "clamp" })}px)`,
        opacity: fade(frame),
      }}
    >
      <div style={{ color, fontSize: 22 }}>{label}</div>
      <div style={{ fontSize: value.length > 14 ? 32 : 42, marginTop: 18 }}>
        {value}
      </div>
    </div>
  );
};

export const BorealisPitch = ({
  scenes,
  demoSlots,
  chainId,
  publicUrl,
}: BorealisPitchProps) => {
  const byId = Object.fromEntries(scenes.map((scene) => [scene.id, scene]));
  return (
    <AbsoluteFill>
      <Sequence
        from={byId.hook.from}
        durationInFrames={byId.hook.duration}
        premountFor={24}
      >
        <TitleScene scene={byId.hook} />
      </Sequence>
      <Sequence
        from={byId.tension.from}
        durationInFrames={byId.tension.duration}
        premountFor={24}
      >
        <TitleScene scene={byId.tension} />
      </Sequence>
      <Sequence
        from={byId.promise.from}
        durationInFrames={byId.promise.duration}
        premountFor={24}
      >
        <TitleScene scene={byId.promise} />
      </Sequence>
      <Sequence
        from={byId.demo.from}
        durationInFrames={byId.demo.duration}
        premountFor={24}
      >
        <DemoScene scene={byId.demo} slots={demoSlots} />
      </Sequence>
      <Sequence
        from={byId.proof.from}
        durationInFrames={byId.proof.duration}
        premountFor={24}
      >
        <ProofScene scene={byId.proof} chainId={chainId} />
      </Sequence>
      <Sequence
        from={byId.business.from}
        durationInFrames={byId.business.duration}
        premountFor={24}
      >
        <TitleScene scene={byId.business} />
      </Sequence>
      <Sequence
        from={byId.team.from}
        durationInFrames={byId.team.duration}
        premountFor={24}
      >
        <TitleScene scene={byId.team} />
      </Sequence>
      <Sequence
        from={byId.sting.from}
        durationInFrames={byId.sting.duration}
        premountFor={24}
      >
        <Shell scene={byId.sting}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
            }}
          >
            <div
              style={{ textAlign: "center", fontFamily: "Arial, sans-serif" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 28,
                }}
              >
                <Img
                  src={staticFile("assets/brand/mezo/Mezo Logo Circle.svg")}
                  style={{ width: 118, height: 118, objectFit: "contain" }}
                />
              </div>
              <div style={{ color: colors.btc, fontSize: 34, fontWeight: 800 }}>
                MEZO Utilization
              </div>
              <h1 style={{ fontSize: 132, margin: "18px 0", letterSpacing: 0 }}>
                Borealis
              </h1>
              <p style={{ color: colors.muted, fontSize: 34 }}>
                {byId.sting.kicker}
              </p>
              <p style={{ color: colors.musd, fontSize: 28 }}>{publicUrl}</p>
            </div>
          </div>
        </Shell>
      </Sequence>
      <AiVideoInserts publicUrl={publicUrl} />
      <Audio
        src={staticFile("assets/audio/borealis.mp3")}
        playbackRate={VOICEOVER_PLAYBACK_RATE}
        volume={1}
      />
    </AbsoluteFill>
  );
};
