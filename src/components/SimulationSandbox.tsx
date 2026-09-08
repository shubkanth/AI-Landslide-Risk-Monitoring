import React, { useState } from 'react';
import { LocationData, RiskPredictionResult } from '../types';
import { calculateLandslideRisk } from '../utils/mlInference';
import { 
  Sliders, 
  CloudRain, 
  AlertTriangle, 
  ArrowRight, 
  Zap, 
  RefreshCw, 
  HelpCircle,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Check
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

  // When selected location changes, sync defaults
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

  // Preset scenarios
  const applyPreset = (preset: { name: string; r24: number; r7d: number }) => {
    setSimulated24h(preset.r24);
    setSimulated7d(preset.r7d);
  };

  const PRESETS = [
    { name: 'Dry Break / Low Shower', r24: 15, r7d: 45 },
    { name: 'Moderate Monsoon Rain', r24: 55, r7d: 140 },
    { name: 'Heavy Sustained Downpour', r24: 120, r7d: 320 },
    { name: 'Extreme Cloudburst / Remal Cyclone', r24: 220, r7d: 580 }
  ];

  const getRiskColor = (category: string) => {
    switch (category) {
      case 'VERY_HIGH': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'HIGH': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'MODERATE': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>Interactive What-If Scenario Modeling</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Rainfall & Landslide Trigger Simulation Sandbox
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Simulate sudden meteorological anomalies (cloudbursts, sustained monsoon troughs, cyclone remnant deluges) to evaluate instantaneous slope pore-water response and early warning threshold escalation.
          </p>
        </div>

        {/* Location selector */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 shrink-0">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Target Sector
          </label>
          <select
            value={selectedLocId}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs font-medium rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Preset Buttons */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-semibold text-slate-300 block">
              Quick Meteorological Presets:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className="text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-[11px] transition-all group"
                >
                  <div className="font-medium text-slate-200 group-hover:text-amber-300">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {p.r24}mm / 24h â€¢ {p.r7d}mm ARI
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            {/* Slider 1: 24-hr Rainfall */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-sky-400" />
                  <span>24-Hour Rainfall Intensity</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
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
                className="w-full accent-sky-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 mm (Dry)</span>
                <span>60 mm (Alert threshold)</span>
                <span>150 mm (Severe)</span>
                <span>350 mm</span>
              </div>
            </div>

            {/* Slider 2: 7-Day Antecedent Rainfall */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>7-Day Antecedent Moisture (ARI)</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                    {simulated7d} mm
                  </span>
                  <span className="text-[10px] text-slate-400">
                    (Base: {currentLocation.rainfall7d}mm)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="750"
                step="10"
                value={simulated7d}
                onChange={(e) => setSimulated7d(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 mm</span>
                <span>200 mm</span>
                <span>450 mm (Field Capacity)</span>
                <span>750 mm</span>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setSimulated24h(currentLocation.rainfall24h);
                setSimulated7d(currentLocation.rainfall7d);
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Real Observational Baseline</span>
            </button>
          </div>

          {/* Environmental profile card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 text-slate-400">
            <span className="font-semibold text-slate-300 block text-[11px] uppercase tracking-wider">
              Static Topographical Features:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>Slope: <strong className="text-slate-200">{currentLocation.slope}Â°</strong></div>
              <div>Elevation: <strong className="text-slate-200">{currentLocation.elevation}m</strong></div>
              <div>Soil Susceptibility: <strong className="text-slate-200">{currentLocation.soilSusceptibility}/10</strong></div>
              <div>Historical Incidents: <strong className="text-slate-200">{currentLocation.historicalEventsCount}</strong></div>
            </div>
          </div>
        </div>

        {/* Results Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Comparison Cards: Baseline vs Simulated */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Baseline Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Baseline Condition</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  Observed
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-slate-200">
                  {baselineRisk.score}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <div className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-block border ${getRiskColor(baselineRisk.category)}`}>
                {baselineRisk.category}
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 space-y-0.5">
                <div>Rainfall 24h: <strong className="text-slate-200">{currentLocation.rainfall24h} mm</strong></div>
                <div>Alert Level: <strong className="text-slate-200">{baselineRisk.alertLevel}</strong></div>
              </div>
            </div>

            {/* Simulated Card */}
            <div className={`bg-slate-900 border rounded-2xl p-4 space-y-3 relative overflow-hidden ${
              simulatedRisk.category === 'VERY_HIGH' ? 'border-red-500/50 shadow-xl shadow-red-950/20' :
              simulatedRisk.category === 'HIGH' ? 'border-orange-500/50' : 'border-slate-800'
            }`}>
              {simulatedRisk.category === 'VERY_HIGH' && (
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                  Critical Trigger
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulated Response</span>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  deltaScore > 0 ? 'bg-red-500/20 text-red-400' : deltaScore < 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {deltaScore > 0 ? `+${deltaScore} pts` : `${deltaScore} pts`}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-white">
                  {simulatedRisk.score}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <div className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-block border ${getRiskColor(simulatedRisk.category)}`}>
                {simulatedRisk.category}
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 space-y-0.5">
                <div>Simulated Rain: <strong className="text-white">{simulated24h} mm</strong></div>
                <div>Alert Level: <strong className="text-amber-300">{simulatedRisk.alertLevel}</strong></div>
              </div>
            </div>
          </div>

          {/* Dynamic Machine Explanation */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Simulated Hazard Mechanistic Explanation</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {simulatedRisk.explanation}
            </p>
          </div>

          {/* Simulated SHAP Waterfall Shifts */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-semibold text-slate-200 block">
              Simulated Feature Impact Shifts (SHAP Attributions):
            </span>
            <div className="space-y-2">
              {simulatedRisk.topFactors.slice(0, 4).map((factor, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">{factor.displayName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px]">{factor.value}</span>
                      <span className={`font-mono font-bold text-[11px] ${factor.delta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {factor.delta > 0 ? `+${factor.delta}` : factor.delta}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${factor.delta > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, Math.abs(factor.delta) * 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action button: View on Map */}
          <div className="flex justify-end">
            <button
              onClick={() => onSelectLocationForMap(currentLocation)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all"
            >
              <MapPin className="w-4 h-4" />
              <span>View {currentLocation.name} on Geographic Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
