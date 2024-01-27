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

const countriesData = [
    { name: '🇺🇸', lat: 37.0902, lng: -95.7129, size: 10, color: 'red' }, // United States
    { name: '🇯🇵', lat: 36.2048, lng: 138.2529, size: 10, color: 'blue' }, // Japan
    { name: '🇫🇷', lat: 46.2276, lng: 2.2137, size: 10, color: 'green' }, // France
    { name: '🇷🇴', lat: 45.9432, lng: 24.9668, size: 30, color: 'yellow' }, // Romania
    { name: '🇩🇪', lat: 51.1657, lng: 10.4515, size: 10, color: 'black' }, // Germany
    { name: '🇬🇧', lat: 55.3781, lng: -3.4360, size: 10, color: 'purple' }, // United Kingdom
    { name: '🇦🇪', lat: 23.4241, lng: 53.8478, size: 10, color: 'orange' }, // UAE
    { name: '🇹🇷', lat: 38.9637, lng: 35.2433, size: 10, color: 'lightblue' }, // Turkey
    { name: '🇪🇬', lat: 26.8206, lng: 30.8025, size: 10, color: 'darkgreen' }, // Egypt
    { name: '🇲🇦', lat: 31.7917, lng: -7.0926, size: 10, color: 'maroon' }, // Morocco
    { name: '🇪🇸', lat: 40.4637, lng: -3.7492, size: 10, color: 'red' }, // Spain
    { name: '🇮🇹', lat: 41.8719, lng: 12.5674, size: 10, color: 'green' }, // Italy
    { name: '🇬🇷', lat: 39.0742, lng: 21.8243, size: 10, color: 'blue' }, // Greece
    { name: '🇧🇷', lat: -14.2350, lng: -51.9253, size: 10, color: 'green' }, // Brazil
    { name: '🇨🇳', lat: 35.8617, lng: 104.1954, size: 10, color: 'red' }, // China
    { name: '🇮🇳', lat: 20.5937, lng: 78.9629, size: 10, color: 'orange' }, // India
    { name: '🇷🇺', lat: 61.5240, lng: 105.3188, size: 10, color: 'blue' }, // Russia
    { name: '🇿🇦', lat: -30.5595, lng: 22.9375, size: 10, color: 'yellow' }, // South Africa
    { name: '🇦🇷', lat: -38.4161, lng: -63.6167, size: 10, color: 'lightblue' }, // Argentina
    { name: '🇨🇦', lat: 56.1304, lng: -106.3468, size: 10, color: 'red' }, // Canada
    { name: '🇦🇺', lat: -25.2744, lng: 133.7751, size: 10, color: 'green' }, // Australia
    { name: '🇳🇬', lat: 9.0820, lng: 8.6753, size: 10, color: 'green' }, // Nigeria
    { name: '🇲🇽', lat: 23.6345, lng: -102.5528, size: 10, color: 'red' }, // Mexico
    { name: '🇰🇷', lat: 35.9078, lng: 127.7669, size: 10, color: 'blue' }, // South Korea
    { name: '🇸🇦', lat: 23.8859, lng: 45.0792, size: 10, color: 'green' }, // Saudi Arabia
    { name: '🇮🇩', lat: -0.7893, lng: 113.9213, size: 10, color: 'red' }, // Indonesia

     // Central America
    { name: '🇧🇿', lat: 17.1899, lng: -88.4976, size: 10, color: 'blue' }, // Belize
    { name: '🇨🇷', lat: 9.7489, lng: -83.7534, size: 10, color: 'red' }, // Costa Rica
    { name: '🇸🇻', lat: 13.7942, lng: -88.8965, size: 10, color: 'blue' }, // El Salvador
    { name: '🇬🇹', lat: 15.7835, lng: -90.2308, size: 10, color: 'green' }, // Guatemala
    { name: '🇭🇳', lat: 15.2000, lng: -86.2419, size: 10, color: 'purple' }, // Honduras

    // Africa
    { name: '🇳🇬', lat: 9.0820, lng: 8.6753, size: 10, color: 'green' }, // Nigeria
    { name: '🇪🇬', lat: 26.8206, lng: 30.8025, size: 10, color: 'darkgreen' }, // Egypt
    { name: '🇿🇦', lat: -30.5595, lng: 22.9375, size: 10, color: 'yellow' }, // South Africa
    { name: '🇰🇪', lat: -0.0236, lng: 37.9062, size: 10, color: 'red' }, // Kenya
    { name: '🇲🇦', lat: 31.7917, lng: -7.0926, size: 10, color: 'maroon' }, // Morocco
    { name: '🇬🇭', lat: 7.9465, lng: -1.0232, size: 10, color: 'yellow' }, // Ghana
    { name: '🇺🇬', lat: 1.3733, lng: 32.2903, size: 10, color: 'black' }, // Uganda
    { name: '🇦🇴', lat: -11.2027, lng: 17.8739, size: 10, color: 'red' }, // Angola
    { name: '🇨🇮', lat: 7.5400, lng: -5.5471, size: 10, color: 'orange' }, // Ivory Coast
    { name: '🇸🇳', lat: 14.4974, lng: -14.4524, size: 10, color: 'green' }, // Senegal

    // Asia
    { name: '🇨🇳', lat: 35.8617, lng: 104.1954, size: 10, color: 'red' }, // China
    { name: '🇮🇳', lat: 20.5937, lng: 78.9629, size: 10, color: 'orange' }, // India
    { name: '🇯🇵', lat: 36.2048, lng: 138.2529, size: 10, color: 'blue' }, // Japan
    { name: '🇰🇷', lat: 35.9078, lng: 127.7669, size: 10, color: 'blue' }, // South Korea
    { name: '🇻🇳', lat: 14.0583, lng: 108.2772, size: 10, color: 'red' }, // Vietnam
    { name: '🇹🇭', lat: 15.8700, lng: 100.9925, size: 10, color: 'blue' }, // Thailand
    { name: '🇲🇾', lat: 4.2105, lng: 101.9758, size: 10, color: 'yellow' }, // Malaysia
    { name: '🇵🇭', lat: 12.8797, lng: 121.7740, size: 10, color: 'blue' }, // Philippines
    { name: '🇮🇩', lat: -0.7893, lng: 113.9213, size: 10, color: 'red' }, // Indonesia
    { name: '🇸🇬', lat: 1.3521, lng: 103.8198, size: 10, color: 'red' }, // Singapore

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
        <TextFade title={title} subheading="Check out my story..."></TextFade>
      </Sequence>

      <Sequence from={globeStartFrame} durationInFrames={globeDuration}>
        <NexusGlobeNoSSR countries={countriesData} />
      </Sequence>
    </AbsoluteFill>
  );
};
