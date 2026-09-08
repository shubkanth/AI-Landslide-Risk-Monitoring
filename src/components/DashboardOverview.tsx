import React, { useState } from 'react';
import { LocationData, LandslideEvent, RiskPredictionResult } from '../types';
import { calculateLandslideRisk } from '../utils/mlInference';
import { RiskMap } from './RiskMap';
import { 
  AlertTriangle, 
  CloudRain, 
  MapPin, 
  Activity, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  ShieldAlert,
  Sliders,
  Sparkles,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

interface DashboardOverviewProps {
  locations?: LocationData[];
  historicalEvents?: LandslideEvent[];
  selectedLocation?: LocationData | null;
  onSelectLocation?: (loc: LocationData) => void;
  onOpenSimulation?: (loc: LocationData) => void;
  onOpenDetailedAnalysis?: (loc: LocationData) => void;
  setActiveTab?: (tab: string) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenSystemOverview?: () => void;
  criticalCount?: number;
  warningCount?: number;
  watchCount?: number;
  avgRainfall?: number;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  locations = [],
  historicalEvents = [],
  selectedLocation = null,
  onSelectLocation = (_loc: LocationData) => {},
  onOpenSimulation = (_loc: LocationData) => {},
  onOpenDetailedAnalysis,
  setActiveTab,
  onNavigateTab,
  onOpenSystemOverview
}) => {
  const [showHero, setShowHero] = useState<boolean>(true);
  const handleNavTab = (tab: string) => {
    if (setActiveTab) setActiveTab(tab);
    else if (onNavigateTab) onNavigateTab(tab);
  };
  const handleDetailedAnalysis = (loc: LocationData) => {
    if (onOpenDetailedAnalysis) onOpenDetailedAnalysis(loc);
    else onSelectLocation(loc);
  };

  // Derived real data metrics
  const safeLocations = locations || [];
  const totalMonitored = safeLocations.length;
  
  // Calculate risks for all locations
  const evaluatedLocations = safeLocations.map((loc) => ({
    location: loc,
    risk: calculateLandslideRisk(loc)
  }));

  const veryHighRiskCount = evaluatedLocations.filter((e) => e.risk.category === 'VERY_HIGH').length;
  const highRiskCount = evaluatedLocations.filter((e) => e.risk.category === 'HIGH').length;
  const highRiskZonesTotal = veryHighRiskCount + highRiskCount;

  const activeAlertsList = evaluatedLocations
    .filter((e) => e.risk.alertLevel === 'CRITICAL' || e.risk.alertLevel === 'WARNING')
    .sort((a, b) => b.risk.score - a.risk.score);

  const activeAlertsCount = activeAlertsList.length;

  // Selected location or top critical location for the quick-inspect card
  const inspectTarget = selectedLocation 
    ? { location: selectedLocation, risk: calculateLandslideRisk(selectedLocation) }
    : (evaluatedLocations[0] || null);

  return (
    <div className="space-y-4 pb-6">
      {/* 1. Optional Polished Landing / Hero Banner (Clean Navy & Slate, subtle topographic design) */}
      {showHero && (
        <div className="relative overflow-hidden rounded-xl bg-[#0F2747] text-white p-5 sm:p-6 border border-[#173860] shadow-sm">
          {/* Subtle topographic grid visual accent */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(#2F80ED_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="relative z-10 max-w-3xl space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#176B87]/40 text-sky-200 border border-[#176B87]/50">
                Climate Intelligence Platform
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-xs text-slate-300 hidden sm:inline">North Eastern Geospatial Grid</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
              Predict landslide risk before disaster strikes.
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-normal">
              AI-powered landslide monitoring and early-warning intelligence for India's North Eastern Region. Fusing terrain gradients, real-time Doppler radar observations, and historical landslide susceptibility.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => {
                  const mapElement = document.getElementById('map-view-anchor');
                  if (mapElement) mapElement.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#2F80ED] hover:bg-[#256cd1] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Open Risk Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleNavTab('model')}
                className="bg-[#173860] hover:bg-[#1f4a7c] text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors border border-slate-600/40"
              >
                Explore How It Works
              </button>

              <button
                onClick={() => setShowHero(false)}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors ml-auto text-[11px]"
              >
                Dismiss Intro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Concise Top-Level Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Stat 1: Monitored Area */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Monitored Area</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-1 text-2xl font-bold text-[#0F2747] tracking-tight">
            8 NER States
          </div>
          <div className="mt-0.5 text-[11px] text-[#64748B]">
            {totalMonitored} High-Vulnerability Sectors
          </div>
        </div>

        {/* Stat 2: High-Risk Zones */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">High-Risk Zones</span>
            <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200">
              Active
            </span>
          </div>
          <div className="mt-1 text-2xl font-bold text-orange-600 tracking-tight">
            {highRiskZonesTotal}
          </div>
          <div className="mt-0.5 text-[11px] text-[#64748B]">
            {veryHighRiskCount} Very High / {highRiskCount} High
          </div>
        </div>

        {/* Stat 3: Active Alerts */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Active Alerts</span>
            <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
              Priority
            </span>
          </div>
          <div className="mt-1 text-2xl font-bold text-red-600 tracking-tight">
            {activeAlertsCount}
          </div>
          <div className="mt-0.5 text-[11px] text-[#64748B]">
            Disaster Management Advisories
          </div>
        </div>

        {/* Stat 4: Data Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Data Status</span>
            <span className="text-[10px] font-medium text-[#2F80ED] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
              Auto-Sync
            </span>
          </div>
          <div className="mt-1 text-base sm:text-lg font-bold text-[#0F2747] tracking-tight truncate">
            Updated 15 min ago
          </div>
          <div className="mt-0.5 text-[11px] text-[#64748B] truncate">
            Open-Meteo & IMD Radars
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Body: Interactive Risk Map + Location Quick-Inspect & Alerts Sidebar */}
      <div id="map-view-anchor" className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left: The Interactive Map (Visual Centerpiece - 8 columns on large screens) */}
        <div className="xl:col-span-8 flex flex-col h-[560px] sm:h-[620px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#0F2747]">Interactive Risk Map</h2>
              <span className="text-[10px] text-[#64748B] font-medium">Real-Time Geospatial Surveillance</span>
            </div>
            <button
              onClick={() => handleNavTab('map')}
              className="text-xs text-[#2F80ED] hover:text-[#176B87] font-semibold flex items-center gap-1"
            >
              <span>Full Screen View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 w-full rounded-xl overflow-hidden shadow-xs border border-slate-200 bg-white">
            <RiskMap
              locations={safeLocations}
              historicalEvents={historicalEvents || []}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
              onOpenSimulation={onOpenSimulation}
            />
          </div>
        </div>

        {/* Right: Location Quick-Inspect Card & Active Alerts (4 columns on large screens) */}
        <div className="xl:col-span-4 space-y-4 flex flex-col justify-between">
          {/* Location Quick-Inspect Card (Requested exact specification) */}
          {inspectTarget ? (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              {/* Header */}
              <div className="border-b border-slate-100 pb-2.5">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                  {inspectTarget.location.state}
                </span>
                <div className="flex items-center justify-between mt-0.5">
                  <h3 className="text-base font-bold text-[#0F2747]">
                    {inspectTarget.location.name}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    inspectTarget.risk.category === 'VERY_HIGH' 
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : inspectTarget.risk.category === 'HIGH'
                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                      : inspectTarget.risk.category === 'MODERATE'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {inspectTarget.risk.category.replace('_', ' ')} RISK
                  </span>
                </div>
              </div>

              {/* Risk Score Highlight */}
              <div className="flex items-baseline justify-between bg-[#F6F8FB] p-2.5 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-[#64748B]">Risk Score</span>
                <div className="text-xl font-bold font-mono text-[#0F2747]">
                  {inspectTarget.risk.score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                </div>
              </div>

              {/* Contributing Factors (Visual Bar Graph) */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#0F2747] block">
                  Contributing Factors
                </span>

                <div className="space-y-1.5 text-xs">
                  {/* Factor 1: Rainfall */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-[#64748B]">Rainfall (24h)</span>
                      <span className="font-mono text-[#172033] font-semibold">{inspectTarget.location.rainfall24h} mm</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#2F80ED] h-full rounded-full"
                        style={{ width: `${Math.min(100, (inspectTarget.location.rainfall24h / 150) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Factor 2: Slope */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-[#64748B]">Slope Gradient</span>
                      <span className="font-mono text-[#172033] font-semibold">{inspectTarget.location.slope}°</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#176B87] h-full rounded-full"
                        style={{ width: `${Math.min(100, (inspectTarget.location.slope / 45) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Factor 3: Historical Landslides */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-[#64748B]">Historical Events</span>
                      <span className="font-mono text-[#172033] font-semibold">GSI Spatial Kernel</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-slate-400 h-full rounded-full"
                        style={{ width: `${inspectTarget.risk.category === 'VERY_HIGH' ? 85 : 55}%` }}
                      />
                    </div>
                  </div>

                  {/* Factor 4: Terrain Susceptibility */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-[#64748B]">Terrain Susceptibility</span>
                      <span className="font-mono text-[#172033] font-semibold">{inspectTarget.location.soilSusceptibility} / 10</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#0F2747] h-full rounded-full"
                        style={{ width: `${(inspectTarget.location.soilSusceptibility / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Explanation Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#176B87] block">
                  AI Explanation
                </span>
                <p className="text-xs text-[#172033] leading-relaxed italic">
                  "{inspectTarget.risk.explanation}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleDetailedAnalysis(inspectTarget.location)}
                  className="bg-[#0F2747] hover:bg-[#176B87] text-white text-xs font-semibold py-2 px-2.5 rounded-lg transition-colors text-center shadow-xs"
                >
                  View Detailed Analysis
                </button>
                <button
                  onClick={() => onOpenSimulation(inspectTarget.location)}
                  className="bg-white hover:bg-slate-50 text-[#0F2747] border border-slate-300 text-xs font-semibold py-2 px-2.5 rounded-lg transition-colors text-center"
                >
                  Simulate Rain
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center text-xs text-[#64748B]">
              Select a location on the map to inspect risk details.
            </div>
          )}

          {/* Active Alerts Panel (Requested specification) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2.5 flex-1 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <h3 className="text-xs font-bold text-[#0F2747]">Active Early Warnings</h3>
              </div>
              <button
                onClick={() => handleNavTab('alerts')}
                className="text-[11px] text-[#2F80ED] hover:underline font-medium"
              >
                View All ({activeAlertsCount})
              </button>
            </div>

            <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
              {activeAlertsList.slice(0, 3).map(({ location, risk }) => (
                <div 
                  key={location.id} 
                  className="p-2.5 rounded-lg border border-slate-200 bg-[#F6F8FB] hover:bg-white hover:border-[#2F80ED] transition-colors space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F2747] truncate max-w-[170px]">
                      {location.name} ({location.district})
                    </span>
                    <span className="font-mono font-bold text-red-600">
                      {risk.score}/100
                    </span>
                  </div>

                  <p className="text-[11px] text-[#64748B]">
                    Reason: <span className="text-[#172033]">{risk.topFactors[0]?.displayName} ({risk.topFactors[0]?.value}) on {location.slope}° slope</span>
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="text-slate-400">10 minutes ago</span>
                    <button
                      onClick={() => {
                        onSelectLocation(location);
                      }}
                      className="text-[#2F80ED] hover:underline font-semibold"
                    >
                      [View Location]
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
