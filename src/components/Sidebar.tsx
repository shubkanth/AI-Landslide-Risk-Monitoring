import React from 'react';
import { 
  LayoutDashboard,
  Map, 
  MapPin,
  Flame, 
  Sliders, 
  BarChart3, 
  BellRing, 
  BrainCircuit, 
  Bot, 
  Database,
  Settings,
  Activity,
  CalendarDays
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  criticalAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  criticalAlertCount
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'map', label: 'Risk Map', icon: Map, badge: 'Live' },
    { id: 'hotspots', label: 'Locations', icon: MapPin, badge: null },
    { 
      id: 'alerts', 
      label: 'Alerts', 
      icon: BellRing, 
      badge: criticalAlertCount > 0 ? `${criticalAlertCount}` : null,
      badgeColor: 'bg-red-600 text-white'
    },
    { id: 'historical', label: 'Historical Data', icon: CalendarDays, badge: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'assistant', label: 'AI Insights', icon: Bot, badge: 'AI' },
    { id: 'model', label: 'Model', icon: BrainCircuit, badge: 'TreeSHAP' },
    { id: 'data-sources', label: 'Data Sources', icon: Database, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null }
  ];

  return (
    <aside className="w-60 bg-[#0F2747] text-white flex flex-col justify-between shrink-0 hidden md:flex border-r border-[#173860] h-full sticky top-0 overflow-y-auto z-20 select-none">
      <div className="p-3.5 space-y-4">
        {/* Navigation Category Label */}
        <div className="px-2 pt-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Monitoring & Intelligence
          </span>
        </div>

        {/* Nav List */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#2F80ED] text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-[#173860]/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span 
                    className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${
                      item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Real-time Status Card (Calm GovTech indicator) */}
        <div className="bg-[#0A1D36] border border-[#173860] rounded-xl p-3 space-y-2 mt-4 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-200 flex items-center gap-1.5 text-xs">
              <Activity className="w-3.5 h-3.5 text-[#2F80ED]" /> System Telemetry
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <div className="space-y-1 text-slate-400 text-[10px]">
            <div className="flex justify-between">
              <span>Jurisdiction:</span>
              <span className="text-white font-medium">8 NER States</span>
            </div>
            <div className="flex justify-between">
              <span>Model Engine:</span>
              <span className="text-sky-300 font-medium">XGBoost v1.4</span>
            </div>
            <div className="flex justify-between">
              <span>Radar Feed:</span>
              <span className="text-emerald-300 font-medium">Doppler Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-[#173860] text-[10px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-slate-200">
          <span className="font-semibold text-xs">Landsafe NER</span>
          <span className="text-[#2F80ED] font-medium text-[10px]">v1.2 Prod</span>
        </div>
        <p className="text-slate-400 text-[10px]">
          Early Warning & Disaster Intelligence for North East India.
        </p>
      </div>
    </aside>
  );
};
