import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocationData, LandslideEvent } from '../types';
import { calculateLandslideRisk } from '../utils/mlInference';
import {
  fetchRainViewerRadar,
  fetchLiveWeatherMeter,
  RadarFrame,
  LiveWeatherMeter
} from '../services/weatherService';
import { 
  Layers, 
  Eye, 
  MapPin, 
  CloudRain, 
  Cloud,
  AlertTriangle, 
  History, 
  Info,
  Maximize2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Gauge,
  Droplets,
  Wind,
  Thermometer,
  Sliders,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Radio
} from 'lucide-react';

interface RiskMapProps {
  locations?: LocationData[];
  historicalEvents?: LandslideEvent[];
  selectedLocation?: LocationData | null;
  onSelectLocation?: (location: LocationData) => void;
  onOpenSimulation?: (location: LocationData) => void;
}

export const RiskMap: React.FC<RiskMapProps> = ({
  locations = [],
  historicalEvents = [],
  selectedLocation = null,
  onSelectLocation = (_location: LocationData) => {},
  onOpenSimulation = (_location: LocationData) => {}
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  // Layer Groups & Tile Layers
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const rainfallLayerRef = useRef<L.LayerGroup | null>(null);
  const historyLayerRef = useRef<L.LayerGroup | null>(null);
  const corridorsLayerRef = useRef<L.LayerGroup | null>(null);
  const radarTileLayerRef = useRef<L.TileLayer | null>(null);
  const cloudTileLayerRef = useRef<L.TileLayer | null>(null);

  // Layer Toggles
  const [showRiskMarkers, setShowRiskMarkers] = useState(true);
  const [showDopplerRadar, setShowDopplerRadar] = useState(true);
  const [showRealClouds, setShowRealClouds] = useState(false);
  const [showGroundRainfallCircles, setShowGroundRainfallCircles] = useState(false);
  const [showHistoricalEvents, setShowHistoricalEvents] = useState(true);
  const [showCorridors, setShowCorridors] = useState(true);
  const [activeBasemap, setActiveBasemap] = useState<'voyager' | 'terrain' | 'carto-dark'>('voyager');

  // Radar Animation & Frames State
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [radarHost, setRadarHost] = useState<string>('https://tilecache.rainviewer.com');
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlayingRadar, setIsPlayingRadar] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per frame (gentle, not rapid)
  const [radarOpacity, setRadarOpacity] = useState<number>(0.75);
  const [cloudOpacity, setCloudOpacity] = useState<number>(0.55);

  // Live Weather Meter State
  const [liveMeter, setLiveMeter] = useState<LiveWeatherMeter | null>(null);
  const [isLoadingMeter, setIsLoadingMeter] = useState<boolean>(false);
  const [isMeterExpanded, setIsMeterExpanded] = useState<boolean>(false); // Collapsed by default for clean presentation

  // 1. Fetch Radar Frames on Mount
  useEffect(() => {
    let isMounted = true;
    fetchRainViewerRadar().then((res) => {
      if (!isMounted) return;
      setRadarHost(res.host);
      setRadarFrames(res.frames);
      if (res.frames.length > 0) {
        setCurrentFrameIndex(Math.max(0, res.frames.length - 2));
      }
    }).catch(console.error);

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Live Weather Meter when selected location changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingMeter(true);

    const lat = selectedLocation ? selectedLocation.lat : 25.8;
    const lng = selectedLocation ? selectedLocation.lng : 92.8;
    const name = selectedLocation ? `${selectedLocation.name} (${selectedLocation.state})` : 'Central NER Region (Assam-Meghalaya Hub)';

    fetchLiveWeatherMeter(lat, lng, name).then((meter) => {
      if (!isMounted) return;
      setLiveMeter(meter);
      setIsLoadingMeter(false);
    }).catch((err) => {
      console.warn('Weather meter fetch failed:', err);
      setIsLoadingMeter(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedLocation]);

  // 3. Radar Loop Timer (Gentle, steady loop)
  useEffect(() => {
    if (!isPlayingRadar || radarFrames.length === 0) return;

    const timer = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % radarFrames.length);
    }, playbackSpeed);

    return () => clearInterval(timer);
  }, [isPlayingRadar, radarFrames.length, playbackSpeed]);

  // 4. Initialize Leaflet Map
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

  // 5. Update Basemap Tiles (Default to clean, crisp Carto Voyager for GovTech clarity)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer && layer !== radarTileLayerRef.current && layer !== cloudTileLayerRef.current) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; OpenStreetMap, CartoDB';

    if (activeBasemap === 'terrain') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri, DeLorme, NAVTEQ';
    } else if (activeBasemap === 'carto-dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; OpenStreetMap, CartoDB';
    }

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 18,
      zIndex: 1
    }).addTo(map);
  }, [activeBasemap]);

  // 6. Manage Real Cloud Layer (NASA GIBS VIIRS True Color)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (showRealClouds) {
      if (!cloudTileLayerRef.current) {
        cloudTileLayerRef.current = L.tileLayer(
          'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
          {
            maxNativeZoom: 9,
            maxZoom: 18,
            opacity: cloudOpacity,
            zIndex: 10,
            attribution: 'NASA GIBS &copy; Earthdata'
          }
        );
        cloudTileLayerRef.current.addTo(map);
      } else {
        cloudTileLayerRef.current.setOpacity(cloudOpacity);
      }
    } else {
      if (cloudTileLayerRef.current) {
        map.removeLayer(cloudTileLayerRef.current);
        cloudTileLayerRef.current = null;
      }
    }
  }, [showRealClouds, cloudOpacity]);

  // 7. Manage Real Doppler Radar Tiles (RainViewer)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (showDopplerRadar && radarFrames.length > 0) {
      const activeFrame = radarFrames[currentFrameIndex];
      if (!activeFrame) return;

      const tileUrl = `${radarHost}${activeFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;

      if (!radarTileLayerRef.current) {
        radarTileLayerRef.current = L.tileLayer(tileUrl, {
          opacity: radarOpacity,
          maxZoom: 18,
          zIndex: 20,
          attribution: 'RainViewer &copy; Doppler Radar'
        });
        radarTileLayerRef.current.addTo(map);
      } else {
        radarTileLayerRef.current.setUrl(tileUrl);
        radarTileLayerRef.current.setOpacity(radarOpacity);
      }
    } else {
      if (radarTileLayerRef.current) {
        map.removeLayer(radarTileLayerRef.current);
        radarTileLayerRef.current = null;
      }
    }
  }, [showDopplerRadar, radarFrames, currentFrameIndex, radarHost, radarOpacity]);

  // 8. Center on selectedLocation
  useEffect(() => {
    if (selectedLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedLocation.lat, selectedLocation.lng], 9, {
        duration: 1.2
      });
    }
  }, [selectedLocation]);

  // 9. Render Geospatial Vector Overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear active vector layers
    markersLayerRef.current?.clearLayers();
    rainfallLayerRef.current?.clearLayers();
    historyLayerRef.current?.clearLayers();
    corridorsLayerRef.current?.clearLayers();

    // Risk Markers (MINIMIZED BLINKING: Clean, steady indicators with gentle calm pulse, strictly no rapid flashing)
    if (showRiskMarkers && markersLayerRef.current) {
      (locations || []).forEach((loc) => {
        const risk = calculateLandslideRisk(loc);
        
        let shapeClass = 'rounded-full border-2 border-emerald-600 bg-white text-emerald-700 shadow-sm';
        let haloHtml = '';

        if (risk.category === 'VERY_HIGH') {
          // Red: VERY HIGH. Use a calm, steady soft halo without rapid blinking
          shapeClass = 'rounded-lg border-2 border-red-600 bg-red-600 text-white font-bold shadow-md';
          haloHtml = '<div class="absolute -inset-1 rounded-lg bg-red-500/20 border border-red-400/40 pointer-events-none"></div>';
        } else if (risk.category === 'HIGH') {
          // Orange: HIGH
          shapeClass = 'rounded-md border-2 border-orange-500 bg-orange-500 text-white font-bold shadow-sm';
          haloHtml = '<div class="absolute -inset-0.5 rounded-md bg-orange-400/20 pointer-events-none"></div>';
        } else if (risk.category === 'MODERATE') {
          // Amber: MODERATE
          shapeClass = 'rounded-full border-2 border-amber-500 bg-amber-50 text-amber-800 font-semibold shadow-xs';
        }

        const iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${haloHtml}
            <div class="w-7 h-7 ${shapeClass} flex items-center justify-center text-[11px] font-mono transition-transform hover:scale-110 z-10">
              ${risk.score}
            </div>
            <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0F2747] text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              ${loc.name}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-landslide-marker',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });

        // Clean GovTech Popup
        const popupContent = document.createElement('div');
        popupContent.className = 'p-1 text-[#172033] min-w-[250px] font-sans';
        
        let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (risk.category === 'VERY_HIGH') badgeColor = 'bg-red-50 text-red-700 border-red-200';
        else if (risk.category === 'HIGH') badgeColor = 'bg-orange-50 text-orange-700 border-orange-200';
        else if (risk.category === 'MODERATE') badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';

        popupContent.innerHTML = `
          <div class="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <div>
              <span class="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">${loc.state}</span>
              <span class="font-bold text-sm text-[#0F2747]">${loc.name}</span>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}">
              ${risk.category}
            </span>
          </div>
          <div class="text-xs space-y-1.5 text-[#64748B] mb-3">
            <div class="flex justify-between items-center">
              <span>Risk Score:</span>
              <span class="font-mono font-bold text-sm text-[#0F2747]">${risk.score} <span class="text-[10px] text-slate-400 font-normal">/ 100</span></span>
            </div>
            <div class="flex justify-between">
              <span>24h Rainfall:</span>
              <span class="font-mono font-semibold text-[#172033]">${loc.rainfall24h} mm</span>
            </div>
            <div class="flex justify-between">
              <span>Slope Gradient:</span>
              <span class="font-mono font-semibold text-[#172033]">${loc.slope}°</span>
            </div>
            <div class="flex justify-between">
              <span>Primary Driver:</span>
              <span class="font-medium text-[#0F2747]">${risk.topFactors[0]?.displayName || 'Slope Gradient'}</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <button id="btn-analyze-${loc.id}" class="w-full text-center bg-[#0F2747] hover:bg-[#176B87] text-white text-xs font-semibold py-1.5 rounded-lg transition-colors shadow-xs">
              View Analysis
            </button>
            <button id="btn-simulate-${loc.id}" class="w-full text-center bg-slate-100 hover:bg-slate-200 text-[#0F2747] text-xs font-semibold py-1.5 rounded-lg transition-colors border border-slate-200">
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

    // Historical Landslide Catalog Points
    if (showHistoricalEvents && historyLayerRef.current) {
      (historicalEvents || []).forEach((evt) => {
        const historyIcon = L.divIcon({
          html: `
            <div class="w-4 h-4 rounded-full bg-slate-700 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold shadow-sm cursor-pointer hover:scale-125 transition-transform" title="${evt.locationName} (${evt.year})">
              ✕
            </div>
          `,
          className: 'historical-event-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const marker = L.marker([evt.lat, evt.lng], { icon: historyIcon });
        marker.bindPopup(`
          <div class="p-1 text-[#172033] text-xs font-sans min-w-[200px]">
            <div class="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1">Historical Slide (${evt.year})</div>
            <div class="font-medium text-[#0F2747]">${evt.locationName}</div>
            <div class="text-[11px] text-[#64748B] mt-1">${evt.impactDescription}</div>
            <div class="mt-2 text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200">
              Fatalities: <strong>${evt.fatalities}</strong> | Trigger: <strong>${evt.trigger}</strong>
            </div>
          </div>
        `);

        marker.addTo(historyLayerRef.current!);
      });
    }

    // Critical Highway Corridors
    if (showCorridors && corridorsLayerRef.current) {
      // NH-10 Sikkim
      L.polyline([[26.8, 88.4], [27.1, 88.5], [27.33, 88.6]], {
        color: '#2F80ED',
        weight: 3,
        opacity: 0.8,
        dashArray: '5, 5'
      }).bindTooltip('NH-10 (Siliguri - Gangtok Lifeline)', { sticky: true }).addTo(corridorsLayerRef.current);

      // NH-29 Nagaland
      L.polyline([[25.9, 93.7], [25.8, 93.9], [25.67, 94.1]], {
        color: '#2F80ED',
        weight: 3,
        opacity: 0.8,
        dashArray: '5, 5'
      }).bindTooltip('NH-29 (Dimapur - Kohima Sinking Corridor)', { sticky: true }).addTo(corridorsLayerRef.current);

      // NH-6 Meghalaya - Assam
      L.polyline([[25.57, 91.89], [25.17, 92.5], [24.83, 92.79]], {
        color: '#2F80ED',
        weight: 3,
        opacity: 0.8,
        dashArray: '5, 5'
      }).bindTooltip('NH-6 (East Jaintia Hills - Silchar Corridor)', { sticky: true }).addTo(corridorsLayerRef.current);
    }
  }, [locations, historicalEvents, showRiskMarkers, showHistoricalEvents, showCorridors]);

  const activeRadarFrame = radarFrames[currentFrameIndex] || null;

  return (
    <div className="relative w-full h-full min-h-[500px] bg-white flex flex-col rounded-xl overflow-hidden border border-slate-200 shadow-xs">
      
      {/* 1. Top Controls Bar (Clean White Pill Cards) */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-2 max-w-[calc(100%-24px)]">
        {/* Layer Checkboxes */}
        <div className="bg-white/95 border border-slate-200 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-xs flex items-center flex-wrap gap-3 text-xs text-[#172033]">
          <div className="flex items-center gap-1.5 font-semibold text-[#0F2747]">
            <Layers className="w-3.5 h-3.5 text-[#2F80ED]" />
            <span>Map Overlays</span>
          </div>

          <div className="h-3 w-px bg-slate-200 hidden sm:block"></div>

          {/* Risk Scores Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#0F2747] transition-colors">
            <input
              type="checkbox"
              checked={showRiskMarkers}
              onChange={(e) => setShowRiskMarkers(e.target.checked)}
              className="rounded border-slate-300 text-[#2F80ED] focus:ring-0 w-3.5 h-3.5"
            />
            <span className="font-medium text-[#172033]">Risk Scores</span>
          </label>

          {/* Doppler Rain Radar Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#0F2747] transition-colors">
            <input
              type="checkbox"
              checked={showDopplerRadar}
              onChange={(e) => setShowDopplerRadar(e.target.checked)}
              className="rounded border-slate-300 text-[#2F80ED] focus:ring-0 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1 text-[#172033]">
              <CloudRain className="w-3.5 h-3.5 text-[#2F80ED]" />
              <span className="font-medium">Rain Radar</span>
            </span>
          </label>

          {/* Satellite Clouds Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#0F2747] transition-colors">
            <input
              type="checkbox"
              checked={showRealClouds}
              onChange={(e) => setShowRealClouds(e.target.checked)}
              className="rounded border-slate-300 text-[#2F80ED] focus:ring-0 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1 text-[#172033]">
              <Cloud className="w-3.5 h-3.5 text-slate-500" />
              <span>Clouds (VIIRS)</span>
            </span>
          </label>

          {/* Historical Events Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#0F2747] transition-colors">
            <input
              type="checkbox"
              checked={showHistoricalEvents}
              onChange={(e) => setShowHistoricalEvents(e.target.checked)}
              className="rounded border-slate-300 text-[#2F80ED] focus:ring-0 w-3.5 h-3.5"
            />
            <span>Historical</span>
          </label>

          {/* Highway Lifelines */}
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#0F2747] transition-colors">
            <input
              type="checkbox"
              checked={showCorridors}
              onChange={(e) => setShowCorridors(e.target.checked)}
              className="rounded border-slate-300 text-[#2F80ED] focus:ring-0 w-3.5 h-3.5"
            />
            <span>Highways (NH)</span>
          </label>
        </div>

        {/* Basemap Switcher */}
        <div className="bg-white/95 border border-slate-200 backdrop-blur-md px-1.5 py-1 rounded-lg shadow-xs flex items-center gap-1 text-[11px] text-[#64748B]">
          <button
            onClick={() => setActiveBasemap('voyager')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeBasemap === 'voyager' ? 'bg-[#0F2747] text-white font-medium shadow-xs' : 'hover:text-[#0F2747]'
            }`}
          >
            Light
          </button>
          <button
            onClick={() => setActiveBasemap('terrain')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeBasemap === 'terrain' ? 'bg-[#0F2747] text-white font-medium shadow-xs' : 'hover:text-[#0F2747]'
            }`}
          >
            Terrain
          </button>
          <button
            onClick={() => setActiveBasemap('carto-dark')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeBasemap === 'carto-dark' ? 'bg-[#0F2747] text-white font-medium shadow-xs' : 'hover:text-[#0F2747]'
            }`}
          >
            Dark
          </button>
        </div>
      </div>

      {/* 2. Floating Meteorological & Radar Meter HUD (Top Right, Clean GovTech Card) */}
      <div className="absolute top-14 sm:top-3 right-3 z-[400] w-76 sm:w-84 max-w-[calc(100%-24px)] bg-white/98 border border-slate-200 backdrop-blur-md rounded-xl shadow-md overflow-hidden transition-all duration-300">
        {/* HUD Header */}
        <div className="flex items-center justify-between p-2.5 border-b border-slate-100 bg-[#F6F8FB]">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-blue-50 text-[#2F80ED]">
              <Gauge className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#0F2747]">Hydromet Radar & Meter</span>
                <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
                  Live Sync
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsMeterExpanded(!isMeterExpanded)}
            className="p-1 rounded text-slate-400 hover:text-[#0F2747] hover:bg-slate-200 transition-colors"
            title={isMeterExpanded ? 'Collapse Meter' : 'Expand Meter'}
          >
            {isMeterExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* HUD Content */}
        {isMeterExpanded ? (
          <div className="p-3 space-y-3 text-xs text-[#172033]">
            {/* Precipitation Meter */}
            <div className="space-y-1.5 bg-[#F6F8FB] p-2.5 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-[#0F2747] flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-[#2F80ED]" /> Rain Rate
                </span>
                <span className="font-mono font-bold text-xs text-[#0F2747]">
                  {liveMeter ? `${liveMeter.precipitation.toFixed(1)} mm/h` : '0.0 mm/h'}
                  <span className="text-[10px] text-slate-400 ml-1 font-normal">({liveMeter?.dbzEquivalent || 10} dBZ)</span>
                </span>
              </div>

              {/* Graphical Scale */}
              <div className="relative h-2 w-full rounded-full overflow-hidden flex bg-slate-200">
                <div className="h-full bg-sky-400 w-1/4" title="Light: 0-2.5 mm/h"></div>
                <div className="h-full bg-emerald-500 w-1/4" title="Moderate: 2.5-10 mm/h"></div>
                <div className="h-full bg-amber-500 w-1/4" title="Heavy: 10-50 mm/h"></div>
                <div className="h-full bg-red-600 w-1/4" title="Cloudburst: >50 mm/h"></div>
                {liveMeter && (
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-[#0F2747] transform -translate-x-1/2"
                    style={{ left: `${Math.min(98, Math.max(2, (liveMeter.precipitation / 50) * 100))}%` }}
                  />
                )}
              </div>
              <div className="flex justify-between text-[9px] text-[#64748B] font-mono">
                <span>0 mm/h</span>
                <span>10 mm/h</span>
                <span>50 mm/h (Hazard)</span>
              </div>
            </div>

            {/* Cloud Cover Meter */}
            <div className="space-y-1.5 bg-[#F6F8FB] p-2.5 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-[#0F2747] flex items-center gap-1">
                  <Cloud className="w-3.5 h-3.5 text-slate-500" /> Cloud Cover
                </span>
                <span className="font-mono font-bold text-xs text-[#0F2747]">
                  {liveMeter ? `${liveMeter.cloudCover}%` : '65%'}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#176B87]"
                  style={{ width: `${liveMeter ? liveMeter.cloudCover : 65}%` }}
                />
              </div>
            </div>

            {/* Radar Animation Controls */}
            {showDopplerRadar && radarFrames.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#64748B]">Doppler Frame:</span>
                  <span className="font-mono text-[#0F2747] font-semibold text-[11px]">
                    {activeRadarFrame?.formattedTimeIST}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentFrameIndex((prev) => (prev - 1 + radarFrames.length) % radarFrames.length)}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Previous Frame"
                  >
                    <SkipBack className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => setIsPlayingRadar(!isPlayingRadar)}
                    className="p-1 px-2.5 rounded bg-[#0F2747] hover:bg-[#176B87] text-white font-medium flex items-center gap-1 text-[11px] transition-colors"
                  >
                    {isPlayingRadar ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isPlayingRadar ? 'Pause' : 'Play'}</span>
                  </button>

                  <button
                    onClick={() => setCurrentFrameIndex((prev) => (prev + 1) % radarFrames.length)}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Next Frame"
                  >
                    <SkipForward className="w-3 h-3" />
                  </button>

                  <div className="flex-1 text-right">
                    <span className="text-[10px] text-slate-400">
                      {activeRadarFrame?.relativeTimeStr}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Compact preview when collapsed */
          <div className="p-2 px-3 flex items-center justify-between text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <CloudRain className="w-3 h-3 text-[#2F80ED]" />
              <span>Rain: <strong className="text-[#0F2747] font-mono">{liveMeter ? `${liveMeter.precipitation.toFixed(1)} mm/h` : '0 mm/h'}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <Cloud className="w-3 h-3 text-slate-400" />
              <span>Clouds: <strong className="text-[#0F2747] font-mono">{liveMeter ? `${liveMeter.cloudCover}%` : '65%'}</strong></span>
            </span>
          </div>
        )}
      </div>

      {/* 3. Map Legend (Bottom Left, Clean White Card) */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 border border-slate-200 backdrop-blur-md p-3 rounded-lg shadow-xs text-xs space-y-2 max-w-[200px]">
        <div className="font-bold text-[#0F2747] flex items-center justify-between text-[11px]">
          <span>Risk Severity Legend</span>
          <span className="text-[10px] text-[#64748B] font-normal">Score</span>
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-600"></span>
              <span className="text-[#172033] font-medium">Very High</span>
            </div>
            <span className="font-mono text-red-600 font-bold text-[10px]">76 - 100</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span>
              <span className="text-[#172033] font-medium">High</span>
            </div>
            <span className="font-mono text-orange-600 font-bold text-[10px]">51 - 75</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-[#172033] font-medium">Moderate</span>
            </div>
            <span className="font-mono text-amber-600 font-bold text-[10px]">26 - 50</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span className="text-[#172033] font-medium">Low</span>
            </div>
            <span className="font-mono text-emerald-600 font-bold text-[10px]">0 - 25</span>
          </div>
        </div>
        <div className="pt-1.5 border-t border-slate-100 text-[10px] text-[#64748B]">
          ✕ Historical event (GSI Catalog)
        </div>
      </div>

      {/* 4. The Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};
