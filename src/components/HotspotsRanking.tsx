import React, { useState } from 'react';
import { LocationData, RiskPredictionResult } from '../types';
import { calculateLandslideRisk } from '../utils/mlInference';
import { 
  Flame, 
  ArrowUpDown, 
  MapPin, 
  Sliders, 
  Search, 
  Filter,
  ShieldCheck,
  AlertTriangle,
  FileDown,
  ChevronRight
} from 'lucide-react';

interface HotspotsRankingProps {
  locations: LocationData[];
  onSelectLocation: (loc: LocationData) => void;
  onOpenSimulation: (loc: LocationData) => void;
}

export const HotspotsRanking: React.FC<HotspotsRankingProps> = ({
  locations,
  onSelectLocation,
  onOpenSimulation
}) => {
  const [filterState, setFilterState] = useState<string>('All');
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  // Compute all scores
  const evaluatedHotspots = locations.map((loc) => {
    const risk = calculateLandslideRisk(loc);
    return {
      location: loc,
      score: risk.score,
      category: risk.category,
      alertLevel: risk.alertLevel,
      primaryDriver: risk.topFactors[0]?.displayName || 'Slope',
      driverValue: risk.topFactors[0]?.value || '',
      confidence: risk.confidence
    };
  });

  // Filter
  const filtered = evaluatedHotspots.filter((item) => {
    if (filterState !== 'All' && item.location.state !== filterState) return false;
    if (filterLevel !== 'All' && item.category !== filterLevel) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.location.name.toLowerCase().includes(q) ||
        item.location.district.toLowerCase().includes(q) ||
        item.location.state.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    return sortDirection === 'desc' ? b.score - a.score : a.score - b.score;
  });

  const getBadge = (cat: string) => {
    switch (cat) {
      case 'VERY_HIGH': return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'MODERATE': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#2F80ED] text-xs font-semibold uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Hazard Priority Matrix</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F2747] mt-1">
            Locations & Risk Hotspots Inventory
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Ranked vulnerability index based on real-time hydrometeorological triggers and static slope mechanics across all 8 NER states.
          </p>
        </div>

        {/* Count Badge */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[#F6F8FB] border border-slate-200 text-[#172033]">
            Total Monitored: <strong className="text-[#0F2747]">{filtered.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-2xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by sector, district, highway..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F6F8FB] border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/30 focus:border-[#2F80ED]"
            />
          </div>

          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="bg-[#F6F8FB] border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-[#172033] font-medium focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/30 cursor-pointer"
          >
            <option value="All">All States</option>
            <option value="Assam">Assam</option>
            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
            <option value="Meghalaya">Meghalaya</option>
            <option value="Manipur">Manipur</option>
            <option value="Mizoram">Mizoram</option>
            <option value="Nagaland">Nagaland</option>
            <option value="Sikkim">Sikkim</option>
            <option value="Tripura">Tripura</option>
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-[#F6F8FB] border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-[#172033] font-medium focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/30 cursor-pointer"
          >
            <option value="All">All Risk Levels</option>
            <option value="VERY_HIGH">Very High Only</option>
            <option value="HIGH">High Only</option>
            <option value="MODERATE">Moderate Only</option>
            <option value="LOW">Low Only</option>
          </select>
        </div>

        <button
          onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F6F8FB] hover:bg-slate-100 border border-slate-200 text-xs text-[#0F2747] font-medium transition-colors"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-[#2F80ED]" />
          <span>Sort: {sortDirection === 'desc' ? 'Highest Risk First' : 'Lowest Risk First'}</span>
        </button>
      </div>

      {/* Hotspots Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F8FB] text-[#64748B] font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3.5 text-center w-12">#</th>
                <th className="p-3.5">Monitored Sector</th>
                <th className="p-3.5">State & District</th>
                <th className="p-3.5 text-center">Slope</th>
                <th className="p-3.5 text-center">24h Rain</th>
                <th className="p-3.5">Primary Hazard Driver</th>
                <th className="p-3.5 text-center">Risk Score</th>
                <th className="p-3.5 text-center">Advisory</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#172033]">
              {filtered.map((item, index) => (
                <tr 
                  key={item.location.id}
                  className="hover:bg-[#F6F8FB] transition-colors group cursor-pointer"
                  onClick={() => onSelectLocation(item.location)}
                >
                  <td className="p-3.5 text-center font-mono text-[#64748B] text-xs">
                    {index + 1}
                  </td>
                  <td className="p-3.5 font-bold text-[#0F2747] group-hover:text-[#2F80ED] transition-colors">
                    {item.location.name}
                  </td>
                  <td className="p-3.5 text-[#64748B]">
                    <span className="font-medium text-[#172033]">{item.location.district}</span>, {item.location.state}
                  </td>
                  <td className="p-3.5 text-center font-mono font-medium">
                    {item.location.slope}°
                  </td>
                  <td className="p-3.5 text-center font-mono font-medium text-[#0F2747]">
                    {item.location.rainfall24h} mm
                  </td>
                  <td className="p-3.5 text-[#64748B]">
                    <span className="font-medium text-[#172033]">{item.primaryDriver}</span>
                    <span className="text-[11px] text-slate-400 block">{item.driverValue}</span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="font-mono font-bold text-sm text-[#0F2747]">
                      {item.score}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">/100</span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBadge(item.category)}`}>
                      {item.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectLocation(item.location)}
                      className="px-2.5 py-1 rounded-lg bg-[#0F2747] hover:bg-[#176B87] text-white text-xs font-medium transition-colors shadow-xs"
                    >
                      View Map
                    </button>
                    <button
                      onClick={() => onOpenSimulation(item.location)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-[#0F2747] text-xs font-medium transition-colors"
                    >
                      Simulate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
