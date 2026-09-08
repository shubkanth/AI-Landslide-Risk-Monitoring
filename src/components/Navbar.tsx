import React from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Bell, 
  Bot, 
  Sliders, 
  Info,
  Search,
  CheckCircle2,
  User,
  ExternalLink
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
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs shrink-0">
      {/* Top Advisory Ticker (Subtle GovTech bar, calm colors) */}
      <div className="bg-[#0F2747] text-white px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <span className="flex h-2 w-2 relative">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="font-semibold text-sky-200 uppercase tracking-wider text-[10px]">
            Operational Hazard Advisory:
          </span>
          <span className="text-slate-200 text-xs truncate">
            {activeCriticalCount > 0 
              ? `ALERT: ${activeCriticalCount} high-susceptibility sectors under elevated monitoring across NER hill corridors.`
              : 'All 8 North Eastern states under continuous hydrometeorological surveillance.'}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-300 shrink-0">
          <span className="flex items-center gap-1 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Data Status: <strong className="text-white font-normal ml-0.5">Updated 15 min ago</strong>
          </span>
          <span className="text-slate-500">|</span>
          <button 
            onClick={onOpenSIHInfo}
            className="hover:text-white transition-colors text-[11px] text-sky-300 flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Open Data Stack</span>
          </button>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0F2747] flex items-center justify-center shadow-sm text-white group-hover:bg-[#176B87] transition-colors">
            <ShieldAlert className="w-5 h-5 text-[#2F80ED]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-[#0F2747] tracking-tight group-hover:text-[#2F80ED] transition-colors">
                Landsafe NER
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-[#2F80ED] border border-blue-100">
                GovTech
              </span>
            </div>
            <p className="text-xs text-[#64748B] font-medium hidden sm:block">
              AI-Powered Landslide Risk Monitoring
            </p>
          </div>
        </div>

        {/* Global Search & State Filter */}
        <div className="flex-1 max-w-md hidden md:flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search state, district, or corridor..."
              className="w-full bg-[#F6F8FB] border border-slate-200 rounded-lg pl-8.5 pr-3 py-1.5 text-xs text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/30 focus:border-[#2F80ED] transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-[#F6F8FB] border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-[#172033] font-medium focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/30 focus:border-[#2F80ED] cursor-pointer"
          >
            {NER_STATES_LIST.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Right Section: Status, Notifications, Quick Actions */}
        <div className="flex items-center gap-3">
          {/* System Status (calm, not rapid blinking) */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#172033]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-[11px] text-[#0F2747]">Monitoring Active</span>
          </div>

          {/* Alerts Bell */}
          <button
            onClick={() => setActiveTab('alerts')}
            className="relative p-2 rounded-lg text-slate-500 hover:text-[#0F2747] hover:bg-slate-100 transition-colors"
            title="Active Alerts"
          >
            <Bell className="w-4 h-4" />
            {activeCriticalCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                {activeCriticalCount}
              </span>
            )}
          </button>

          {/* Landsafe AI Quick Trigger */}
          <button
            onClick={onOpenAssistant}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0F2747] hover:bg-[#176B87] text-white shadow-xs transition-colors"
          >
            <Bot className="w-3.5 h-3.5 text-[#2F80ED]" />
            <span>AI Insights</span>
          </button>

          {/* User Profile / GovTech Agency Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-[#176B87]/10 border border-[#176B87]/20 flex items-center justify-center text-[#176B87] font-semibold text-xs">
              NER
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-[11px] font-semibold text-[#0F2747] leading-none">DDMA Portal</p>
              <p className="text-[9px] text-[#64748B] mt-0.5">Disaster Management</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
