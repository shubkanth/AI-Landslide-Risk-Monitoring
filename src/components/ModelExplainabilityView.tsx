import React from 'react';
import { MODEL_PERFORMANCE_METRICS } from '../data/nerData';
import { 
  BrainCircuit, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Layers,
  Scale,
  Award
} from 'lucide-react';

export const ModelExplainabilityView: React.FC = () => {
  const { baseline, advanced } = MODEL_PERFORMANCE_METRICS;

  const featuresList = [
    { name: '24-hr Rainfall Intensity', symbol: 'R_24', weight: 28, desc: 'Dynamic pore-water pressure trigger exceeding shear strength.' },
    { name: 'DEM Slope Gradient', symbol: 'θ_slope', weight: 24, desc: 'Gravitational shear stress; critical threshold > 35°.' },
    { name: '7-Day Antecedent Moisture (ARI)', symbol: 'ARI_7d', weight: 16, desc: 'Groundwater saturation state and soil matrix suction loss.' },
    { name: 'Lithology & Soil Susceptibility', symbol: 'S_soil', weight: 14, desc: 'Weathered Disang flysch splintery shales vs sandstone bedrocks.' },
    { name: 'Historical Landslide Spatial Kernel', symbol: 'K_hist', weight: 10, desc: 'Empirical failure reoccurrence density across geological belts.' },
    { name: 'Vegetation Canopy (NDVI)', symbol: 'NDVI', weight: -5, desc: 'Negative weight: root cohesion & transpiration reduces erosion.' },
    { name: 'Road Cutting & Fluvial Incision', symbol: 'D_cut', weight: 3, desc: 'Anthropogenic toe excavation and river bank undercutting.' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#2F80ED] text-xs font-semibold uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4" />
            <span>Explainable AI (XAI) & Geotechnical Modeling</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F2747] mt-1">
            Machine Learning Pipeline & Model Validation
          </h1>
          <p className="text-xs text-[#64748B] mt-1 max-w-3xl">
            Comparative performance between Baseline Ensemble and High-Recall XGBoost model trained on multi-temporal hydrometeorological and topographic features for the North Eastern Region.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-lg flex items-center gap-2 text-[#0F2747] text-xs shrink-0 font-medium">
          <Award className="w-4 h-4 text-[#2F80ED]" />
          <span>Deployed: XGBoost v1.4.2</span>
        </div>
      </div>

      {/* Early-Warning Scientific Rationale Callout */}
      <div className="bg-[#0F2747] text-white rounded-xl p-5 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-sky-300 font-bold text-sm">
          <Scale className="w-4 h-4 shrink-0 text-[#2F80ED]" />
          <span>Why High Recall (93.8%) Is Scientifically Essential for Landslide Early Warning</span>
        </div>
        <p className="text-slate-300 text-xs leading-relaxed">
          In geological disaster early warning, the loss matrix is fundamentally asymmetric. A <strong>False Negative</strong> (missing an impending catastrophic slope failure) leads to human fatalities, highway cutoffs, and stranded convoys. Conversely, a <strong>False Positive</strong> merely prompts precautionary reconnaissance by local DDMA road squads. 
          By tuning our objective with <code className="bg-[#173860] text-sky-200 px-1 py-0.5 rounded font-mono">scale_pos_weight=2.8</code>, our model achieved a <strong>93.8% Recall</strong>, cutting missed landslides from 33 down to 11 across test datasets.
        </p>
      </div>

      {/* Model Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span className="text-[10px] text-[#64748B] uppercase font-semibold">Standard Baseline</span>
              <h3 className="text-sm font-bold text-[#0F2747]">{baseline.name}</h3>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              AUC: {baseline.rocAuc}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#F6F8FB] p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-[#64748B]">Recall</span>
              <p className="text-base font-mono font-bold text-[#0F2747]">{Math.round(baseline.recall * 100)}%</p>
            </div>
            <div className="bg-[#F6F8FB] p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-[#64748B]">Precision</span>
              <p className="text-base font-mono font-bold text-[#0F2747]">{Math.round(baseline.precision * 100)}%</p>
            </div>
            <div className="bg-[#F6F8FB] p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-[#64748B]">F1-Score</span>
              <p className="text-base font-mono font-bold text-[#0F2747]">{Math.round(baseline.f1Score * 100)}%</p>
            </div>
          </div>

          <p className="text-[11px] text-[#64748B]">
            Suffers from 33 false negatives (missed failures) during sudden monsoon cloudburst episodes due to uncalibrated positive class weighting.
          </p>
        </div>

        {/* Champion Model Card */}
        <div className="bg-white border-2 border-[#2F80ED] rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-blue-100 pb-2">
            <div>
              <span className="text-[10px] text-[#2F80ED] uppercase font-semibold">Production Model</span>
              <h3 className="text-sm font-bold text-[#0F2747]">{advanced.name}</h3>
            </div>
            <span className="text-xs font-mono text-[#2F80ED] bg-blue-50 px-2 py-0.5 rounded font-bold">
              AUC: {advanced.rocAuc}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100">
              <span className="text-[10px] text-[#2F80ED] font-semibold">Recall (Sensitivity)</span>
              <p className="text-base font-mono font-bold text-[#0F2747]">{Math.round(advanced.recall * 100)}%</p>
            </div>
            <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100">
              <span className="text-[10px] text-[#2F80ED] font-semibold">Precision</span>
              <p className="text-base font-mono font-bold text-[#0F2747]">{Math.round(advanced.precision * 100)}%</p>
            </div>
            <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100">
              <span className="text-[10px] text-[#2F80ED] font-semibold">F1-Score</span>
              <p className="text-base font-mono font-bold text-[#0F2747]">{Math.round(advanced.f1Score * 100)}%</p>
            </div>
          </div>

          <p className="text-[11px] text-[#0F2747] font-medium">
            Optimized for early warning: captures 93.8% of actual failures with minimal latency, driving early evacuation alerts.
          </p>
        </div>
      </div>

      {/* Feature Importance Waterfall */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-sm font-bold text-[#0F2747]">
              Global Feature Attributions (TreeSHAP Relative Weights)
            </h3>
            <p className="text-xs text-[#64748B]">
              Calculated across 1,840 historical slope movements and hydrometeorological radar tiles.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {featuresList.map((feat) => {
            const isPositive = feat.weight > 0;
            return (
              <div key={feat.symbol} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#0F2747] font-bold text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                      {feat.symbol}
                    </span>
                    <span className="font-semibold text-[#172033]">{feat.name}</span>
                  </div>
                  <span className={`font-mono font-bold text-xs ${isPositive ? 'text-[#0F2747]' : 'text-emerald-700'}`}>
                    {feat.weight > 0 ? `+${feat.weight}%` : `${feat.weight}%`}
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full ${isPositive ? 'bg-[#0F2747]' : 'bg-emerald-600'}`}
                    style={{ width: `${Math.abs(feat.weight) * 3}%` }}
                  />
                </div>

                <p className="text-[11px] text-[#64748B]">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
