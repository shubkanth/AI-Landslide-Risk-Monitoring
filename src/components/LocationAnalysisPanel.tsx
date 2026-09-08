import React, { useEffect, useState } from 'react';
import { LocationData, RiskPredictionResult } from '../types';
import { calculateLandslideRisk } from '../utils/mlInference';
import { fetchLiveWeatherMeter, LiveWeatherMeter } from '../services/weatherService';
import { 
  X, 
  MapPin, 
  AlertTriangle, 
  CloudRain, 
  Cloud,
  Gauge,
  Layers, 
  TrendingUp, 
  Sliders,
  HelpCircle
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
  const [liveMeter, setLiveMeter] = useState<LiveWeatherMeter | null>(null);

  useEffect(() => {
    if (!location) return;
    let isMounted = true;
    fetchLiveWeatherMeter(location.lat, location.lng, location.name).then((meter) => {
      if (isMounted) setLiveMeter(meter);
    }).catch(console.warn);

    return () => {
      isMounted = false;
    };
  }, [location]);

  if (!location) return null;

  const risk: RiskPredictionResult = calculateLandslideRisk(location);

  const getRiskBadge = (category: string) => {
    switch (category) {
      case 'VERY_HIGH':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MODERATE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
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
        return 'bg-slate-700 text-white';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-[600] w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-start justify-between bg-[#F6F8FB]">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${getRiskBadge(risk.category)}`}>
              {risk.category.replace('_', ' ')} RISK
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getAlertBadge(risk.alertLevel)}`}>
              {risk.alertLevel} ADVISORY
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#0F2747] mt-1.5 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#2F80ED] shrink-0" />
            <span>{location.name}</span>
          </h2>
          <p className="text-xs text-[#64748B]">
            {location.district} District, {location.state} • Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-[#0F2747] hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-[#172033] text-xs">
        {/* Risk Score Highlight Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-[#F6F8FB] border border-slate-200 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-semibold text-[#64748B]">Risk Score</span>
            <div className="text-2xl font-black mt-0.5 font-mono text-[#0F2747]">
              {risk.score}
              <span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
            <span className="text-[10px] text-[#64748B]">Model Output</span>
          </div>

          <div className="bg-[#F6F8FB] border border-slate-200 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-semibold text-[#64748B]">Failure Prob.</span>
            <div className="text-2xl font-black mt-0.5 font-mono text-[#176B87]">
              {(risk.probability * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-[#64748B]">P(Landslide)</span>
          </div>

          <div className="bg-[#F6F8FB] border border-slate-200 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-semibold text-[#64748B]">Confidence</span>
            <div className="text-2xl font-black mt-0.5 font-mono text-[#2F80ED]">
              {risk.confidence}%
            </div>
            <span className="text-[10px] text-[#64748B]">TreeSHAP Est.</span>
          </div>
        </div>

        {/* Explainability Section */}
        <div className="bg-[#F6F8FB] border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-[#0F2747] font-semibold text-xs">
            <HelpCircle className="w-4 h-4 text-[#2F80ED]" />
            <span>AI Risk Explanation (Machine Synthesis)</span>
          </div>
          <p className="text-[#172033] leading-relaxed text-xs bg-white p-3 rounded-lg border border-slate-200 italic">
            "{risk.explanation}"
          </p>
        </div>

        {/* Top Contributing Factors (SHAP Attributions) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#0F2747] text-xs flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#2F80ED]" />
              Feature Contributions (SHAP Attributions)
            </span>
            <span className="text-[10px] text-[#64748B]">Delta to Regional Baseline</span>
          </div>

          <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            {risk.topFactors.map((factor, idx) => {
              const isPositive = factor.delta > 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#172033] font-medium">{factor.displayName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#64748B] text-[11px]">{factor.value}</span>
                      <span className={`font-mono font-bold text-xs ${isPositive ? 'text-red-600' : 'text-emerald-600'}`}>
                        {isPositive ? `+${factor.delta}` : `${factor.delta}`}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full ${isPositive ? 'bg-red-600' : 'bg-emerald-600'}`}
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
          <span className="font-semibold text-[#0F2747] text-xs flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#176B87]" />
            Terrain & Environmental Profile
          </span>
          <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-xs">
            <div>
              <span className="text-[#64748B] block text-[10px]">Slope Gradient:</span>
              <p className="text-[#172033] font-semibold">{location.slope}° ({risk.terrainStatus.slopeCategory})</p>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px]">Elevation:</span>
              <p className="text-[#172033] font-semibold">{location.elevation} m MSL</p>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px]">Aspect & Drainage:</span>
              <p className="text-[#172033] font-semibold">{location.aspect} / {location.distanceToDrainage}m to stream</p>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px]">Road Incision:</span>
              <p className="text-[#172033] font-semibold">{location.distanceToRoads}m from highway</p>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-100">
              <span className="text-[#64748B] block text-[10px]">Geological Bedrock:</span>
              <p className="text-[#172033] font-medium">{location.geology}</p>
            </div>
            <div className="col-span-2">
              <span className="text-[#64748B] block text-[10px]">Soil Overburden:</span>
              <p className="text-[#172033] font-medium">{location.soilType} (Susceptibility: {location.soilSusceptibility}/10)</p>
            </div>
          </div>
        </div>

        {/* Rainfall Telemetry */}
        <div className="space-y-2">
          <span className="font-semibold text-[#0F2747] text-xs flex items-center gap-1.5">
            <CloudRain className="w-4 h-4 text-[#2F80ED]" />
            Rainfall Observations (Hydromet Telemetry)
          </span>
          <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-center text-xs">
            <div>
              <span className="text-[#64748B] text-[10px]">Last 1 hr</span>
              <p className="font-mono font-bold text-[#0F2747] text-sm">{location.currentRainfall} mm</p>
            </div>
            <div>
              <span className="text-[#64748B] text-[10px]">Last 24 hrs</span>
              <p className="font-mono font-bold text-[#2F80ED] text-sm">{location.rainfall24h} mm</p>
            </div>
            <div>
              <span className="text-[#64748B] text-[10px]">7-Day ARI</span>
              <p className="font-mono font-bold text-amber-600 text-sm">{location.rainfall7d} mm</p>
            </div>
          </div>
        </div>

        {/* Live Weather & Cloud Meter */}
        {liveMeter && (
          <div className="bg-[#F6F8FB] border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#0F2747] font-semibold text-xs">
                <Gauge className="w-3.5 h-3.5 text-[#2F80ED]" />
                <span>Live Doppler & Cloud Meter</span>
              </div>
              <span className="text-[10px] text-[#64748B] font-mono">
                {liveMeter.timestampIST}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B] flex items-center gap-1">
                    <CloudRain className="w-3 h-3 text-[#2F80ED]" />
                    Rain Rate
                  </span>
                  <span className="font-mono font-bold text-[#0F2747]">
                    {liveMeter.precipitation.toFixed(1)} mm/h
                  </span>
                </div>
                <div className="text-[10px] text-[#64748B] flex justify-between">
                  <span>Reflectivity:</span>
                  <span className="font-mono font-semibold text-[#172033]">{liveMeter.dbzEquivalent} dBZ</span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B] flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-slate-500" />
                    Cloud Cover
                  </span>
                  <span className="font-mono font-bold text-[#0F2747]">
                    {liveMeter.cloudCover}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#176B87]"
                    style={{ width: `${liveMeter.cloudCover}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Action */}
        <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl space-y-1.5">
          <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Recommended Mitigation & Advisory</span>
          </div>
          <p className="text-amber-900 text-xs leading-relaxed">
            {risk.recommendedAction}
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200 bg-[#F6F8FB] flex items-center gap-3">
        <button
          onClick={() => {
            onOpenSimulation(location);
            onClose();
          }}
          className="flex-1 bg-[#0F2747] hover:bg-[#176B87] text-white font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <Sliders className="w-3.5 h-3.5 text-[#2F80ED]" />
          <span>Simulate Extreme Rain</span>
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-[#0F2747] bg-white hover:bg-slate-100 border border-slate-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
