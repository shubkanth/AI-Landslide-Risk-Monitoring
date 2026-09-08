import React from 'react';
import { MODEL_PERFORMANCE_METRICS } from '../data/nerData';
import { 
  BrainCircuit, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Code2, 
  Layers,
  Scale,
  Award
} from 'lucide-react';

export const ModelExplainabilityView: React.FC = () => {
  const { baseline, advanced } = MODEL_PERFORMANCE_METRICS;

  const featuresList = [
    { name: '24-hr Rainfall Intensity', symbol: 'R_24', weight: 28, desc: 'Dynamic pore-water pressure trigger exceeding shear strength.' },
    { name: 'DEM Slope Gradient', symbol: 'Î¸_slope', weight: 24, desc: 'Gravitational shear stress; critical threshold > 35Â°.' },
    { name: '7-Day Antecedent Moisture (ARI)', symbol: 'ARI_7d', weight: 16, desc: 'Groundwater saturation state and soil matrix suction loss.' },
    { name: 'Lithology & Soil Susceptibility', symbol: 'S_soil', weight: 14, desc: 'Weathered Disang flysch splintery shales vs sandstone bedrocks.' },
    { name: 'Historical Landslide Spatial Kernel', symbol: 'K_hist', weight: 10, desc: 'Empirical failure reoccurrence density across geological belts.' },
    { name: 'Vegetation Canopy (NDVI)', symbol: 'NDVI', weight: -5, desc: 'Negative weight: root cohesion & transpiration reduces erosion.' },
    { name: 'Road Cutting & Fluvial Incision', symbol: 'D_cut', weight: 3, desc: 'Anthropogenic toe excavation and river bank undercutting.' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4" />
            <span>Explainable Artificial Intelligence (XAI) & Geotechnical Modeling</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Machine Learning Pipeline & Model Validation
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Comparative performance between Baseline Ensemble and High-Recall XGBoost model trained on multi-temporal hydrometeorological and topographic features for the North Eastern Region.
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl flex items-center gap-2 text-emerald-300 text-xs shrink-0 font-medium">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Champion Model: XGBoost v1.4.2</span>
        </div>
      </div>

      {/* Critical Disaster Early-Warning Rationale Callout */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
          <Scale className="w-4 h-4 shrink-0" />
          <span>Why High Recall (93.8%) Is Scientifically Essential for Landslide Early Warning</span>
        </div>
        <p className="text-slate-300 text-xs leading-relaxed">
          In standard consumer machine learning, models are often tuned solely for raw Accuracy. However, in **geological disaster early-warning platforms**, the cost matrix is strictly asymmetric:
          A <strong>False Negative</strong> (missing an impending catastrophic slope failure) leads to human fatalities, cut-off highway lifelines, and trapped civilian transport. Conversely, a <strong>False Positive</strong> merely triggers precautionary inspection by local DDMA road squads. 
          By configuring our XGBoost objective with <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded">scale_pos_weight=2.8</code>, our model achieved a <strong>93.8% Recall</strong>, slashing missed landslide events from 33 (in Random Forest) down to only 11.
        </p>
      </div>

      {/* Baseline vs Advanced Comparison Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Baseline Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Baseline Pipeline</span>
              <h3 className="text-base font-bold text-slate-200">{baseline.name}</h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              RF-100
            </span>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400">Recall</span>
              <p className="font-mono font-bold text-slate-200 text-sm mt-0.5">{(baseline.recall * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400">Precision</span>
              <p className="font-mono font-bold text-slate-200 text-sm mt-0.5">{(baseline.precision * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400">F1 Score</span>
              <p className="font-mono font-bold text-slate-200 text-sm mt-0.5">{baseline.f1Score.toFixed(3)}</p>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400">ROC-AUC</span>
              <p className="font-mono font-bold text-slate-200 text-sm mt-0.5">{baseline.rocAuc.toFixed(3)}</p>
            </div>
          </div>

          {/* Confusion Matrix */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1">
            <span className="font-semibold text-slate-400 block mb-1">Confusion Matrix (Validation Test Set):</span>
            <div className="grid grid-cols-2 gap-2 text-center font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">True Positive</span>
                <span className="text-emerald-400 font-bold">{baseline.confusionMatrix.truePositive}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">False Positive</span>
                <span className="text-amber-400 font-bold">{baseline.confusionMatrix.falsePositive}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">False Negative (Missed)</span>
                <span className="text-red-400 font-bold">{baseline.confusionMatrix.falseNegative} (High risk!)</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">True Negative</span>
                <span className="text-slate-300 font-bold">{baseline.confusionMatrix.trueNegative}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced XGBoost Card */}
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 space-y-4 shadow-xl shadow-emerald-950/20">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Champion Pipeline</span>
              <h3 className="text-base font-bold text-white">{advanced.name}</h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Selected
            </span>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-slate-950 p-2 rounded-xl border border-emerald-500/30">
              <span className="text-[10px] text-slate-400">Recall</span>
              <p className="font-mono font-bold text-emerald-400 text-sm mt-0.5">{(advanced.recall * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400">Precision</span>
              <p className="font-mono font-bold text-white text-sm mt-0.5">{(advanced.precision * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400">F1 Score</span>
              <p className="font-mono font-bold text-white text-sm mt-0.5">{advanced.f1Score.toFixed(3)}</p>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400">ROC-AUC</span>
              <p className="font-mono font-bold text-sky-400 text-sm mt-0.5">{advanced.rocAuc.toFixed(3)}</p>
            </div>
          </div>

          {/* Confusion Matrix */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1">
            <span className="font-semibold text-slate-400 block mb-1">Confusion Matrix (Validation Test Set):</span>
            <div className="grid grid-cols-2 gap-2 text-center font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">True Positive</span>
                <span className="text-emerald-400 font-bold">{advanced.confusionMatrix.truePositive} (+22 caught)</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">False Positive</span>
                <span className="text-amber-400 font-bold">{advanced.confusionMatrix.falsePositive}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">False Negative (Missed)</span>
                <span className="text-emerald-400 font-bold">{advanced.confusionMatrix.falseNegative} (Only 11 missed)</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">True Negative</span>
                <span className="text-slate-300 font-bold">{advanced.confusionMatrix.trueNegative}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Feature Importance (TreeSHAP) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Global Feature Importance Ranking (TreeSHAP Mean |Î”|)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Relative predictive weight of hydrometeorological triggers and static geological susceptibility layers.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {featuresList.map((feat) => {
            const isNegative = feat.weight < 0;
            return (
              <div key={feat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{feat.name}</span>
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                      {feat.symbol}
                    </span>
                  </div>
                  <span className={`font-mono font-bold ${isNegative ? 'text-emerald-400' : 'text-sky-400'}`}>
                    {Math.abs(feat.weight)}% relative weight
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full ${isNegative ? 'bg-emerald-500' : 'bg-sky-500'}`}
                    style={{ width: `${Math.abs(feat.weight) * 3.2}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">
                  {feat.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
