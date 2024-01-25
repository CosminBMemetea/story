// NexusGlobe.tsx
import React from 'react';
import Globe from 'react-globe.gl';

interface NexusGlobeProps {
    countries: { name: string, lat: number, lng: number }[];
}

export const NexusGlobe: React.FC<NexusGlobeProps> = ({ countries }) => {
    const markers = countries.map(country => ({
        id: country.name,
        lat: country.lat,
        lng: country.lng,
        // Add other marker properties as needed
    }));

    return (
        <Globe
            markers={markers}
            // @ts-ignore
            markerSize={0.5}
            // Add other globe properties and configurations
        />
    );
};
