import React, { useState } from 'react';
import { Settings, Sliders, Bell, Globe, Shield, Check, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [criticalThreshold, setCriticalThreshold] = useState<number>(75);
  const [warningThreshold, setWarningThreshold] = useState<number>(50);
  const [radarRefreshInterval, setRadarRefreshInterval] = useState<number>(10);
  const [defaultBasemap, setDefaultBasemap] = useState<string>('voyager');
  const [enableCapBroadcast, setEnableCapBroadcast] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#2F80ED] text-xs font-semibold uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>Platform Configuration</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F2747] mt-1">
            System & Early Warning Thresholds
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Customize risk trigger sensitivities, Common Alerting Protocol (CAP) integrations, and map display preferences.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="bg-[#0F2747] hover:bg-[#176B87] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4 text-[#2F80ED]" />}
          <span>{savedSuccess ? 'Settings Saved' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Settings Sections */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5 text-xs text-[#172033]">
        {/* Risk Thresholds */}
        <div className="space-y-3 pb-4 border-b border-slate-100">
          <h3 className="font-bold text-sm text-[#0F2747] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#2F80ED]" />
            Landslide Hazard Alert Thresholds
          </h3>
          <p className="text-[#64748B] text-xs">
            Determines when monitored hill sectors trigger District Disaster Management advisories.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="bg-[#F6F8FB] p-3.5 rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-red-600">Critical Alert Cutoff (Score)</span>
                <span className="font-mono font-bold text-sm text-[#0F2747]">{criticalThreshold} / 100</span>
              </div>
              <input
                type="range"
                min="60"
                max="90"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <span className="text-[11px] text-[#64748B] block">
                Sectors exceeding {criticalThreshold} score trigger immediate SMS escalation to SDRF squads.
              </span>
            </div>

            <div className="bg-[#F6F8FB] p-3.5 rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-orange-600">Warning Alert Cutoff (Score)</span>
                <span className="font-mono font-bold text-sm text-[#0F2747]">{warningThreshold} / 100</span>
              </div>
              <input
                type="range"
                min="35"
                max="65"
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(Number(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer"
              />
              <span className="text-[11px] text-[#64748B] block">
                Sectors exceeding {warningThreshold} score trigger precautionary road inspections.
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry Ingestion */}
        <div className="space-y-3 pb-4 border-b border-slate-100">
          <h3 className="font-bold text-sm text-[#0F2747] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#176B87]" />
            Hydromet Telemetry & Radar Polling
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-[#172033] mb-1">
                Radar Frame Refresh Rate
              </label>
              <select
                value={radarRefreshInterval}
                onChange={(e) => setRadarRefreshInterval(Number(e.target.value))}
                className="w-full bg-[#F6F8FB] border border-slate-200 rounded-lg p-2 text-xs text-[#172033] font-medium"
              >
                <option value={5}>Every 5 minutes (Aggressive Sync)</option>
                <option value={10}>Every 10 minutes (Recommended)</option>
                <option value={15}>Every 15 minutes (Standard IMD Rate)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#172033] mb-1">
                Default Cartographic Basemap
              </label>
              <select
                value={defaultBasemap}
                onChange={(e) => setDefaultBasemap(e.target.value)}
                className="w-full bg-[#F6F8FB] border border-slate-200 rounded-lg p-2 text-xs text-[#172033] font-medium"
              >
                <option value="voyager">Carto Voyager (Light GovTech - Recommended)</option>
                <option value="terrain">Esri World Topographic</option>
                <option value="carto-dark">Carto Dark (Night Ops)</option>
              </select>
            </div>
          </div>
        </div>

        {/* CAP / SMS Integration */}
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-[#0F2747] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#2F80ED]" />
            Common Alerting Protocol (CAP-India) Dispatch
          </h3>
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={enableCapBroadcast}
              onChange={(e) => setEnableCapBroadcast(e.target.checked)}
              className="rounded border-slate-300 text-[#2F80ED] focus:ring-0 w-4 h-4"
            />
            <span className="font-medium text-[#172033]">
              Enable automated JSON SITREP payload generation for NDMA CAP servers
            </span>
          </label>
          <p className="text-[11px] text-[#64748B]">
            Compliant with OASIS Common Alerting Protocol v1.2 standard for inter-agency emergency notifications.
          </p>
        </div>
      </div>
    </div>
  );
};
