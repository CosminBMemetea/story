import { z } from "zod";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CompositionProps } from "../../types/constants";
import { NextLogo } from "./NextLogo";
import { loadFont } from "@remotion/google-fonts/Inter";
import { Rings } from "./Rings";
import { TextFade } from "./TextFade";
import dynamic from 'next/dynamic';

const NexusGlobeNoSSR = dynamic(
  () => import('./MGlobe').then((mod) => mod.MGlobe),
  { ssr: false }
);
loadFont();

const container: React.CSSProperties = {
  backgroundColor: "white",
};

const logo: React.CSSProperties = {
  justifyContent: "center",
  alignItems: "center",
};

export const Main = ({ title }: z.infer<typeof CompositionProps>) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const totalDurationInSeconds = 23;
  const totalDurationInFrames = totalDurationInSeconds * fps;

  const ringsAndLogoDuration = 3 * fps; // 3 seconds for Rings and NextLogo
  const textFadeStart = ringsAndLogoDuration; // Start TextFade after Rings and NextLogo
  const textFadeDuration = 3 * fps; // 3 seconds for TextFade

  const globeStartFrame = textFadeStart + textFadeDuration; // Start Globe after TextFade
  const globeDuration = totalDurationInFrames - globeStartFrame; // Remaining time for Globe

  const logoOut = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
    durationInFrames: ringsAndLogoDuration,
    delay: 0,
  });


  // Settings for Globe
  // ... countriesData ...



  return (
    <AbsoluteFill style={container}>
      <Sequence durationInFrames={ringsAndLogoDuration}>
        <Rings outProgress={logoOut} />
        <AbsoluteFill style={logo}>
          <NextLogo outProgress={logoOut} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={textFadeStart} durationInFrames={textFadeDuration}>
        <TextFade title={title} subheading="Check out my story..."></TextFade>
      </Sequence>

      <Sequence from={globeStartFrame} durationInFrames={globeDuration}>
        <NexusGlobeNoSSR />
      </Sequence>
    </AbsoluteFill>
  );
};
