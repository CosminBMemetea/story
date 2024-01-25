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

import dynamic from 'next/dynamic';

// Correctly import NexusGlobe with dynamic and disable SSR
// const NexusGlobeNoSSR = dynamic(
//   () => import('./NexusGlobe').then((mod) => mod.NexusGlobe),
//   { ssr: false }
// );

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

  const transitionStart = 2 * fps;
  const transitionDuration = 1 * fps;

  const ringsAndLogoDuration = 3 * fps; // 3 seconds for Rings and NextLogo
  const textFadeStart = 1.5 * fps; // Starts 1.5 seconds into the video
  const textFadeDuration = 3 * fps; // 2 seconds for TextFade

  const globeStartFrame = ringsAndLogoDuration; // Start Globe after Rings and NextLogo
  const globeDuration = 5 * fps; // Display Globe for 5 seconds

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
  // const countriesData = [
  //   { name: "United States", lat: 37.0902, lng: -95.7129 }, // Coordinates for the United States
  //   { name: "Japan", lat: 36.2048, lng: 138.2529 },         // Coordinates for Japan
  //   { name: "France", lat: 46.2276, lng: 2.2137 }           // Coordinates for France
  // ];

const countriesData = [
    { name: 'United States', lat: 37.0902, lng: -95.7129, size: 10, color: 'red' }, // United States
    { name: 'Japan', lat: 36.2048, lng: 138.2529, size: 10, color: 'blue' }, // Japan
    { name: 'FR', lat: 46.2276, lng: 2.2137, size: 10, color: 'green' }, // France
    { name: 'RO', lat: 45.9432, lng: 24.9668, size: 10, color: 'yellow' }, // Romania
    { name: 'DE', lat: 51.1657, lng: 10.4515, size: 10, color: 'white' }, // Germany
    { name: 'UK', lat: 55.3781, lng: -3.4360, size: 10, color: 'purple' } // United Kingdom
];

  return(  
  <AbsoluteFill style={container}>
      <Sequence durationInFrames={ringsAndLogoDuration}>
        <Rings outProgress={logoOut} />
        <AbsoluteFill style={logo}>
          <NextLogo outProgress={logoOut} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={textFadeStart} durationInFrames={textFadeDuration}>
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
