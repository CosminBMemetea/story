"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";
import { Main } from "../remotion/MyComp/Main";
import axios from 'axios';

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
import { FileUpload } from "../components/FileUpload/FileUpload";
import AnonymousUserIdContext from './context/AnonymousUserIdContext';
import { v4 as uuidv4 } from 'uuid';
const container: React.CSSProperties = {
  maxWidth: 768,
  margin: "auto",
  marginBottom: 20,
};
const incontainer: React.CSSProperties = {
  margin: "auto",
  marginBottom: 0,
  border: '1px solid #ffffff', // White border
  padding: '0px', // No padding
  textAlign: 'center', // Center text alignment
  cursor: 'pointer', // Pointer cursor on hover
  backgroundColor: '#020204', // Dark background color
  borderRadius: '8px', // Rounded corners
  transition: 'all 0.3s ease-in-out', // Smooth transition for hover effect
};

const outer: React.CSSProperties = {
  borderRadius: "var(--geist-border-radius)",
  overflow: "hidden",
  boxShadow: "0 0 200px rgba(0, 0, 0, 0.15)",
  marginBottom: 40,
  marginTop: 60,
};

const player: React.CSSProperties = {
  width: "100%",
};

const Home: NextPage = () => {
  const [text, setText] = useState<string>(defaultMyCompProps.title);

  const inputProps: z.infer<typeof CompositionProps> = useMemo(() => {
    return {
      title: text,
    };
  }, [text]);
  const anonymousUserId = uuidv4();


   useEffect(() => {
    const handleBeforeUnload = (event: { preventDefault: () => void; returnValue: string; }) => {
      // Show a confirmation dialog
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave? Changes you made may not be saved.';

      // Asynchronously call the delete API
      if (anonymousUserId) {
        axios.delete('http://localhost:8000/delete', {
          data: { anonymousUserId },
        }).catch((error) => {
          console.error('Error deleting files:', error);
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [anonymousUserId]);


  return (
    <AnonymousUserIdContext.Provider value={anonymousUserId}>
    <div>
      <div style={container}>
        <div style={incontainer}>
        <div className="cinematics" style={outer}>
          <Player
            component={Main}
            inputProps={inputProps}
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
        <Spacing></Spacing>
        <Spacing></Spacing>

        <RenderControls
          text={text}
          setText={setText}
          inputProps={inputProps}
        ></RenderControls>
        <Spacing></Spacing>
        <Spacing></Spacing>
        <Spacing></Spacing>
        <FileUpload  />
        <Spacing></Spacing>
        <Spacing></Spacing>
        <Spacing></Spacing>
        <Tips></Tips>
      </div>
    </div>
    </AnonymousUserIdContext.Provider>
  );
};

export default Home;
