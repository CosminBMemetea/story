import { z } from "zod";
import {
  AbsoluteFill,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CompositionProps } from "../../types/constants";
import { NextLogo } from "./NextLogo";
import { loadFont, fontFamily } from "@remotion/google-fonts/Inter";
import React, { useMemo } from "react";
import { Rings } from "./Rings";
import { TextFade } from "./TextFade";
// import { NexusGlobe } from './NexusGlobe';

import dynamic from 'next/dynamic';

// Correctly import NexusGlobe with dynamic and disable SSR
const NexusGlobeNoSSR = dynamic(
  () => import('./NexusGlobe').then((mod) => mod.NexusGlobe),
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

  const transitionStart = 2 * fps;
  const transitionDuration = 1 * fps;

  const logoOut = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
    durationInFrames: transitionDuration,
    delay: transitionStart,
  });

  const titleStyle: React.CSSProperties = useMemo(() => {
    return { fontFamily, fontSize: 70 };
  }, []);

   // Settings for NexusGlobe
  const countriesData = [
    { name: "United States", lat: 37.0902, lng: -95.7129 }, // Coordinates for the United States
    { name: "Japan", lat: 36.2048, lng: 138.2529 },         // Coordinates for Japan
    { name: "France", lat: 46.2276, lng: 2.2137 }           // Coordinates for France
  ];
  const globeStartFrame = transitionStart + transitionDuration; // Start after logo transition
  const globeDuration = 5 * fps; // Display globe for 5 seconds
  return (
    <AbsoluteFill style={container}>
      <Sequence durationInFrames={transitionStart + transitionDuration}>
        <Rings outProgress={logoOut}></Rings>
        <AbsoluteFill style={logo}>
          <NextLogo outProgress={logoOut}></NextLogo>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={transitionStart + transitionDuration / 2}>
        <TextFade>
          <h1 style={titleStyle}>{title}</h1>
        </TextFade>
      </Sequence>

      <Sequence from={globeStartFrame} durationInFrames={globeDuration}>
        <NexusGlobeNoSSR countries={countriesData} />
      </Sequence>
    </AbsoluteFill>
  );
};
