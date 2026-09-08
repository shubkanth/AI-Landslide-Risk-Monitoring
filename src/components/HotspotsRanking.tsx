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
  FileDown
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
      case 'VERY_HIGH': return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'HIGH': return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'MODERATE': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default: return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            <span>Hazard Priority Matrix</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            North Eastern Region Risk Hotspots
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ranked vulnerability index based on real-time hydrometeorological triggers and static slope mechanics across all 8 NER states.
          </p>
        </div>

        {/* Export / Count Badge */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            Total Monitored: <strong className="text-white">{filtered.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by sector, district, highway..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
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
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-medium transition-colors"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Sort: {sortDirection === 'desc' ? 'Highest First' : 'Lowest First'}</span>
        </button>
      </div>

      {/* Hotspots Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3.5 text-center w-12">#</th>
                <th className="p-3.5">Monitored Sector</th>
                <th className="p-3.5">State & District</th>
                <th className="p-3.5 text-center">Risk Score</th>
                <th className="p-3.5">Risk Level</th>
                <th className="p-3.5">Main Contributing Driver</th>
                <th className="p-3.5">24h Rain / Slope</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((item, idx) => (
                <tr 
                  key={item.location.id} 
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="p-3.5 text-center font-mono font-bold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                      {item.location.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.location.geology.split(' ')[0]} bedrock â€¢ {item.location.elevation}m
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-slate-300 font-medium">{item.location.district}</div>
                    <div className="text-[10px] text-slate-400">{item.location.state}</div>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="font-mono text-base font-black text-white">
                      {item.score}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-sans">
                      Conf: {item.confidence}%
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${getBadge(item.category)}`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="text-slate-300 font-medium">{item.primaryDriver}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.driverValue}</div>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-300">
                    <div>{item.location.rainfall24h} mm</div>
                    <div className="text-slate-400 text-[10px]">{item.location.slope}Â° Slope</div>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectLocation(item.location)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-medium transition-all"
                      >
                        Analyze
                      </button>
                      <button
                        onClick={() => onOpenSimulation(item.location)}
                        title="Simulate Rainfall on this slope"
                        className="p-1 rounded-lg bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-slate-950 border border-slate-700 transition-all"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
