'use client';

import { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import countries from '@/lib/countries';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface WorldMapProps {
  onCountryClick: (countryCode: string) => void;
  selectedCountry?: string | null;
}

export default function WorldMap({ onCountryClick, selectedCountry }: WorldMapProps) {
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null);

  return (
    <div className="relative w-full h-full bg-gray-50">
      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 px-3 py-2 bg-black text-white text-sm rounded shadow-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            marginTop: '-8px',
          }}
        >
          {tooltip.name}
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 147,
          center: [0, 20],
        }}
        className="w-full h-full"
      >
        <ZoomableGroup
          center={[0, 20]}
          zoom={1}
          minZoom={1}
          maxZoom={8}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                // Match country by name from GeoJSON properties
                const geoName = geo.properties?.name || '';
                const country = countries.find(c =>
                  c.name.toLowerCase() === geoName.toLowerCase() ||
                  // Handle some common naming differences
                  (geoName === 'United States of America' && c.name === 'United States') ||
                  (geoName === 'Czechia' && c.name === 'Czech Republic') ||
                  (geoName === 'Palestine' && c.code === 'PSE')
                );
                const isSelected = selectedCountry === country?.code;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      if (country) {
                        onCountryClick(country.code);
                      }
                    }}
                    onMouseEnter={(evt) => {
                      if (country) {
                        const { clientX, clientY } = evt;
                        setTooltip({
                          name: country.name,
                          x: clientX,
                          y: clientY,
                        });
                      }
                    }}
                    onMouseLeave={() => {
                      setTooltip(null);
                    }}
                    onMouseMove={(evt) => {
                      if (tooltip && country) {
                        const { clientX, clientY } = evt;
                        setTooltip({
                          name: country.name,
                          x: clientX,
                          y: clientY,
                        });
                      }
                    }}
                    style={{
                      default: {
                        fill: isSelected ? '#3b82f6' : '#d1d5db',
                        stroke: '#fff',
                        strokeWidth: 0.5,
                        outline: 'none',
                        transition: 'fill 0.2s ease',
                      },
                      hover: {
                        fill: isSelected ? '#2563eb' : '#9ca3af',
                        stroke: '#fff',
                        strokeWidth: 0.5,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: {
                        fill: '#1d4ed8',
                        stroke: '#fff',
                        strokeWidth: 0.5,
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
