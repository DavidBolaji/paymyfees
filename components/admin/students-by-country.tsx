'use client';

import { useState, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { ChevronDown } from 'lucide-react';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const FILTER_OPTIONS = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'All Time'];


interface CountryData {
  alpha2: string;
  name: string;
  flag: string;
  students: number;
}

const MOCK_DATA: Record<string, CountryData[]> = {
  'Last 7 Days': [
    { alpha2: 'NG', name: 'Nigeria',        flag: '🇳🇬', students: 2100 },
    { alpha2: 'GB', name: 'United Kingdom', flag: '🇬🇧', students: 1100 },
    { alpha2: 'US', name: 'United States',  flag: '🇺🇸', students:  420 },
    { alpha2: 'GH', name: 'Ghana',          flag: '🇬🇭', students:  310 },
    { alpha2: 'KE', name: 'Kenya',          flag: '🇰🇪', students:  180 },
  ],
  'Last 30 Days': [
    { alpha2: 'NG', name: 'Nigeria',        flag: '🇳🇬', students: 8400 },
    { alpha2: 'GB', name: 'United Kingdom', flag: '🇬🇧', students: 4800 },
    { alpha2: 'US', name: 'United States',  flag: '🇺🇸', students: 1920 },
    { alpha2: 'GH', name: 'Ghana',          flag: '🇬🇭', students: 1200 },
    { alpha2: 'ZA', name: 'South Africa',   flag: '🇿🇦', students:  860 },
  ],
  'Last 90 Days': [
    { alpha2: 'NG', name: 'Nigeria',        flag: '🇳🇬', students: 24200 },
    { alpha2: 'GB', name: 'United Kingdom', flag: '🇬🇧', students: 13600 },
    { alpha2: 'US', name: 'United States',  flag: '🇺🇸', students:  5400 },
    { alpha2: 'GH', name: 'Ghana',          flag: '🇬🇭', students:  3800 },
    { alpha2: 'DE', name: 'Germany',        flag: '🇩🇪', students:  2100 },
  ],
  'All Time': [
    { alpha2: 'NG', name: 'Nigeria',        flag: '🇳🇬', students: 95000 },
    { alpha2: 'GB', name: 'United Kingdom', flag: '🇬🇧', students: 52000 },
    { alpha2: 'US', name: 'United States',  flag: '🇺🇸', students: 21000 },
    { alpha2: 'GH', name: 'Ghana',          flag: '🇬🇭', students: 14500 },
    { alpha2: 'ZA', name: 'South Africa',   flag: '🇿🇦', students:  9200 },
  ],
};

// Map country name (from topojson) → alpha2
export const COUNTRY_NAME_TO_ALPHA2: Record<string, string> = {
  Nigeria: 'NG',
  'United Kingdom': 'GB',
  'United States of America': 'US',
  Germany: 'DE',
  'South Africa': 'ZA',
  Ghana: 'GH',
  Kenya: 'KE',
  Canada: 'CA',
  France: 'FR',
  Russia: 'RU',
  China: 'CN',
  India: 'IN',
  Australia: 'AU',
  Brazil: 'BR',
  // add more as needed
};

function getFillColor(alpha2: string, data: CountryData[]): string {
  if (!data.length) return '#D6D6DA';
  const max = data[0]?.students ?? 1;
  const country = data.find(c => c.alpha2 === alpha2);
  if (!country) return '#D6D6DA';
  const ratio = country.students / max;
  // High (>= 50% of max) → dark navy  #1B3A6B
  // Low (< 50% of max)  → amber       #D4A017
  return ratio >= 0.5 ? '#1B3A6B' : '#D4A017';
}

interface TooltipState {
  name: string;
  students: number;
  x: number;
  y: number;
}

interface StudentsbyCountryProps {
  data?: Record<string, CountryData[]>;
}

export function StudentsbyCountry({ data = MOCK_DATA }: StudentsbyCountryProps) {
  const [filter, setFilter] = useState('Last 7 Days');
  const [filterOpen, setFilterOpen] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const currentData = data[filter] ?? data['Last 7 Days'] ?? [];

  const handleMouseEnter = useCallback(
    (geo: any, evt: React.MouseEvent) => {
      const countryName: string = geo.properties?.name ?? '';
      const alpha2 = COUNTRY_NAME_TO_ALPHA2[countryName];
      const found = alpha2 ? currentData.find(c => c.alpha2 === alpha2) : undefined;
      if (!found) return;
      setTooltip({
        name: countryName,
        students: found.students,
        x: evt.clientX,
        y: evt.clientY,
      });
    },
    [currentData],
  );

  const handleMouseMove = useCallback((evt: React.MouseEvent) => {
    setTooltip(prev => prev ? { ...prev, x: evt.clientX, y: evt.clientY } : prev);
  }, []);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  const topCountries = [...currentData]
    .sort((a, b) => b.students - a.students)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#191919] text-[1.0625rem]">Students by Country</h3>

        {/* Filter dropdown */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen(o => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-[#191919] hover:bg-gray-50 transition-colors"
          >
            {filter}
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[140px] py-1">
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => { setFilter(opt); setFilterOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${filter === opt ? 'text-[#002561] font-semibold' : 'text-[#191919]'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* World Map */}
      <div className="relative w-full rounded-xl overflow-hidden bg-[#F4F6FA]" style={{ height: 240 }}>
        <ComposableMap
          projectionConfig={{ scale: 130, center: [10, 10] }}
          width={800}
          height={400}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup zoom={1} center={[10, 10]} maxZoom={1} minZoom={1}>
            <Geographies geography={GEO_URL}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo: any) => {
                  const countryName: string = geo.properties?.name ?? '';
                  const alpha2 = COUNTRY_NAME_TO_ALPHA2[countryName];
                  const fill = getFillColor(alpha2 ?? '', currentData);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke="#FFFFFF"
                      strokeWidth={0.4}
                      style={{
                        default: { outline: 'none' },
                        hover: { fill: alpha2 && currentData.find(c => c.alpha2 === alpha2) ? '#001B4E' : '#C4C4C8', outline: 'none', cursor: 'pointer' },
                        pressed: { outline: 'none' },
                      }}
                      onMouseEnter={(evt: any) => handleMouseEnter(geo, evt)}
                      onMouseMove={(evt: any) => handleMouseMove(evt)}
                      onMouseLeave={handleMouseLeave}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none bg-[#1C2B43] text-white text-xs rounded-lg px-3 py-2 shadow-xl"
            style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
          >
            <div className="font-semibold">{tooltip.name}</div>
            <div className="text-gray-300">{tooltip.students.toLocaleString()} Students</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-3 mb-4">
        <LegendItem color="#1B3A6B" label="High sales" />
        <LegendItem color="#D4A017" label="Low sales" />
        <LegendItem color="#D6D6DA" label="No Sales activity" />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mb-4" />

      {/* Top Countries */}
      <p className="text-sm font-semibold text-[#191919] mb-3">Top Countries</p>
      <div className="space-y-2.5">
        {topCountries.map(c => (
          <div key={c.alpha2} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl leading-none">{c.flag}</span>
              <span className="text-sm text-[#191919]">{c.name}</span>
            </div>
            <span className="text-sm font-semibold text-[#191919]">
              {c.students.toLocaleString()} <span className="text-[#7C7C7C] font-normal">Students</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
      <span className="text-xs text-[#7C7C7C]">{label}</span>
    </div>
  );
}
