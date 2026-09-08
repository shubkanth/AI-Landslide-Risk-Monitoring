import React from 'react';
import { LocationData, RiskPredictionResult } from '../types';
import { calculateLandslideRisk } from '../utils/mlInference';
import { 
  X, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  CloudRain, 
  Mountain, 
  Compass, 
  Layers, 
  TrendingUp, 
  Sliders,
  CheckCircle2,
  FileSpreadsheet,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface LocationAnalysisPanelProps {
  location: LocationData | null;
  onClose: () => void;
  onOpenSimulation: (location: LocationData) => void;
}

export const LocationAnalysisPanel: React.FC<LocationAnalysisPanelProps> = ({
  location,
  onClose,
  onOpenSimulation
}) => {
  if (!location) return null;

  const risk: RiskPredictionResult = calculateLandslideRisk(location);

  const getRiskBadge = (category: string) => {
    switch (category) {
      case 'VERY_HIGH':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'MODERATE':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  const getAlertBadge = (alert: string) => {
    switch (alert) {
      case 'CRITICAL':
        return 'bg-red-600 text-white';
      case 'WARNING':
        return 'bg-orange-600 text-white';
      case 'WATCH':
        return 'bg-amber-600 text-white';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-[600] w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-start justify-between bg-slate-950/40">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${getRiskBadge(risk.category)}`}>
              {risk.category} RISK
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getAlertBadge(risk.alertLevel)}`}>
              {risk.alertLevel} ADVISORY
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{location.name}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {location.district} District, {location.state} â€¢ Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-slate-200 text-xs">
        {/* Risk Score Highlight Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Risk Score</span>
            <div className="text-2xl font-black mt-0.5 font-mono text-white">
              {risk.score}
              <span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
            <span className="text-[10px] text-slate-400">Model Output</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Failure Prob.</span>
            <div className="text-2xl font-black mt-0.5 font-mono text-emerald-400">
              {(risk.probability * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-slate-400">P(Landslide)</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Confidence</span>
            <div className="text-2xl font-black mt-0.5 font-mono text-sky-400">
              {risk.confidence}%
            </div>
            <span className="text-[10px] text-slate-400">TreeSHAP Est.</span>
          </div>
        </div>

        {/* Explainability Section: WHY is this location at risk? */}
        <div className="bg-slate-950/60 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
            <HelpCircle className="w-4 h-4" />
            <span>Why is this location at risk? (Machine Explanation)</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            {risk.explanation}
          </p>
        </div>

        {/* Top Contributing Factors (SHAP Feature Attribution Waterfall) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Feature Contributions (SHAP Attributions)
            </span>
            <span className="text-[10px] text-slate-400">Relative Delta to Mean</span>
          </div>

          <div className="space-y-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
            {risk.topFactors.map((factor, idx) => {
              const isPositive = factor.delta > 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">{factor.displayName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px]">{factor.value}</span>
                      <span className={`font-mono font-bold text-[11px] ${isPositive ? 'text-red-400' : 'text-emerald-400'}`}>
                        {isPositive ? `+${factor.delta}` : `${factor.delta}`}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar representing SHAP impact */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full ${isPositive ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, Math.abs(factor.delta) * 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Physical & Environmental Parameters */}
        <div className="space-y-2">
          <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-400" />
            Terrain & Environmental Profile
          </span>
          <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-400">Slope Gradient:</span>
              <p className="text-white font-medium">{location.slope}Â° ({risk.terrainStatus.slopeCategory})</p>
            </div>
            <div>
              <span className="text-slate-400">Elevation:</span>
              <p className="text-white font-medium">{location.elevation} m MSL</p>
            </div>
            <div>
              <span className="text-slate-400">Aspect & Drainage:</span>
              <p className="text-white font-medium">{location.aspect} Aspect / {location.distanceToDrainage}m to stream</p>
            </div>
            <div>
              <span className="text-slate-400">Road Incision:</span>
              <p className="text-white font-medium">{location.distanceToRoads}m from mountain highway</p>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">Geological Bedrock:</span>
              <p className="text-slate-200 font-medium">{location.geology}</p>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400">Soil Overburden:</span>
              <p className="text-slate-200 font-medium">{location.soilType} (Susceptibility: {location.soilSusceptibility}/10)</p>
            </div>
          </div>
        </div>

        {/* Rainfall Telemetry */}
        <div className="space-y-2">
          <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
            <CloudRain className="w-4 h-4 text-sky-400" />
            Rainfall Observations (Hydromet Telemetry)
          </span>
          <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-center text-[11px]">
            <div>
              <span className="text-slate-400">Last 1 hr</span>
              <p className="font-mono font-bold text-white text-sm">{location.currentRainfall} mm</p>
            </div>
            <div>
              <span className="text-slate-400">Last 24 hrs</span>
              <p className="font-mono font-bold text-sky-400 text-sm">{location.rainfall24h} mm</p>
            </div>
            <div>
              <span className="text-slate-400">7-Day ARI</span>
              <p className="font-mono font-bold text-amber-400 text-sm">{location.rainfall7d} mm</p>
            </div>
          </div>
        </div>

        {/* Recommended Action / DDMA Advisory */}
        <div className="bg-amber-950/30 border border-amber-500/30 p-3.5 rounded-xl space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Recommended Mitigation & Advisory</span>
          </div>
          <p className="text-amber-200/90 text-[11px] leading-relaxed">
            {risk.recommendedAction}
          </p>
          <p className="text-[10px] text-amber-400/60 italic pt-1">
            *AI-generated advisory for research & district disaster management decision support.
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center gap-3">
        <button
          onClick={() => {
            onOpenSimulation(location);
            onClose();
          }}
          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 transition-all"
        >
          <Sliders className="w-4 h-4" />
          <span>Simulate Extreme Rain</span>
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
