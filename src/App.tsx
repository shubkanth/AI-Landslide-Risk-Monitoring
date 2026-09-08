import React, { useState, useMemo } from 'react';
import { NER_LOCATIONS, HISTORICAL_LANDSLIDES } from './data/nerData';
import { LocationData, RiskPredictionResult } from './types';
import { calculateLandslideRisk } from './utils/mlInference';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RiskMap } from './components/RiskMap';
import { LocationAnalysisPanel } from './components/LocationAnalysisPanel';
import { SimulationSandbox } from './components/SimulationSandbox';
import { HotspotsRanking } from './components/HotspotsRanking';
import { HistoricalAnalytics } from './components/HistoricalAnalytics';
import { AdminAlertsView } from './components/AdminAlertsView';
import { ModelExplainabilityView } from './components/ModelExplainabilityView';
import { LandsafeAIChat } from './components/LandsafeAIChat';
import { AboutSIHModal } from './components/AboutSIHModal';
import { 
  AlertTriangle, 
  CloudRain, 
  MapPin, 
  ShieldCheck, 
  TrendingUp, 
  Activity,
  Flame,
  Radio
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('map');
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [simulationTarget, setSimulationTarget] = useState<LocationData | null>(null);
  const [showAssistantModal, setShowAssistantModal] = useState<boolean>(false);
  const [showSIHModal, setShowSIHModal] = useState<boolean>(false);

  // Filter locations by state & search query
  const filteredLocations = useMemo(() => {
    return NER_LOCATIONS.filter((loc) => {
      if (selectedState !== 'All States' && loc.state !== selectedState) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          loc.name.toLowerCase().includes(q) ||
          loc.district.toLowerCase().includes(q) ||
          loc.state.toLowerCase().includes(q) ||
          loc.geology.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedState, searchQuery]);

  // Aggregate statistics across NER
  const stats = useMemo(() => {
    let criticalCount = 0;
    let warningCount = 0;
    let watchCount = 0;
    let totalRain = 0;

    NER_LOCATIONS.forEach((loc) => {
      const risk = calculateLandslideRisk(loc);
      if (risk.alertLevel === 'CRITICAL') criticalCount++;
      else if (risk.alertLevel === 'WARNING') warningCount++;
      else if (risk.alertLevel === 'WATCH') watchCount++;
      totalRain += loc.rainfall24h;
    });

    return {
      criticalCount,
      warningCount,
      watchCount,
      avgRain24h: Math.round(totalRain / NER_LOCATIONS.length)
    };
  }, []);

  const handleOpenSimulation = (loc: LocationData) => {
    setSimulationTarget(loc);
    setActiveTab('simulation');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAssistant={() => setShowAssistantModal(true)}
        onOpenSIHInfo={() => setShowSIHModal(true)}
        activeCriticalCount={stats.criticalCount}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          criticalAlertCount={stats.criticalCount}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto flex flex-col bg-slate-950">
          {/* Top Metric Bar (Present on Map & Hotspots tabs) */}
          {(activeTab === 'map' || activeTab === 'hotspots') && (
            <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2.5">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Active Monitored: <strong className="text-white font-mono">{filteredLocations.length}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span>Critical Hazards: <strong className="text-red-400 font-mono">{stats.criticalCount}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 hidden sm:flex">
                    <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                    <span>Warnings: <strong className="text-orange-400 font-mono">{stats.warningCount}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 hidden md:flex">
                    <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                    <span>Avg 24h Rain: <strong className="text-sky-300 font-mono">{stats.avgRain24h} mm</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSIHModal(true)}
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
                  >
                    <span>System Architecture & Open-Data Stack</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Views */}
          <div className="flex-1 p-3 sm:p-4 md:p-6">
            {activeTab === 'map' && (
              <div className="h-[calc(100vh-145px)] w-full relative">
                <RiskMap
                  locations={filteredLocations}
                  historicalEvents={HISTORICAL_LANDSLIDES}
                  selectedLocation={selectedLocation}
                  onSelectLocation={(loc) => setSelectedLocation(loc)}
                  onOpenSimulation={handleOpenSimulation}
                />
              </div>
            )}

            {activeTab === 'hotspots' && (
              <HotspotsRanking
                locations={filteredLocations}
                onSelectLocation={(loc) => setSelectedLocation(loc)}
                onOpenSimulation={handleOpenSimulation}
              />
            )}

            {activeTab === 'simulation' && (
              <SimulationSandbox
                locations={NER_LOCATIONS}
                initialLocation={simulationTarget}
                onSelectLocationForMap={(loc) => {
                  setSelectedLocation(loc);
                  setActiveTab('map');
                }}
              />
            )}

            {activeTab === 'analytics' && (
              <HistoricalAnalytics
                events={HISTORICAL_LANDSLIDES}
              />
            )}

            {activeTab === 'alerts' && (
              <AdminAlertsView
                locations={NER_LOCATIONS}
                onSelectLocation={(loc) => {
                  setSelectedLocation(loc);
                  setActiveTab('map');
                }}
              />
            )}

            {activeTab === 'model' && (
              <ModelExplainabilityView />
            )}

            {activeTab === 'assistant' && (
              <LandsafeAIChat />
            )}

            {activeTab === 'about' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <span>Geospatial AI & Disaster Early Warning Platform</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white">
                    AI-Based Early Warning and Landslide Risk Monitoring System in NER
                  </h1>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Landsafe NER is an open-source, zero-cost GovTech solution engineered specifically for the steep, monsoon-saturated terrain of North East India. It processes geospatial digital elevation models, hydrometeorological radar observations, and historical landslide inventories into actionable early-warning alerts for District Disaster Management Authorities.
                  </p>
                  <button
                    onClick={() => setShowSIHModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                  >
                    View Complete Technical Blueprint & Zero-Budget Rationale
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Detail Analysis Drawer */}
      {selectedLocation && (
        <LocationAnalysisPanel
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onOpenSimulation={handleOpenSimulation}
        />
      )}

      {/* Landsafe AI Floating Assistant Modal (when triggered from Navbar) */}
      {showAssistantModal && (
        <div className="fixed inset-0 z-[650] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-3 border-b border-slate-800 flex justify-end">
              <button
                onClick={() => setShowAssistantModal(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800"
              >
                Close Assistant âœ•
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <LandsafeAIChat onClose={() => setShowAssistantModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* SIH Problem Statement Modal */}
      {showSIHModal && (
        <AboutSIHModal
          onClose={() => setShowSIHModal(false)}
          onOpenDashboard={() => {
            setShowSIHModal(false);
            setActiveTab('map');
          }}
        />
      )}
    </div>
  );
}
