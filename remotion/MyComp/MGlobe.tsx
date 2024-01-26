// MGlobe.tsx
import { GlobeMethods } from 'react-globe.gl';
import Globe from 'react-globe.gl';
import React, { useEffect, useRef } from 'react';
interface CountryData {
    name: string;
    lat: number;
    lng: number;
    size: number;
    color: string;
}

interface GlobeElementData extends CountryData {
    htmlElement: () => HTMLElement;
}

interface GlobeProps {
    countries: CountryData[];
}

export const MGlobe: React.FC<GlobeProps> = ({ countries }) => {
    // Define the marker SVG
    const markerSvg = `<svg viewBox="-4 0 36 36">
        <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
        <circle fill="red" cx="14" cy="14" r="7"></circle>
    </svg>`;


    const globeRef = useRef<GlobeMethods | undefined>(undefined);

    useEffect(() => {
        if (globeRef.current) {
            // Set the point of view to Europe's approximate geographic center
            globeRef.current.pointOfView({ lat: 10, lng: 55, altitude: 1.6 });

              // Access OrbitControls and set auto-rotate speed
            const controls = globeRef.current.controls();
            controls.autoRotate = true;
            controls.autoRotateSpeed = 4; // A
        }
    }, []);
    // Convert countries data to HTML elements
    const htmlElementsData: GlobeElementData[] = countries.map(country => ({
        ...country,
        htmlElement: () => {
            const el = document.createElement('div');
            el.innerHTML = markerSvg + `<span style="position: absolute; top: 100%; left: 50%; transform: translate(-50%, 0);">${country.name}</span>`;
            el.style.color = country.color;
            el.style.width = `${country.size}px`;
            el.style['pointer-events' as any] = 'auto';
            el.style.cursor = 'pointer';
            el.onclick = () => console.info(country);
            return el;
        }
    }));
 

    return (
        <Globe
            ref={globeRef}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
            htmlElementsData={htmlElementsData}
            htmlElement={(d: object) => {
                const typedD = d as GlobeElementData;
                return typedD.htmlElement();
            }}
            />
    );
};

export default MGlobe;
