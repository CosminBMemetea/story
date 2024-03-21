'use client';

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";
import { Main } from "../remotion/MyComp/Main";
import axios from 'axios';

const ElevatedPolygonsGlobe = dynamic(
  () => import('../remotion/MyComp/ElevatedPolygonsGlobe'),
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
import { FileUpload } from "../components/FileUpload/FileUpload";
import AnonymousUserIdContext from './context/AnonymousUserIdContext';
import { v4 as uuidv4 } from 'uuid';
import dynamic from "next/dynamic";
const container: React.CSSProperties = {
  maxWidth: 768,
  margin: "auto",
  marginBottom: 20,
};

const titleContainer: React.CSSProperties = {
  textAlign: 'center',
  padding: '20px',
  backgroundColor: 'rgba(51, 51, 51, 0.8)',
  color: '#fff',
  fontSize: '24px', // Assuming you want to keep the font size similar to the existing style
  borderRadius: '8px',
  marginBottom: '20px',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  textShadow: '0px 0px 10px rgba(255, 255, 255, 0.5)',
};

const buttonStyle: React.CSSProperties = {
  display: 'block',
  margin: '20px auto',
  padding: '10px 20px',
  fontSize: '16px',
  borderRadius: '8px',
  cursor: 'pointer',
  backgroundColor: 'white',
  color: 'black',
  border: '2px solid black',
  textTransform: 'uppercase',
};

// Style for the globe container to ensure it fills the parent
const globeContainer: React.CSSProperties = {
  width: '100%', // Take the full width of the parent container
  height: '400px', // Set a fixed height or use '100%' if it should be fully responsive
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
  const [isClient, setIsClient] = useState(false);
  const [globeKey, setGlobeKey] = useState(0); // state to trigger re-render of the globe

  const [text, setText] = useState<string>(defaultMyCompProps.title);
  const [showCinematics, setShowCinematics] = useState<boolean>(false);

    // For example, in React component you can handle hover state like this:
  const [isHovered, setIsHovered] = useState(false);


  const handleFileUploaded = () => {
    setGlobeKey(prevKey => prevKey + 1); // Increment key to force re-render of the globe
  };

  const hoverStyle: React.CSSProperties = {
    backgroundColor: isHovered ? 'black' : 'white',
    color: isHovered ? 'white' : 'black',
  };

  useEffect(() => {
    // This code will run only in the client-side environment
    setIsClient(true);
  }, []);
  const inputProps: z.infer<typeof CompositionProps> = useMemo(() => {
    return {
      title: text,
    };
  }, [text]);

  const [anonymousUserId] = useState<string>(uuidv4());

  useEffect(() => {
    // Function to delete user data
    const deleteUserFiles = () => {
      if (anonymousUserId) {
        axios.delete('https://nomad-nexus-api.vercel.app/delete', {
            data: { anonymousUserId },
        })
        .then(() => console.log(`Files deleted for user ID: ${anonymousUserId}`))
        .catch((error: any) => console.error('Error deleting files:', error));
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
      deleteUserFiles(); // Attempt to delete on beforeunload but might not always complete
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on unmount or SPA navigation away
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      deleteUserFiles(); // Ensure deletion on SPA navigation or component unmount
    };
  }, [anonymousUserId]); // Depend on anonymousUserId to avoid re-running


  return (

    <AnonymousUserIdContext.Provider value={anonymousUserId}>
      <div style={container}>
        <div style={titleContainer}>Your story around the world in seconds</div>

        {isClient && (
          <div style={globeContainer}>
            <ElevatedPolygonsGlobe key={globeKey} width={766} height={400} />
          </div>
        )}

  
         <button
            style={{ ...buttonStyle, ...hoverStyle }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setShowCinematics(!showCinematics)}
          >
            {showCinematics ? 'Hide Video' : 'Show Video'}
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


        <Spacing />
        <FileUpload onFileUploaded={handleFileUploaded} />
        <Spacing />
        <Tips />
      </div>
    </AnonymousUserIdContext.Provider>
  );
};

export default Home;
