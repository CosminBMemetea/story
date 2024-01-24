import React, { useEffect, useState, useMemo, useContext } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import AnonymousUserIdContext from "../../app/context/AnonymousUserIdContext";

export const TextFade:  React.FC<{
  children: React.ReactNode;
}>= ({ children }) => {
  const anonymousUserId = useContext(AnonymousUserIdContext); // Make sure that is the first line in a component

  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    if (!anonymousUserId) {
        console.log('Anonymous user ID not found');
        setError('User ID not found');
        return;
    }
    const fetchCountries = async () => {
      try {
        const response = await fetch(`http://localhost:8000/getCountries?anonymousUserId=${anonymousUserId}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setCountries([]);

      }
    };

    fetchCountries();
  }, []);

  const progress = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
    durationInFrames: 80,
  });

  const rightStop = interpolate(progress, [0, 1], [200, 0]);
  const leftStop = Math.max(0, rightStop - 60);

  const maskImage = `linear-gradient(-45deg, transparent ${leftStop}%, black ${rightStop}%)`;

  const outer: React.CSSProperties = {};

  const container: React.CSSProperties = useMemo(() => {
    return {
      justifyContent: "center",
      alignItems: "center",
    };
  }, []);

  const content: React.CSSProperties = useMemo(() => {
    return {
      maskImage,
      WebkitMaskImage: maskImage,
    };
  }, [maskImage]);

  return (
    <AbsoluteFill style={outer}>
      <AbsoluteFill style={container}>
        <div style={content}>{children}</div>
        <div style={content}>
          {countries.map((country, index) => (
            <p key={index}>{country}</p>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

function setError(arg0: string) {
  throw new Error("Function not implemented.");
}

