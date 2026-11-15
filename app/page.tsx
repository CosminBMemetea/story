"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";
import { Main } from "../remotion/MyComp/Main";

const ElevatedPolygonsGlobe = dynamic(
  () => import("../remotion/MyComp/ElevatedPolygonsGlobe"),
  { ssr: false }
);
import {
  CompositionProps,
  defaultMyCompProps,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../types/constants";
import { z } from "zod";
import { RenderControls } from "../components/RenderControls";
import { Tips } from "../components/Tips/Tips";
import { Spacing } from "../components/Spacing";
import { FileUpload, PhotoResult } from "../components/FileUpload/FileUpload";
import { SAMPLE_TRIP, VisitedCountry } from "../lib/countries";
import { VisitedCountriesContext } from "../lib/visited-countries-context";
import dynamic from "next/dynamic";
const container: React.CSSProperties = {
  maxWidth: 768,
  margin: "auto",
  marginBottom: 20,
};

const titleContainer: React.CSSProperties = {
  textAlign: "center",
  padding: "20px",
  backgroundColor: "rgba(51, 51, 51, 0.8)",
  color: "#fff",
  fontSize: "24px", // Assuming you want to keep the font size similar to the existing style
  borderRadius: "8px",
  marginBottom: "20px",
  backdropFilter: "blur(5px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  textShadow: "0px 0px 10px rgba(255, 255, 255, 0.5)",
};

const buttonStyle: React.CSSProperties = {
  display: "block",
  margin: "20px auto",
  padding: "10px 20px",
  fontSize: "16px",
  borderRadius: "8px",
  cursor: "pointer",
  backgroundColor: "white",
  color: "black",
  border: "2px solid black",
  textTransform: "uppercase",
};

const incontainer: React.CSSProperties = {
  margin: "auto",
  marginBottom: 0,
  border: "1px solid #ffffff", // White border
  padding: "0px", // No padding
  textAlign: "center", // Center text alignment
  cursor: "pointer", // Pointer cursor on hover
  backgroundColor: "#020204", // Dark background color
  borderRadius: "8px", // Rounded corners
  transition: "all 0.3s ease-in-out", // Smooth transition for hover effect
};

const outer: React.CSSProperties = {
  borderRadius: "var(--geist-border-radius)",
  overflow: "hidden",
  boxShadow: "0 0 200px rgba(0, 0, 0, 0.15)",
  marginBottom: 40,
  marginTop: 60,
};

const statsStyle: React.CSSProperties = {
  textAlign: "center",
  color: "var(--subtitle)",
  margin: "8px 0",
};

const linkButtonStyle: React.CSSProperties = {
  display: "block",
  margin: "0 auto",
  background: "none",
  border: "none",
  color: "var(--subtitle)",
  textDecoration: "underline",
  cursor: "pointer",
  fontSize: 14,
};

const player: React.CSSProperties = {
  width: "100%",
};

const Home: NextPage = () => {
  const [isClient, setIsClient] = useState(false);

  const [text, setText] = useState<string>(defaultMyCompProps.title);
  const [showCinematics, setShowCinematics] = useState<boolean>(false);

  const [isHovered, setIsHovered] = useState(false);

  const hoverStyle: React.CSSProperties = {
    backgroundColor: isHovered ? "black" : "white",
    color: isHovered ? "white" : "black",
  };

  const [globeWidth, setGlobeWidth] = useState(766);

  useEffect(() => {
    // This code will run only in the client-side environment
    setIsClient(true);
    const fit = () => setGlobeWidth(Math.min(766, window.innerWidth - 34));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  const inputProps: z.infer<typeof CompositionProps> = useMemo(() => {
    return {
      title: text,
    };
  }, [text]);

  const [photos, setPhotos] = useState<PhotoResult[]>([]);
  const [useSampleTrip, setUseSampleTrip] = useState(false);

  // Unique countries, in the order they were first seen.
  const visited = useMemo<VisitedCountry[]>(() => {
    const all = [
      ...(useSampleTrip ? SAMPLE_TRIP : []),
      ...photos.flatMap((p) => (p.country ? [p.country] : [])),
    ];
    return all.filter((c, i) => all.findIndex((x) => x.code === c.code) === i);
  }, [photos, useSampleTrip]);

  return (
    <VisitedCountriesContext.Provider value={visited}>
      <div style={container}>
        <div style={titleContainer}>Your story around the world in seconds</div>

        {isClient && (
          <div style={incontainer}>
            <div className="cinematics" style={outer}>
              <ElevatedPolygonsGlobe width={globeWidth} height={400} />
            </div>
          </div>
        )}
        <Spacing />
        <Spacing />
        <p style={statsStyle}>
          {visited.length === 0
            ? "Add geotagged photos to light up the countries you have visited."
            : `${visited.length} ${
                visited.length === 1 ? "country" : "countries"
              } visited: ${visited.map((c) => c.name).join(", ")}`}
        </p>
        <button
          style={linkButtonStyle}
          onClick={() => setUseSampleTrip((v) => !v)}
        >
          {useSampleTrip
            ? "Remove sample trip"
            : "No geotagged photos? Try a sample trip"}
        </button>
        <Spacing />
        <FileUpload photos={photos} onPhotosChange={setPhotos} />
        <Spacing />

        <button
          style={{ ...buttonStyle, ...hoverStyle }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setShowCinematics(!showCinematics)}
        >
          {showCinematics ? "Hide Video" : "Show Video"}
        </button>

        {showCinematics && (
          <>
            <div style={incontainer}>
              <div className="cinematics" style={outer}>
                <Player
                  component={Main}
                  inputProps={{ title: text }}
                  durationInFrames={DURATION_IN_FRAMES}
                  fps={VIDEO_FPS}
                  compositionHeight={VIDEO_HEIGHT}
                  compositionWidth={VIDEO_WIDTH}
                  style={player}
                  controls
                  autoPlay
                  loop
                />
              </div>
            </div>
            <Spacing />
            <RenderControls
              text={text}
              setText={setText}
              inputProps={inputProps}
            ></RenderControls>
          </>
        )}

        <Tips />
      </div>
    </VisitedCountriesContext.Provider>
  );
};

export default Home;
