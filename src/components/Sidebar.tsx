import React from 'react';
import { 
  Map, 
  Flame, 
  Sliders, 
  BarChart3, 
  BellRing, 
  BrainCircuit, 
  Bot, 
  FileText,
  Activity,
  Layers
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
    { id: 'map', label: 'Risk Map', icon: Map, badge: 'Live' },
    { id: 'hotspots', label: 'Risk Hotspots', icon: Flame, badge: null },
    { id: 'simulation', label: 'Rainfall Sandbox', icon: Sliders, badge: 'What-If' },
    { id: 'analytics', label: 'Historical Trends', icon: BarChart3, badge: null },
    { 
      id: 'alerts', 
      label: 'Early Warnings', 
      icon: BellRing, 
      badge: criticalAlertCount > 0 ? `${criticalAlertCount} High` : null,
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30'
    },
    { id: 'model', label: 'AI/ML Architecture', icon: BrainCircuit, badge: 'TreeSHAP' },
    { id: 'assistant', label: 'Landsafe AI Chat', icon: Bot, badge: 'RAG' },
    { id: 'about', label: 'Platform Overview', icon: FileText, badge: null }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="p-4 space-y-6">
        {/* Section title */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3">
            Surveillance & Analytics
          </span>
          <nav className="mt-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span 
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Real-time Status Card */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> System Status
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="text-[11px] space-y-1.5 text-slate-400">
            <div className="flex justify-between">
              <span>Coverage:</span>
              <span className="text-slate-200 font-medium">8 NER States</span>
            </div>
            <div className="flex justify-between">
              <span>Risk Engine:</span>
              <span className="text-emerald-400 font-medium">XGBoost v1.4</span>
            </div>
            <div className="flex justify-between">
              <span>Hydromet Ingest:</span>
              <span className="text-slate-200 font-medium">Auto 15m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-slate-300">
          <span>Landsafe NER v1.2</span>
          <span className="text-amber-400 font-medium">SIH 2024-25</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Zero-Cost Open-Source Stack for North East Disaster Mitigation.
        </p>
      </div>
    </aside>
  );
};
