// ElevatedPolygonsGlobe.tsx
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";
import { CountryFeature, loadCountries } from "../../lib/countries";
import { VisitedCountriesContext } from "../../lib/visited-countries-context";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const VISITED_COLOR = "rgba(255, 190, 30, 0.95)";
const DEFAULT_COLOR = "rgba(70, 90, 140, 0.55)";

const getCountryFlagEmoji = (countryCode: string): string =>
  /^[A-Z]{2}$/i.test(countryCode)
    ? countryCode
        .toUpperCase()
        .replace(/./g, (char) =>
          String.fromCodePoint(char.charCodeAt(0) + 127397)
        )
    : "";

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ]!)
  );

export const ElevatedPolygonsGlobe: React.FC<{
  width: number;
  height: number;
}> = ({ width, height }) => {
  const visited = useContext(VisitedCountriesContext);
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const globeEl = useRef<GlobeMethods | undefined>(undefined);

  const visitedCodes = useMemo(
    () => new Set(visited.map((c) => c.code)),
    [visited]
  );

  useEffect(() => {
    loadCountries()
      .then((features) =>
        setCountries(features.filter((f) => f.properties.ISO_A2 !== "AQ"))
      )
      .catch((error) => console.error("Error loading country dataset:", error));
  }, []);

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.3;
      globeEl.current.pointOfView({ altitude: 2.3 }, 3000);
    }
  }, []);

  // Visited countries rise off the globe; others stay close to the surface,
  // with a subtle population-based relief.
  const altitude = (obj: object) => {
    const feat = obj as CountryFeature;
    if (visitedCodes.has(feat.properties.ISO_A2)) return 0.12;
    return 0.005 + Math.min(0.03, Math.sqrt(feat.properties.POP_EST) * 1e-6);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <Globe
        ref={globeEl}
        width={width}
        height={height}
        globeImageUrl={`${BASE_PATH}/earth-dark.jpg`}
        backgroundColor="#000011"
        polygonsData={countries}
        polygonAltitude={altitude}
        polygonCapColor={(feat: object) =>
          visitedCodes.has((feat as CountryFeature).properties.ISO_A2)
            ? VISITED_COLOR
            : DEFAULT_COLOR
        }
        polygonSideColor={(feat: object) =>
          visitedCodes.has((feat as CountryFeature).properties.ISO_A2)
            ? "rgba(255, 140, 0, 0.6)"
            : "rgba(0, 0, 0, 0)"
        }
        polygonStrokeColor={() => "rgba(255, 255, 255, 0.15)"}
        polygonLabel={(obj: object) => {
          const { ISO_A2, ADMIN, POP_EST } = (obj as CountryFeature).properties;
          return `<b>${getCountryFlagEmoji(ISO_A2)} ${escapeHtml(
            ADMIN
          )} (${escapeHtml(ISO_A2)})</b><br />
            Population: <i>${Math.round(+POP_EST / 1e4) / 1e2}M</i>`;
        }}
      />
    </div>
  );
};

export default ElevatedPolygonsGlobe;
