import React, { useCallback, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont, fontFamily } from "@remotion/google-fonts/Inter";

loadFont();

export const TextFade: React.FC<{
  title: string;
  subheading?: string;
}> = ({ title, subheading }) => {
  const { fps, width, height } = useVideoConfig();
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


  const getResponsiveFontSize = useCallback((baseSize: number) => {
    const minSize = 16;
    const maxSize = 80;
    const ratio = width / height;

    const adjustedBaseSize = baseSize * (ratio > 1.5 ? 1.5 : ratio);

    const fontSize = Math.max(
      minSize,
      Math.min(adjustedBaseSize, maxSize)
    );

    return `${fontSize}px`;
  }, [width, height]);

  const titleStyle: React.CSSProperties = useMemo(() => ({
    fontFamily,
    fontSize: getResponsiveFontSize(40), // Adjust baseSize and maxFontSize as needed
    color: '#FFF',
    textAlign: 'center',
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    WebkitMaskImage: maskImage,
    maskImage,
  }), [maskImage, getResponsiveFontSize]);

  const subheadingStyle: React.CSSProperties = useMemo(() => ({
    fontFamily,
    fontSize: getResponsiveFontSize(30), // Adjust baseSize and maxFontSize as needed
    color: '#aaa',
    textAlign: 'right',
    position: 'absolute',
    bottom: '10vh', // 10% from the bottom of the viewport
    right: '10vw', // 10% from the right of the viewport
    WebkitMaskImage: maskImage,
    maskImage,
  }), [maskImage, getResponsiveFontSize]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000011', overflow: 'hidden' }}>
      <h1 style={titleStyle}>{title}</h1>
      {subheading && <h2 style={subheadingStyle}>{subheading}</h2>}
    </AbsoluteFill>
  );
};
