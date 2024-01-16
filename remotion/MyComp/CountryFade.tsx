import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const CountryFade: React.FC<{ countries: string[] }> = ({ countries }) => {
    const { fps, durationInFrames } = useVideoConfig();
    const frame = useCurrentFrame();

    const countryIndex = Math.floor(interpolate(frame, [0, durationInFrames], [0, countries.length]));
    const currentCountry = countries[countryIndex % countries.length]; // Loop through countries

    const progress = spring({
        fps,
        frame,
        config: { damping: 200 },
        from: 0,
        to: 1,
        durationInFrames: 30,
    });

    const opacity = interpolate(progress, [0, 1], [0, 1]);

    const containerStyle: React.CSSProperties = useMemo(() => ({
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        height: '100%',
    }), []);

    const countryStyle: React.CSSProperties = useMemo(() => ({
        fontSize: '40px',
        color: 'white',
        opacity,
        transition: 'opacity 0.5s',
    }), [opacity]);

    return (
        <AbsoluteFill style={containerStyle}>
            <div style={countryStyle}>{currentCountry}</div>
        </AbsoluteFill>
    );
};
