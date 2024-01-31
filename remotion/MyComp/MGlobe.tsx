// MGlobe.tsx
import { GlobeMethods } from 'react-globe.gl';
import Globe from 'react-globe.gl';
import React, { useContext, useEffect, useRef, useState } from 'react';

import AnonymousUserIdContext from '../../app/context/AnonymousUserIdContext';

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

export const MGlobe: React.FC = () => {
    const anonymousUserId = useContext(AnonymousUserIdContext);
    const [htmlElementsData, setHtmlElementsData] = useState<GlobeElementData[]>([]);
    const globeRef = useRef<GlobeMethods | undefined>(undefined);

    useEffect(() => {
        if (!anonymousUserId) {
            console.log('Anonymous user ID not found');
            return;
        }

        const fetchCountries = async () => {
            try {
                const response = await fetch(`http://localhost:8000/getCountries?anonymousUserId=${anonymousUserId}`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const countries = await response.json();
                console.log(countries);
                const newHtmlElementsData = countries.map((country: CountryData) => ({
                    ...country,
                    
                    htmlElement: () => {
                        const el = document.createElement('div');
                        el.innerHTML = markerSvg + `<span style="position: absolute; top: 100%; left: 50%; transform: translate(-50%, 0); font-size: 30px;">${country.name}</span>`;
                        el.style.color = country.color;
                        el.style.width = `${country.size}px`;
                        el.style['pointer-events' as any] = 'auto';
                        el.style.cursor = 'pointer';
                        return el;
                    }
                }));
                setHtmlElementsData(newHtmlElementsData);
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        };

        fetchCountries();
    }, [anonymousUserId]);

    useEffect(() => {
        if (globeRef.current) {

            globeRef.current.pointOfView({ lat: 10, lng: 55, altitude: 2.1 });
            const controls = globeRef.current.controls();
            controls.autoRotate = true;
            controls.autoRotateSpeed = 3;
        }
    }, [htmlElementsData]);

    // Define the marker SVG
    const markerSvg = `<svg viewBox="-4 0 36 36">
        <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
        <circle fill="yellow" cx="14" cy="14" r="7"></circle>
    </svg>`;

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <Globe
            ref={globeRef}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
            htmlElementsData={htmlElementsData}
            htmlElement={(d: object) => {
                const typedD = d as GlobeElementData;
                return typedD.htmlElement();
            }}
        />
        </div>
    );
};

export default MGlobe;
