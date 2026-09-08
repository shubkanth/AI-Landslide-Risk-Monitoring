import React, { useState } from 'react';
import { LocationData, AlertItem } from '../types';
import { calculateLandslideRisk } from '../utils/mlInference';
import { 
  BellRing, 
  ShieldAlert, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Clock, 
  MapPin, 
  ExternalLink 
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
      triggerReason: `${risk.topFactors[0]?.displayName} (${risk.topFactors[0]?.value}) on ${loc.slope}° slope`,
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
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-600 text-xs font-semibold uppercase tracking-wider">
            <BellRing className="w-4 h-4" />
            <span>Disaster Management Authority (DDMA / SDMA) Feed</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F2747] mt-1">
            Early Warning Advisories & Incident Queue
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Real-time threshold triggers evaluated against Caine rainfall-intensity curves and topographic susceptibility indices.
          </p>
        </div>

        <button
          onClick={handleExportSITREP}
          className="bg-[#0F2747] hover:bg-[#176B87] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors self-start md:self-auto shadow-xs"
        >
          <Download className="w-4 h-4 text-[#2F80ED]" />
          <span>Export SITREP (JSON)</span>
        </button>
      </div>

      {/* KPI Alert Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-red-600 uppercase tracking-wider block">
              Critical Alerts
            </span>
            <span className="text-2xl font-bold text-red-600 font-mono mt-0.5 block">{criticalCount}</span>
            <span className="text-[11px] text-[#64748B]">Immediate Action Required</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
            !
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-orange-600 uppercase tracking-wider block">
              Warning Alerts
            </span>
            <span className="text-2xl font-bold text-orange-600 font-mono mt-0.5 block">{warningCount}</span>
            <span className="text-[11px] text-[#64748B]">High Vigilance Patrols</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            ▲
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider block">
              Watch Alerts
            </span>
            <span className="text-2xl font-bold text-amber-600 font-mono mt-0.5 block">{watchCount}</span>
            <span className="text-[11px] text-[#64748B]">Culvert & Drainage Checks</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            ⏱
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-[#0F2747] uppercase tracking-wider block">
              Total Monitored
            </span>
            <span className="text-2xl font-bold text-[#0F2747] font-mono mt-0.5 block">{locations.length}</span>
            <span className="text-[11px] text-[#64748B]">Across 8 NER States</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2F80ED] flex items-center justify-center font-bold">
            ✓
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {['All', 'CRITICAL', 'WARNING', 'WATCH'].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilterAlertLevel(lvl)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterAlertLevel === lvl
                ? 'bg-[#0F2747] text-white shadow-xs'
                : 'bg-white text-[#64748B] hover:text-[#0F2747] border border-slate-200'
            }`}
          >
            {lvl === 'All' ? 'All Active Hazards' : `${lvl} Only`}
          </button>
        ))}
      </div>

      {/* Alerts List (Clean GovTech Cards) */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.alertLevel === 'CRITICAL';
          const isWarning = alert.alertLevel === 'WARNING';
          const targetLoc = locations.find((l) => l.id === alert.locationId);

          return (
            <div 
              key={alert.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-[#2F80ED] transition-colors space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isCritical 
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : isWarning
                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {alert.alertLevel} ADVISORY
                  </span>
                  <h3 className="font-bold text-sm text-[#0F2747]">
                    {alert.locationName}
                  </h3>
                  <span className="text-xs text-[#64748B]">
                    {alert.district}, {alert.state}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-slate-400 text-[11px]">{alert.timestamp} IST</span>
                  <span className="font-mono font-bold text-sm text-[#0F2747]">
                    Risk: {alert.riskScore}/100
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#172033]">
                <div>
                  <span className="text-[#64748B] block text-[11px]">Hazard Trigger Condition:</span>
                  <p className="font-medium text-[#0F2747] mt-0.5">{alert.triggerReason}</p>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">Rainfall (24h) & Slope:</span>
                  <p className="font-medium text-[#0F2747] mt-0.5">{alert.rainfall24h} mm • {alert.slope}° Incline</p>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[11px]">DDMA Standard Operating Procedure:</span>
                  <p className="font-medium text-[#172033] mt-0.5">{alert.recommendedAction}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSimulateBroadcast(alert)}
                    disabled={broadcastSent === alert.id}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0F2747] font-semibold text-xs transition-colors flex items-center gap-1.5 border border-slate-200"
                  >
                    {broadcastSent === alert.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Dispatched to District Police & SDRF</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-[#2F80ED]" />
                        <span>Dispatch DDMA SMS/CAP Alert</span>
                      </>
                    )}
                  </button>
                </div>

                {targetLoc && (
                  <button
                    onClick={() => onSelectLocation(targetLoc)}
                    className="text-xs text-[#2F80ED] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>View Location on Map</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
