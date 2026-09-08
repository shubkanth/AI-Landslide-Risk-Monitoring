import React from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  CloudRain, 
  AlertTriangle, 
  Bot, 
  Sliders, 
  History, 
  Database, 
  Info,
  Radio
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedState: string;
  setSelectedState: (st: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAssistant: () => void;
  onOpenSIHInfo: () => void;
  activeCriticalCount: number;
}

const NER_STATES_LIST = [
  'All States',
  'Arunachal Pradesh',
  'Assam',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Sikkim',
  'Tripura'
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedState,
  setSelectedState,
  searchQuery,
  setSearchQuery,
  onOpenAssistant,
  onOpenSIHInfo,
  activeCriticalCount
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md">
      {/* Top Prototype & Early Warning Ticker */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-500/20 px-4 py-1 flex items-center justify-between text-xs text-amber-200/90">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-semibold tracking-wide text-amber-400 uppercase">Operational Hazard Advisory:</span>
          <span className="text-amber-100/80 truncate">
            {activeCriticalCount > 0 
              ? `ALERT: ${activeCriticalCount} high-susceptibility sectors under elevated monitoring across NER hill corridors (Mangan, Noney, Haflong).`
              : 'All 8 North Eastern states under continuous hydrometeorological surveillance.'}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-400 shrink-0">
          <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
            NER Monitoring Grid
          </span>
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse" /> Live Telemetry Synced
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('map')} 
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform border border-emerald-400/30">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                Landsafe NER
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AI Early Warning
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Landslide Hazard Monitoring â€¢ North Eastern Region
            </p>
          </div>
        </div>

        {/* Global Search & State Filter */}
        <div className="flex-1 max-w-md hidden lg:flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search state, district, or highway corridor..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                âœ•
              </button>
            )}
          </div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
          >
            {NER_STATES_LIST.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'simulation'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Rainfall Simulation</span>
          </button>

          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50 transition-all"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Landsafe AI</span>
          </button>

          <button
            onClick={onOpenSIHInfo}
            title="SIH Problem Statement & Architecture"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
