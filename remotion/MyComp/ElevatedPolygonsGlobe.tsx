
// ElevatedPolygonsGlobe.tsx
import React, { useContext, useEffect, useRef, useState } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import AnonymousUserIdContext from '../../app/context/AnonymousUserIdContext';
import { eventBus } from '../../helpers/event-bus';

interface CountryFeature {
  properties: {
    ADMIN: string; // Country name
    ISO_A2: string; // Country ISO code
    POP_EST: number; // Population estimate
  };
  geometry: {
    type: string;
    coordinates: number[][][]; // Coordinates for the country polygon
  };
}

interface GeoJsonData {
  features: CountryFeature[];
}

interface CountryData {
    name: string;
    code: string;
    lat: number;
    lng: number;
    size: number;
    color: string;
}


export const ElevatedPolygonsGlobe: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const anonymousUserId = useContext(AnonymousUserIdContext);
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [apiCountries, setApiCountries] = useState<CountryData[]>([]);
  const [isApiError, setIsApiError] = useState(false);


  const globeEl = useRef<GlobeMethods>();

  useEffect(() => {
    const fetchData =  async () => {
      console.log('Event fired!')
      // Fetch countries data
      const countriesDataResponse = await fetch('https://nomad-nexus-api.vercel.app/getDataset');
      const countriesData: GeoJsonData = await countriesDataResponse.json();
      setCountries(countriesData.features);

      // Fetch countries data from API
      if (anonymousUserId) {
      fetch(`https://nomad-nexus-api.vercel.app/getCountries?anonymousUserId=${anonymousUserId}`)
        .then(res => res.json())
        .then((data) => {

          if (Array.isArray(data)) {
            setApiCountries(data);
          } else {
            console.error('API response is not an array');
            console.log(data);
            setIsApiError(true);
          }
        })
        .catch((error) => {
          console.error('Error fetching countries from API:', error);
          setIsApiError(true);
        });
      }
    };

    fetchData();

    // Listen to fileUploaded event
    eventBus.on('FileUploadedEvent', fetchData);

    // Cleanup event listener
    return () => {
      eventBus.off('FileUploadedEvent', fetchData);
    };
  }, [anonymousUserId]);

  useEffect(() => {
  
    // Auto-rotate settings
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.3;
      globeEl.current.pointOfView({ altitude: 4 }, 5000);
    }
  }, []);

const altitudeFunction = (obj: object) => {
  const feat = obj as CountryFeature; // Type assertion
  return Math.max(0.1, Math.sqrt(feat.properties.POP_EST) * 7e-5);
};

const getCountryFlagEmoji = (countryCode: string): string => {
        return countryCode.toUpperCase().replace(/./g, char => 
        String.fromCodePoint(char.charCodeAt(0) + 127397)
    );
};
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Globe
        ref={globeEl}
        width={width}
        height={height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        polygonsData={countries.filter(d => d.properties.ISO_A2 !== 'AQ')}
        polygonAltitude={altitudeFunction}
        polygonCapColor={(feat:any) => {
          if (!isApiError) {
            const countryData = apiCountries.find(c => c.code === feat.properties.ISO_A2.toLowerCase());
            return countryData ? countryData.color : 'rgba(200, 0, 0, 0.6)'; // Use API color if available
          }
          return 'rgba(200, 0, 0, 0.6)'; // Default red color in case of API error
        }}
        polygonSideColor={() => 'rgba(0, 100, 0, 0.15)'}
        polygonLabel={( feat: any ) => `
        <b>${getCountryFlagEmoji(feat.properties.ISO_A2)} ${feat.properties.ADMIN} (${feat.properties.ISO_A2})</b> <br />
        Population: <i>${Math.round(+feat.properties.POP_EST / 1e4) / 1e2}M</i>
      `}
      />
    </div>
  );
};

export default ElevatedPolygonsGlobe;
