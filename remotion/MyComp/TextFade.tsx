import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont, fontFamily } from "@remotion/google-fonts/Inter";

loadFont();

export const TextFade: React.FC<{
  title: string;
  subheading?: string;
}> = ({ title, subheading }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

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

  const titleStyle: React.CSSProperties = useMemo(() => ({
    fontFamily,
    fontSize: '4.5vw', // Responsive font size
    color: '#FFF',
    textAlign: 'center',
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    WebkitMaskImage: maskImage,
    maskImage,
  }), [maskImage]);

  const subheadingStyle: React.CSSProperties = useMemo(() => ({
    fontFamily,
    fontSize: '2vw', // Responsive font size
    color: '#aaa',
    textAlign: 'right',
    position: 'absolute',
    bottom: '10vh', // 10% from the bottom of the viewport
    right: '10vw', // 10% from the right of the viewport
    WebkitMaskImage: maskImage,
    maskImage,
  }), [maskImage]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000011', overflow: 'hidden' }}>
      <h1 style={titleStyle}>{title}</h1>
      {subheading && <h2 style={subheadingStyle}>{subheading}</h2>}
    </AbsoluteFill>
  );
};
