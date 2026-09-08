import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocationData, LandslideEvent, RiskPredictionResult } from '../types';
import { calculateLandslideRisk } from '../utils/mlInference';
import { 
  Layers, 
  Eye, 
  MapPin, 
  CloudRain, 
  AlertTriangle, 
  History, 
  Info,
  Maximize2
} from 'lucide-react';

interface RiskMapProps {
  locations: LocationData[];
  historicalEvents: LandslideEvent[];
  selectedLocation: LocationData | null;
  onSelectLocation: (location: LocationData) => void;
  onOpenSimulation: (location: LocationData) => void;
}

export const RiskMap: React.FC<RiskMapProps> = ({
  locations,
  historicalEvents,
  selectedLocation,
  onSelectLocation,
  onOpenSimulation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const rainfallLayerRef = useRef<L.LayerGroup | null>(null);
  const historyLayerRef = useRef<L.LayerGroup | null>(null);
  const corridorsLayerRef = useRef<L.LayerGroup | null>(null);

  // Layer Toggles
  const [showRiskMarkers, setShowRiskMarkers] = useState(true);
  const [showRainfallLayer, setShowRainfallLayer] = useState(true);
  const [showHistoricalEvents, setShowHistoricalEvents] = useState(true);
  const [showCorridors, setShowCorridors] = useState(true);
  const [activeBasemap, setActiveBasemap] = useState<'carto-dark' | 'osm' | 'terrain'>('carto-dark');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center of North Eastern Region of India
      const map = L.map(mapContainerRef.current, {
        center: [25.8, 92.8],
        zoom: 7,
        minZoom: 6,
        maxZoom: 14,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Layer groups
      markersLayerRef.current = L.layerGroup().addTo(map);
      rainfallLayerRef.current = L.layerGroup().addTo(map);
      historyLayerRef.current = L.layerGroup().addTo(map);
      corridorsLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Basemap Tiles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; OpenStreetMap, CartoDB';

    if (activeBasemap === 'osm') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    } else if (activeBasemap === 'terrain') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri, DeLorme, NAVTEQ';
    }

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 18
    }).addTo(map);
  }, [activeBasemap]);

  // Center on selectedLocation when it changes
  useEffect(() => {
    if (selectedLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedLocation.lat, selectedLocation.lng], 9, {
        duration: 1.2
      });
    }
  }, [selectedLocation]);

  // Render Geospatial Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Clear active layers
    markersLayerRef.current?.clearLayers();
    rainfallLayerRef.current?.clearLayers();
    historyLayerRef.current?.clearLayers();
    corridorsLayerRef.current?.clearLayers();

    // 2. Risk Markers
    if (showRiskMarkers && markersLayerRef.current) {
      locations.forEach((loc) => {
        const risk = calculateLandslideRisk(loc);
        
        let color = '#10b981'; // Low
        let symbol = 'âœ“';
        let shapeClass = 'rounded-full border-2 border-emerald-400 bg-emerald-950/90 text-emerald-300';
        let pulseClass = '';

        if (risk.category === 'VERY_HIGH') {
          color = '#ef4444';
          symbol = '!';
          shapeClass = 'rounded-lg border-2 border-red-400 bg-red-950/90 text-red-200 font-black';
          pulseClass = 'animate-ping opacity-60 bg-red-500';
        } else if (risk.category === 'HIGH') {
          color = '#f97316';
          symbol = 'â–²';
          shapeClass = 'rounded-md border-2 border-orange-400 bg-orange-950/90 text-orange-200 font-bold';
        } else if (risk.category === 'MODERATE') {
          color = '#f59e0b';
          symbol = 'â— ';
          shapeClass = 'rounded-full border-2 border-amber-400 bg-amber-950/90 text-amber-200';
        }

        const iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${risk.category === 'VERY_HIGH' ? `<div class="absolute w-8 h-8 rounded-lg ${pulseClass}"></div>` : ''}
            <div class="w-8 h-8 ${shapeClass} flex items-center justify-center shadow-lg text-xs font-mono transition-transform hover:scale-125 z-10">
              ${risk.score}
            </div>
            <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-slate-200 text-[9px] px-1.5 py-0.5 rounded border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              ${loc.name}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-landslide-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });

        // Popup
        const popupContent = document.createElement('div');
        popupContent.className = 'p-1 text-slate-900 min-w-[220px] font-sans';
        popupContent.innerHTML = `
          <div class="flex items-center justify-between border-b pb-1.5 mb-2">
            <span class="font-bold text-xs text-slate-900">${loc.name}</span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${
              risk.category === 'VERY_HIGH' ? 'bg-red-100 text-red-800' :
              risk.category === 'HIGH' ? 'bg-orange-100 text-orange-800' :
              risk.category === 'MODERATE' ? 'bg-amber-100 text-amber-800' :
              'bg-emerald-100 text-emerald-800'
            }">${risk.category}</span>
          </div>
          <div class="text-[11px] space-y-1 text-slate-600 mb-3">
            <div><strong class="text-slate-800">State/District:</strong> ${loc.district}, ${loc.state}</div>
            <div><strong class="text-slate-800">Risk Score:</strong> <span class="font-bold text-slate-900">${risk.score}/100</span> (Conf: ${risk.confidence}%)</div>
            <div><strong class="text-slate-800">24-hr Rainfall:</strong> ${loc.rainfall24h} mm</div>
            <div><strong class="text-slate-800">Slope Gradient:</strong> ${loc.slope}Â° (${loc.soilType.split(' ')[0]})</div>
            <div><strong class="text-slate-800">Primary Driver:</strong> ${risk.topFactors[0]?.displayName}</div>
          </div>
          <div class="grid grid-cols-2 gap-1.5 pt-1 border-t">
            <button id="btn-analyze-${loc.id}" class="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold py-1 rounded transition-colors">
              Full Analysis
            </button>
            <button id="btn-simulate-${loc.id}" class="w-full text-center bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-semibold py-1 rounded transition-colors">
              Simulate Rain
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const analyzeBtn = document.getElementById(`btn-analyze-${loc.id}`);
          const simulateBtn = document.getElementById(`btn-simulate-${loc.id}`);
          if (analyzeBtn) {
            analyzeBtn.onclick = () => {
              onSelectLocation(loc);
              map.closePopup();
            };
          }
          if (simulateBtn) {
            simulateBtn.onclick = () => {
              onOpenSimulation(loc);
              map.closePopup();
            };
          }
        });

        marker.addTo(markersLayerRef.current!);
      });
    }

    // 3. Rainfall Intensity Heatmap / Buffer Rings
    if (showRainfallLayer && rainfallLayerRef.current) {
      locations.forEach((loc) => {
        if (loc.rainfall24h > 40) {
          const radius = Math.min(35000, Math.max(12000, loc.rainfall24h * 150));
          const circleColor = loc.rainfall24h > 150 ? '#ef4444' : loc.rainfall24h > 90 ? '#f97316' : '#38bdf8';
          
          L.circle([loc.lat, loc.lng], {
            radius,
            color: circleColor,
            fillColor: circleColor,
            fillOpacity: 0.12,
            weight: 1,
            dashArray: '4, 4'
          }).bindTooltip(`24h Rainfall: ${loc.rainfall24h}mm`, { direction: 'top' })
            .addTo(rainfallLayerRef.current!);
        }
      });
    }

    // 4. Historical Landslide Catalog Points
    if (showHistoricalEvents && historyLayerRef.current) {
      historicalEvents.forEach((evt) => {
        const historyIcon = L.divIcon({
          html: `
            <div class="w-5 h-5 rounded-full bg-red-600/80 border border-white flex items-center justify-center text-[9px] text-white font-bold shadow-md cursor-pointer hover:scale-150 transition-transform" title="${evt.locationName} (${evt.year})">
              âœ–
            </div>
          `,
          className: 'historical-event-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = L.marker([evt.lat, evt.lng], { icon: historyIcon });
        marker.bindPopup(`
          <div class="p-1 text-slate-900 text-xs font-sans min-w-[200px]">
            <div class="font-bold text-red-600 border-b pb-1 mb-1">Historical Landslide Event (${evt.year})</div>
            <div class="font-medium text-slate-800">${evt.locationName}</div>
            <div class="text-[11px] text-slate-600 mt-1">${evt.impactDescription}</div>
            <div class="mt-2 text-[10px] text-slate-500 bg-slate-100 p-1 rounded">
              Fatalities: <strong>${evt.fatalities}</strong> | Trigger: <strong>${evt.trigger}</strong>
            </div>
          </div>
        `);

        marker.addTo(historyLayerRef.current!);
      });
    }

    // 5. Critical Highway Corridors (NH-10, NH-29, NH-6)
    if (showCorridors && corridorsLayerRef.current) {
      // NH-10 Sikkim (Siliguri - Gangtok)
      L.polyline([[26.8, 88.4], [27.1, 88.5], [27.33, 88.6]], {
        color: '#eab308',
        weight: 3,
        opacity: 0.7,
        dashArray: '6, 6'
      }).bindTooltip('NH-10 (Siliguri - Gangtok Lifeline)', { sticky: true }).addTo(corridorsLayerRef.current);

      // NH-29 Nagaland (Dimapur - Kohima)
      L.polyline([[25.9, 93.7], [25.8, 93.9], [25.67, 94.1]], {
        color: '#eab308',
        weight: 3,
        opacity: 0.7,
        dashArray: '6, 6'
      }).bindTooltip('NH-29 (Dimapur - Kohima Sinking Corridor)', { sticky: true }).addTo(corridorsLayerRef.current);

      // NH-6 Meghalaya - Assam (Shillong - Silchar)
      L.polyline([[25.57, 91.89], [25.17, 92.5], [24.83, 92.79]], {
        color: '#eab308',
        weight: 3,
        opacity: 0.7,
        dashArray: '6, 6'
      }).bindTooltip('NH-6 (East Jaintia Hills - Barak Valley Corridor)', { sticky: true }).addTo(corridorsLayerRef.current);
    }
  }, [locations, historicalEvents, showRiskMarkers, showRainfallLayer, showHistoricalEvents, showCorridors]);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950 flex flex-col rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Map Header Floating Overlay */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-2">
        <div className="bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-3 text-xs text-slate-200">
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Map Layers</span>
          </div>

          <div className="h-3 w-px bg-slate-700"></div>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-300 transition-colors">
            <input
              type="checkbox"
              checked={showRiskMarkers}
              onChange={(e) => setShowRiskMarkers(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span>Risk Scores</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-sky-300 transition-colors">
            <input
              type="checkbox"
              checked={showRainfallLayer}
              onChange={(e) => setShowRainfallLayer(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span>24h Rain Radar</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-red-300 transition-colors">
            <input
              type="checkbox"
              checked={showHistoricalEvents}
              onChange={(e) => setShowHistoricalEvents(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-red-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span>Past Events</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-amber-300 transition-colors">
            <input
              type="checkbox"
              checked={showCorridors}
              onChange={(e) => setShowCorridors(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span>Highways (NH)</span>
          </label>
        </div>

        {/* Basemap Switcher */}
        <div className="bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-2 py-1 rounded-xl shadow-lg flex items-center gap-1 text-[11px] text-slate-300">
          <button
            onClick={() => setActiveBasemap('carto-dark')}
            className={`px-2 py-1 rounded-lg transition-colors ${
              activeBasemap === 'carto-dark' ? 'bg-slate-700 text-white font-medium' : 'hover:text-white'
            }`}
          >
            Dark Carto
          </button>
          <button
            onClick={() => setActiveBasemap('terrain')}
            className={`px-2 py-1 rounded-lg transition-colors ${
              activeBasemap === 'terrain' ? 'bg-slate-700 text-white font-medium' : 'hover:text-white'
            }`}
          >
            Terrain Topo
          </button>
          <button
            onClick={() => setActiveBasemap('osm')}
            className={`px-2 py-1 rounded-lg transition-colors ${
              activeBasemap === 'osm' ? 'bg-slate-700 text-white font-medium' : 'hover:text-white'
            }`}
          >
            OSM Light
          </button>
        </div>
      </div>

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/90 border border-slate-700/80 backdrop-blur-md p-3 rounded-xl shadow-xl text-xs space-y-2 max-w-[220px]">
        <div className="font-semibold text-slate-200 flex items-center justify-between">
          <span>Susceptibility Legend</span>
          <span className="text-[10px] text-slate-400">0 - 100 Score</span>
        </div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-red-500 flex items-center justify-center text-[9px] font-bold text-white">!</span>
              <span className="text-slate-300 font-medium">Very High</span>
            </div>
            <span className="font-mono text-red-400 font-semibold">76 - 100</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-orange-500 flex items-center justify-center text-[9px] font-bold text-white">â–²</span>
              <span className="text-slate-300 font-medium">High</span>
            </div>
            <span className="font-mono text-orange-400 font-semibold">51 - 75</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center text-[9px] font-bold text-slate-900">â— </span>
              <span className="text-slate-300 font-medium">Moderate</span>
            </div>
            <span className="font-mono text-amber-400 font-semibold">26 - 50</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] font-bold text-white">âœ“</span>
              <span className="text-slate-300 font-medium">Low</span>
            </div>
            <span className="font-mono text-emerald-400 font-semibold">0 - 25</span>
          </div>
        </div>
        <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
          âœ– Historical disaster site (2018-24)
        </div>
      </div>

      {/* The Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};
