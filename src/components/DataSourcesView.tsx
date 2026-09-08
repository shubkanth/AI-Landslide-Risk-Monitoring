import React from 'react';
import { Database, CheckCircle2, Globe, Radio, ShieldCheck, ExternalLink, HardDrive } from 'lucide-react';

export const DataSourcesView: React.FC = () => {
  const sources = [
    {
      name: 'Open-Meteo Weather API & Radar Ingest',
      provider: 'Open-Meteo / ECMWF / DWD',
      type: 'Hydrometeorology & Precipitation',
      frequency: 'Every 15 minutes',
      latency: '< 200 ms',
      cost: '₹0 (Free Open Data Tier)',
      status: 'Active',
      description: 'Provides real-time precipitation, 24h accumulation, temperature, humidity, and wind telemetry across all 8 NER states.'
    },
    {
      name: 'RainViewer Doppler Radar Tilecache',
      provider: 'RainViewer Open API',
      type: 'Radar Reflectivity (dBZ)',
      frequency: 'Every 10 minutes',
      latency: '< 150 ms',
      cost: '₹0 (Public Geospatial API)',
      status: 'Active',
      description: 'Dynamic Doppler radar coverage of storm convective cells and rain rates across eastern and north-eastern corridors.'
    },
    {
      name: 'NASA GIBS (VIIRS / MODIS Satellite)',
      provider: 'NASA Earthdata / EOSDIS',
      type: 'Satellite Cloud Reflectance',
      frequency: 'Daily & Real-Time WMTS',
      latency: '< 300 ms',
      cost: '₹0 (NASA Open Access)',
      status: 'Active',
      description: 'Corrected reflectance true-color satellite imagery revealing heavy cloud banks and atmospheric moisture buildup.'
    },
    {
      name: 'Geological Survey of India (GSI) NLSM',
      provider: 'Ministry of Mines, Govt. of India',
      type: 'Geological & Landslide Catalog',
      frequency: 'Static Macro-Zonation Grid',
      latency: 'Instant (Pre-cached)',
      cost: '₹0 (Public Domain Data)',
      status: 'Active',
      description: 'National Landslide Susceptibility Mapping (NLSM) polygons, lithological units, and historical landslide inventory.'
    },
    {
      name: 'NASA SRTM 30m Digital Elevation Model',
      provider: 'NASA / USGS',
      type: 'Topography, Slope & Aspect',
      frequency: 'Static High-Res Grid',
      latency: 'Instant (Pre-cached)',
      cost: '₹0 (Public Domain)',
      status: 'Active',
      description: 'High-resolution slope angle, curvature, and catchment drainage distance calculations for slope stability analysis.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#2F80ED] text-xs font-semibold uppercase tracking-wider">
            <Database className="w-4 h-4" />
            <span>Open Data Architecture & Feeds</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F2747] mt-1">
            Integrated Geospatial & Hydromet Data Sources
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Zero-cost, open-access intelligence stack powering real-time inference without proprietary API dependencies.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>All 5 Feeds Synced</span>
        </div>
      </div>

      {/* Sources Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8FB] text-[#64748B] font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Source & Integration</th>
                <th className="p-3.5">Data Domain</th>
                <th className="p-3.5">Refresh Frequency</th>
                <th className="p-3.5">Latency</th>
                <th className="p-3.5">Operational Cost</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {sources.map((src, idx) => (
                <tr key={idx} className="hover:bg-[#F6F8FB] transition-colors">
                  <td className="p-3.5">
                    <span className="font-bold text-[#0F2747] block">{src.name}</span>
                    <span className="text-[11px] text-[#64748B]">{src.provider}</span>
                  </td>
                  <td className="p-3.5 font-medium text-[#172033]">
                    {src.type}
                  </td>
                  <td className="p-3.5 text-[#64748B] font-mono">
                    {src.frequency}
                  </td>
                  <td className="p-3.5 font-mono text-[#0F2747]">
                    {src.latency}
                  </td>
                  <td className="p-3.5 font-semibold text-emerald-700">
                    {src.cost}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {src.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zero Budget Engineering Rationale */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-[#0F2747] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2F80ED]" />
          Zero-Budget GovTech Feasibility Rationale
        </h3>
        <p className="text-xs text-[#64748B] leading-relaxed">
          Traditional commercial disaster monitoring solutions require expensive satellite subscriptions and recurring vendor licensing fees, rendering them financially impractical for cash-constrained District Disaster Management Authorities in mountainous North Eastern states.
          Landsafe NER circumvents this barrier by coupling authoritative open government data (GSI & IMD) with global earth observation APIs (NASA GIBS & Open-Meteo), demonstrating that production-ready, life-saving early warning systems can be deployed with zero ongoing software licensing costs.
        </p>
      </div>
    </div>
  );
};
