import React from 'react';
import { 
  X, 
  ShieldAlert, 
  Award, 
  Cpu, 
  MapPin, 
  CheckCircle2, 
  CloudRain, 
  Scale, 
  GitBranch,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AboutSIHModalProps {
  onClose: () => void;
  onOpenDashboard: () => void;
}

export const AboutSIHModal: React.FC<AboutSIHModalProps> = ({
  onClose,
  onOpenDashboard
}) => {
  return (
    <div className="fixed inset-0 z-[700] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Early Warning Architecture
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Landsafe NER: AI Landslide Early Warning Platform
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-slate-300">
          {/* Executive Summary */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>The North Eastern Region (NER) Crisis</span>
            </h3>
            <p className="leading-relaxed text-slate-300">
              The 8 states of North East India (Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, and Sikkim) account for over <strong>60% of India's recurring mountain slope failures</strong>. A confluence of young tectonic deformation, seismic activity (Zone V), steep hill slopes, fractured Disang shales, and the world's highest precipitation intensities (Mawsynram/Cherrapunji) regularly sever vital lifelines like NH-10 (Sikkim) and NH-29 (Nagaland) and trigger devastating debris avalanches (e.g. Tupul Manipur 2022, Chungthang GLOF 2023).
            </p>
          </div>

          {/* Zero-Hardware Budget Principle */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>Zero-Hardware Budget Open Architecture</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              In contrast to capital-intensive physical sensor grids, Landsafe NER requires <strong>zero proprietary hardware</strong>, no expensive drone surveys, and no paid enterprise telemetry. Instead, it ingeniously synthesizes:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>NASA SRTM 30m Digital Elevation Model</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Open-Meteo & IMD Public Hydromet Telemetry</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>GSI National Landslide Susceptibility Mapping</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sentinel-2 / MODIS NDVI Canopy Dynamics</span>
              </div>
            </div>
          </div>

          {/* Technical Innovation */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>Machine Learning & Explainable AI (XAI) Innovation</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">High-Recall XGBoost</span>
                <p className="text-slate-300 mt-1">
                  Prioritizes 93.8% Recall over simple accuracy to prevent missed catastrophic slope collapses.
                </p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-sky-400 font-bold uppercase block">TreeSHAP Explainability</span>
                <p className="text-slate-300 mt-1">
                  Transparent mathematical attribution showing exact delta impact of rain, slope, and soil on risk scores.
                </p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-amber-400 font-bold uppercase block">Interactive Simulation</span>
                <p className="text-slate-300 mt-1">
                  Real-time what-if cloudburst modeling to test critical pore-water threshold escalation before storms strike.
                </p>
              </div>
            </div>
          </div>

          {/* Scientific Disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <strong className="text-slate-300">Responsible AI & Domain Disclaimer:</strong>
            <p>
              This system is an early-warning platform engineered for decision-support and academic demonstration. Predictions should be verified with field geotechnical instruments and official India Meteorological Department (IMD) / Geological Survey of India (GSI) advisories prior to emergency actions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Open-Source GovTech Prototype â€¢ MIT License
          </span>
          <button
            onClick={() => {
              onClose();
              onOpenDashboard();
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-all"
          >
            <span>Launch Live Risk Surveillance</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
