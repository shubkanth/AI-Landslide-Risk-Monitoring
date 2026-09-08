import React, { useState, useMemo } from 'react';
import { NER_LOCATIONS, HISTORICAL_LANDSLIDES } from './data/nerData';
import { LocationData } from './types';
import { calculateLandslideRisk } from './utils/mlInference';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { RiskMap } from './components/RiskMap';
import { LocationAnalysisPanel } from './components/LocationAnalysisPanel';
import { SimulationSandbox } from './components/SimulationSandbox';
import { HotspotsRanking } from './components/HotspotsRanking';
import { HistoricalAnalytics } from './components/HistoricalAnalytics';
import { AdminAlertsView } from './components/AdminAlertsView';
import { ModelExplainabilityView } from './components/ModelExplainabilityView';
import { DataSourcesView } from './components/DataSourcesView';
import { LandsafeAIChat } from './components/LandsafeAIChat';
import { SettingsView } from './components/SettingsView';
import { AboutSIHModal } from './components/AboutSIHModal';
import { CloudRain } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
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

    (NER_LOCATIONS || []).forEach((loc) => {
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
      avgRain24h: NER_LOCATIONS?.length ? Math.round(totalRain / NER_LOCATIONS.length) : 0
    };
  }, []);

  const handleOpenSimulation = (loc: LocationData) => {
    setSimulationTarget(loc);
    setActiveTab('simulation');
  };

  const handleSelectLocation = (loc: LocationData) => {
    setSelectedLocation(loc);
    setActiveTab('map');
  };

  return (
    <div className="h-screen h-[100dvh] max-h-screen overflow-hidden bg-[#F6F8FB] text-[#172033] flex flex-col font-sans selection:bg-[#2F80ED] selection:text-white">
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
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          criticalAlertCount={stats.criticalCount}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto flex flex-col bg-[#F6F8FB] min-h-0">
          {/* Top Metric Bar (Present on Map & Hotspots tabs) */}
          {(activeTab === 'map' || activeTab === 'hotspots') && (
            <div className="bg-white border-b border-slate-200 px-4 py-2 shadow-2xs">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 text-[#64748B]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Active Monitored: <strong className="text-[#0F2747] font-mono">{filteredLocations.length}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-calm-pulse"></span>
                    <span>Critical Advisories: <strong className="text-red-600 font-mono">{stats.criticalCount}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 hidden sm:flex">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    <span>Warnings: <strong className="text-orange-600 font-mono">{stats.warningCount}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 hidden md:flex">
                    <CloudRain className="w-3.5 h-3.5 text-[#2F80ED]" />
                    <span>Avg 24h Rain: <strong className="text-[#0F2747] font-mono">{stats.avgRain24h} mm</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSIHModal(true)}
                    className="text-[11px] font-semibold text-[#2F80ED] hover:text-[#176B87] transition-colors flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200"
                  >
                    <span>System Architecture Blueprint</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab Views */}
          <div className="flex-1 p-3 sm:p-4 md:p-6">
            {activeTab === 'dashboard' && (
              <DashboardOverview
                locations={filteredLocations}
                historicalEvents={HISTORICAL_LANDSLIDES}
                selectedLocation={selectedLocation}
                criticalCount={stats.criticalCount}
                warningCount={stats.warningCount}
                watchCount={stats.watchCount}
                avgRainfall={stats.avgRain24h}
                onSelectLocation={handleSelectLocation}
                onOpenSimulation={handleOpenSimulation}
                onOpenDetailedAnalysis={handleSelectLocation}
                setActiveTab={setActiveTab}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenSystemOverview={() => setShowSIHModal(true)}
              />
            )}

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
                onSelectLocation={handleSelectLocation}
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
                onSelectLocation={handleSelectLocation}
              />
            )}

            {activeTab === 'model' && (
              <ModelExplainabilityView />
            )}

            {activeTab === 'datasources' && (
              <DataSourcesView />
            )}

            {activeTab === 'assistant' && (
              <LandsafeAIChat />
            )}

            {activeTab === 'settings' && (
              <SettingsView />
            )}

            {activeTab === 'about' && (
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-[#2F80ED] text-xs font-bold uppercase tracking-wider">
                    <span>Geospatial AI & Disaster Early Warning Platform</span>
                  </div>
                  <h1 className="text-2xl font-bold text-[#0F2747]">
                    AI-Based Early Warning and Landslide Risk Monitoring System in NER
                  </h1>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Landsafe NER is an open-source, zero-cost GovTech solution engineered specifically for the steep, monsoon-saturated terrain of North East India. It processes geospatial digital elevation models, hydrometeorological radar observations, and historical landslide inventories into actionable early-warning alerts for District Disaster Management Authorities.
                  </p>
                  <button
                    onClick={() => setShowSIHModal(true)}
                    className="bg-[#0F2747] hover:bg-[#176B87] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-[650] bg-[#0F2747]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-3 border-b border-slate-200 flex justify-end bg-[#F6F8FB]">
              <button
                onClick={() => setShowAssistantModal(false)}
                className="text-xs text-[#0F2747] hover:bg-slate-200 px-2.5 py-1 rounded-md bg-white border border-slate-200 font-medium"
              >
                Close Assistant ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-3 bg-[#F6F8FB]">
              <LandsafeAIChat onClose={() => setShowAssistantModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Architecture & GovTech Blueprint Modal */}
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
