import React, { useState } from 'react';
import { LocationData, AlertItem } from '../types';
import { calculateLandslideRisk } from '../utils/mlInference';
import { 
  BellRing, 
  ShieldAlert, 
  Send, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  FileText,
  Clock,
  MapPin,
  Flame,
  CloudRain
} from 'lucide-react';

interface AdminAlertsViewProps {
  locations: LocationData[];
  onSelectLocation: (loc: LocationData) => void;
}

export const AdminAlertsView: React.FC<AdminAlertsViewProps> = ({
  locations,
  onSelectLocation
}) => {
  const [filterAlertLevel, setFilterAlertLevel] = useState<string>('All');
  const [broadcastSent, setBroadcastSent] = useState<string | null>(null);

  // Derive active alerts
  const allAlerts: AlertItem[] = locations.map((loc) => {
    const risk = calculateLandslideRisk(loc);
    return {
      id: `alt-${loc.id}`,
      locationId: loc.id,
      locationName: loc.name,
      district: loc.district,
      state: loc.state,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      alertLevel: risk.alertLevel,
      riskScore: risk.score,
      triggerReason: `${risk.topFactors[0]?.displayName} (${risk.topFactors[0]?.value}) on ${loc.slope}Â° slope`,
      recommendedAction: risk.recommendedAction,
      rainfall24h: loc.rainfall24h,
      slope: loc.slope
    };
  }).filter((a) => a.alertLevel !== 'NORMAL').sort((a, b) => b.riskScore - a.riskScore);

  const filteredAlerts = allAlerts.filter((a) => {
    if (filterAlertLevel === 'All') return true;
    return a.alertLevel === filterAlertLevel;
  });

  const criticalCount = allAlerts.filter((a) => a.alertLevel === 'CRITICAL').length;
  const warningCount = allAlerts.filter((a) => a.alertLevel === 'WARNING').length;
  const watchCount = allAlerts.filter((a) => a.alertLevel === 'WATCH').length;

  const handleSimulateBroadcast = (alert: AlertItem) => {
    setBroadcastSent(alert.id);
    setTimeout(() => {
      setBroadcastSent(null);
    }, 4000);
  };

  const handleExportSITREP = () => {
    const sitrep = {
      title: 'NORTH EASTERN REGION LANDSLIDE RISK SITUATION REPORT (SITREP)',
      generatedAt: new Date().toISOString(),
      source: 'Landsafe NER AI Platform',
      summary: {
        totalMonitored: locations.length,
        criticalCount,
        warningCount,
        watchCount
      },
      activeCriticalSectors: allAlerts.filter((a) => a.alertLevel === 'CRITICAL')
    };

    const blob = new Blob([JSON.stringify(sitrep, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SITREP_LandsafeNER_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-400 text-xs font-semibold uppercase tracking-wider">
            <Radio className="w-4 h-4 animate-pulse text-red-500" />
            <span>Disaster Management Authority (DDMA / SDMA) Operational Feed</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Early Warning Dispatch & Incident Escalation Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time threshold triggers evaluated against Caine rainfall-intensity curves and topographic susceptibility indices.
          </p>
        </div>

        <button
          onClick={handleExportSITREP}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export SITREP (JSON)</span>
        </button>
      </div>

      {/* KPI Alert Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-red-950/20">
          <div>
            <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider block">
              Critical Alerts
            </span>
            <span className="text-2xl font-black text-white font-mono">{criticalCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Immediate DDMA Action</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-orange-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider block">
              Warning Alerts
            </span>
            <span className="text-2xl font-black text-white font-mono">{warningCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">High Vigilance & Patrol</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
              Watch Alerts
            </span>
            <span className="text-2xl font-black text-white font-mono">{watchCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Drainage & Pre-monsoon</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
              Total Monitored
            </span>
            <span className="text-2xl font-black text-white font-mono">{locations.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Across 8 NER States</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['All', 'CRITICAL', 'WARNING', 'WATCH'].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilterAlertLevel(lvl)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterAlertLevel === lvl
                ? 'bg-slate-200 text-slate-900 shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {lvl === 'All' ? 'All Active Hazards' : `${lvl} Only`}
          </button>
        ))}
      </div>

      {/* Broadcast Flash Message */}
      {broadcastSent && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 p-3.5 rounded-xl text-xs text-emerald-300 flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            CAP Advisory Dispatched! Simulated broadcast sent via SMS Gateway & Disaster Management Control Room radio for alert ID: {broadcastSent}.
          </span>
        </div>
      )}

      {/* Alerts Cards List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const loc = locations.find((l) => l.id === alert.locationId);
          const isCritical = alert.alertLevel === 'CRITICAL';
          const isWarning = alert.alertLevel === 'WARNING';

          return (
            <div
              key={alert.id}
              className={`bg-slate-900 border rounded-2xl p-4 sm:p-5 space-y-3 transition-all ${
                isCritical
                  ? 'border-red-500/40 bg-gradient-to-r from-red-950/20 via-slate-900 to-slate-900'
                  : isWarning
                  ? 'border-orange-500/30'
                  : 'border-slate-800'
              }`}
            >
              {/* Alert Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      isCritical
                        ? 'bg-red-600 text-white animate-pulse'
                        : isWarning
                        ? 'bg-orange-500 text-slate-950'
                        : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {alert.alertLevel} ADVISORY
                  </span>
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    {alert.locationName}
                  </h3>
                  <span className="text-xs text-slate-400">
                    ({alert.district}, {alert.state})
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{alert.timestamp} IST</span>
                  <span className="text-slate-600">â€¢</span>
                  <span className="font-bold text-white">Risk: {alert.riskScore}/100</span>
                </div>
              </div>

              {/* Grid with Trigger Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Trigger Cause:</span>
                  <p className="text-slate-200 font-medium">{alert.triggerReason}</p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Hydromet & Slope:</span>
                  <p className="text-slate-200 font-medium">
                    24h Rain: <strong className="text-sky-400">{alert.rainfall24h} mm</strong> | Slope: <strong className="text-white">{alert.slope}Â°</strong>
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Geotechnical Protocol:</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                    {alert.recommendedAction}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between pt-1 gap-2">
                <div className="text-[10px] text-amber-400/80 italic">
                  *Advisory generated by Landsafe NER statistical hazard classifier for decision support.
                </div>
                <div className="flex items-center gap-2">
                  {loc && (
                    <button
                      onClick={() => onSelectLocation(loc)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Inspect On Map</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleSimulateBroadcast(alert)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Alert (CAP Protocol)</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
