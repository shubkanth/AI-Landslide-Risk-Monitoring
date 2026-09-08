import React, { useState } from 'react';
import { LocationData, RiskPredictionResult } from '../types';
import { calculateLandslideRisk } from '../utils/mlInference';
import { 
  Sliders, 
  CloudRain, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  TrendingUp, 
  MapPin, 
  ShieldCheck, 
  ChevronRight 
} from 'lucide-react';

interface SimulationSandboxProps {
  locations: LocationData[];
  initialLocation?: LocationData | null;
  onSelectLocationForMap: (loc: LocationData) => void;
}

export const SimulationSandbox: React.FC<SimulationSandboxProps> = ({
  locations,
  initialLocation,
  onSelectLocationForMap
}) => {
  const [selectedLocId, setSelectedLocId] = useState<string>(
    initialLocation ? initialLocation.id : (locations[0]?.id || '')
  );

  const currentLocation = locations.find((l) => l.id === selectedLocId) || locations[0];

  const [simulated24h, setSimulated24h] = useState<number>(
    currentLocation ? currentLocation.rainfall24h : 50
  );
  const [simulated7d, setSimulated7d] = useState<number>(
    currentLocation ? currentLocation.rainfall7d : 150
  );

  const handleLocationChange = (id: string) => {
    setSelectedLocId(id);
    const loc = locations.find((l) => l.id === id);
    if (loc) {
      setSimulated24h(loc.rainfall24h);
      setSimulated7d(loc.rainfall7d);
    }
  };

  if (!currentLocation) return null;

  const baselineRisk: RiskPredictionResult = calculateLandslideRisk(currentLocation);
  const simulatedRisk: RiskPredictionResult = calculateLandslideRisk(
    currentLocation,
    simulated24h,
    simulated7d
  );

  const deltaScore = simulatedRisk.score - baselineRisk.score;

  const PRESETS = [
    { name: 'Dry Break / Low Shower', r24: 15, r7d: 45 },
    { name: 'Moderate Monsoon Rain', r24: 55, r7d: 140 },
    { name: 'Heavy Sustained Downpour', r24: 120, r7d: 320 },
    { name: 'Extreme Cloudburst / Cyclone', r24: 220, r7d: 580 }
  ];

  const applyPreset = (preset: { name: string; r24: number; r7d: number }) => {
    setSimulated24h(preset.r24);
    setSimulated7d(preset.r7d);
  };

  const getRiskBadge = (cat: string) => {
    switch (cat) {
      case 'VERY_HIGH': return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MODERATE': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Title Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#2F80ED] text-xs font-semibold uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>Interactive What-If Scenario Modeling</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F2747] mt-1">
            Rainfall & Landslide Trigger Simulation Sandbox
          </h1>
          <p className="text-xs text-[#64748B] mt-1 max-w-2xl">
            Simulate sudden meteorological anomalies (cloudbursts, sustained monsoon troughs, cyclone remnant deluges) to evaluate instantaneous slope pore-water response and early warning threshold escalation.
          </p>
        </div>

        {/* Location selector */}
        <div className="bg-[#F6F8FB] p-2.5 rounded-lg border border-slate-200 shrink-0">
          <label className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider block mb-1">
            Target Sector
          </label>
          <select
            value={selectedLocId}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="bg-white text-[#172033] text-xs font-semibold rounded-md px-3 py-1.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/30 cursor-pointer"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.district}, {loc.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Simulation Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Presets */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2.5">
            <span className="text-xs font-semibold text-[#0F2747] block">
              Quick Meteorological Presets:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className="text-left p-2.5 rounded-lg bg-[#F6F8FB] hover:bg-slate-100 border border-slate-200 hover:border-[#2F80ED] text-xs transition-colors group"
                >
                  <div className="font-semibold text-[#0F2747] group-hover:text-[#2F80ED]">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-[#64748B] font-mono mt-0.5">
                    {p.r24}mm / 24h • {p.r7d}mm ARI
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            {/* 24-hr Rainfall */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#0F2747] flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-[#2F80ED]" />
                  <span>24-Hour Rainfall Intensity</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-[#2F80ED] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {simulated24h} mm
                  </span>
                  <span className="text-[10px] text-slate-400">
                    (Base: {currentLocation.rainfall24h}mm)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="350"
                step="5"
                value={simulated24h}
                onChange={(e) => setSimulated24h(Number(e.target.value))}
                className="w-full accent-[#2F80ED] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#64748B] font-mono">
                <span>0 mm</span>
                <span>60 mm (Alert)</span>
                <span>150 mm (Severe)</span>
                <span>350 mm</span>
              </div>
            </div>

            {/* 7-Day Antecedent Moisture */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#0F2747] flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#176B87]" />
                  <span>7-Day Antecedent Rainfall (Soil Saturation)</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-[#176B87] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {simulated7d} mm
                  </span>
                  <span className="text-[10px] text-slate-400">
                    (Base: {currentLocation.rainfall7d}mm)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="800"
                step="10"
                value={simulated7d}
                onChange={(e) => setSimulated7d(Number(e.target.value))}
                className="w-full accent-[#176B87] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#64748B] font-mono">
                <span>10 mm (Dry)</span>
                <span>200 mm (Moist)</span>
                <span>500 mm (Saturated)</span>
                <span>800 mm</span>
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => {
                setSimulated24h(currentLocation.rainfall24h);
                setSimulated7d(currentLocation.rainfall7d);
              }}
              className="w-full py-1.5 rounded-lg bg-[#F6F8FB] hover:bg-slate-200 text-[#0F2747] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#2F80ED]" />
              <span>Reset to Current Sensor Readings</span>
            </button>
          </div>
        </div>

        {/* Results Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Simulation Outcome
                </span>
                <h2 className="text-base font-bold text-[#0F2747]">
                  {currentLocation.name} Response Matrix
                </h2>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getRiskBadge(simulatedRisk.category)}`}>
                {simulatedRisk.category.replace('_', ' ')} RISK
              </span>
            </div>

            {/* Before vs After Score Cards */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-[#F6F8FB] p-3.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-[#64748B] uppercase font-semibold">Baseline Risk Score</span>
                <div className="text-2xl font-bold font-mono text-[#0F2747] mt-1">
                  {baselineRisk.score} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </div>
                <span className="text-[11px] text-[#64748B]">{baselineRisk.category.replace('_', ' ')}</span>
              </div>

              <div className="bg-blue-50/50 p-3.5 rounded-lg border border-blue-200">
                <span className="text-[10px] text-[#2F80ED] uppercase font-semibold">Simulated Risk Score</span>
                <div className="text-2xl font-bold font-mono text-[#0F2747] mt-1">
                  {simulatedRisk.score} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold font-mono">
                  <span className={deltaScore > 0 ? 'text-red-600' : 'text-emerald-600'}>
                    {deltaScore > 0 ? `+${deltaScore}` : deltaScore}
                  </span>
                  <span className="text-slate-500 font-normal">points</span>
                </div>
              </div>
            </div>

            {/* AI Explanation of Simulation */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#176B87] block">
                Model Synthesis Under Simulated Load:
              </span>
              <p className="text-xs text-[#172033] leading-relaxed italic">
                "{simulatedRisk.explanation}"
              </p>
            </div>

            {/* DDMA Advisory Action */}
            <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-lg space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Escalated DDMA Advisory:
              </span>
              <p className="text-xs text-amber-900 leading-relaxed">
                {simulatedRisk.recommendedAction}
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={() => onSelectLocationForMap(currentLocation)}
              className="w-full py-2 rounded-lg bg-[#0F2747] hover:bg-[#176B87] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>View This Sector on Interactive Map</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
