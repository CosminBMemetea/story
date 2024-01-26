import { z } from "zod";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CompositionProps } from "../../types/constants";
import { NextLogo } from "./NextLogo";
import { loadFont, fontFamily } from "@remotion/google-fonts/Inter";
import React, { useMemo } from "react";
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

  const totalDurationInSeconds = 17;
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

  const titleStyle: React.CSSProperties = useMemo(() => {
    return { fontFamily, fontSize: 70 };
  }, []);

  // Settings for Globe
  // ... countriesData ...

const countriesData = [
    { name: '🇺🇸', lat: 37.0902, lng: -95.7129, size: 10, color: 'red' }, // United States
    { name: '🇯🇵', lat: 36.2048, lng: 138.2529, size: 10, color: 'blue' }, // Japan
    { name: '🇫🇷', lat: 46.2276, lng: 2.2137, size: 10, color: 'green' }, // France
    { name: '🇷🇴', lat: 45.9432, lng: 24.9668, size: 10, color: 'yellow' }, // Romania
    { name: '🇩🇪', lat: 51.1657, lng: 10.4515, size: 10, color: 'black' }, // Germany
    { name: '🇬🇧', lat: 55.3781, lng: -3.4360, size: 10, color: 'purple' }, // United Kingdom
    { name: '🇦🇪', lat: 23.4241, lng: 53.8478, size: 10, color: 'orange' }, // UAE
    { name: '🇹🇷', lat: 38.9637, lng: 35.2433, size: 10, color: 'lightblue' }, // Turkey
    { name: '🇪🇬', lat: 26.8206, lng: 30.8025, size: 10, color: 'darkgreen' }, // Egypt
    { name: '🇲🇦', lat: 31.7917, lng: -7.0926, size: 10, color: 'maroon' }, // Morocco
    { name: '🇪🇸', lat: 40.4637, lng: -3.7492, size: 10, color: 'red' }, // Spain
    { name: '🇮🇹', lat: 41.8719, lng: 12.5674, size: 10, color: 'green' }, // Italy
    { name: '🇬🇷', lat: 39.0742, lng: 21.8243, size: 10, color: 'blue' } // Greece
];


  return (
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
