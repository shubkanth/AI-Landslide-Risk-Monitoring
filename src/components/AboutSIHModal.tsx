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
    <div className="fixed inset-0 z-[700] bg-[#0F2747]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-[#0F2747] text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#2F80ED]">
              <ShieldAlert className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded">
                  GovTech Architecture & Disaster Framework
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Landsafe NER: Operational Early Warning Platform
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs text-[#172033]">
          {/* Executive Summary */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-[#0F2747] uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2F80ED]" />
              <span>North Eastern Region (NER) Disaster Landscape</span>
            </h3>
            <p className="leading-relaxed text-[#64748B]">
              The 8 states of North East India (Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, and Sikkim) account for over <strong>60% of India's recurring mountain slope failures</strong>. Intense monsoon deluges, seismicity, steep topography, and complex weathered Disang flysch formations regularly jeopardize strategic highway lifelines (NH-10, NH-29, NH-2) and mountainous human settlements.
            </p>
          </div>

          {/* Zero-Hardware Budget Principle */}
          <div className="bg-[#F6F8FB] border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#0F2747] font-bold text-xs uppercase tracking-wider">
              <Scale className="w-4 h-4 text-[#2F80ED]" />
              <span>Zero-Hardware Budget Open Architecture</span>
            </div>
            <p className="leading-relaxed text-[#64748B]">
              Unlike traditional proprietary telemetry requiring multimillion-rupee physical sensor arrays, Landsafe NER operates with <strong>zero dedicated hardware procurement costs</strong> by synthesizing authoritative open-access earth observation layers:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-medium text-[11px] text-[#0F2747]">
              <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>NASA SRTM 30m Digital Elevation Model</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Open-Meteo & IMD Public Hydromet Telemetry</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>GSI National Landslide Susceptibility Mapping</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Sentinel-2 & NASA GIBS Near Real-Time Feeds</span>
              </div>
            </div>
          </div>

          {/* Machine Learning Pipeline */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#0F2747] uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#176B87]" />
              <span>Machine Learning & Explainable AI (XAI)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#F6F8FB] p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-[#0F2747] font-bold uppercase block">High-Recall XGBoost</span>
                <p className="text-[#64748B] mt-1">
                  Prioritizes 93.8% Recall over raw accuracy to prevent missed catastrophic slope collapses.
                </p>
              </div>
              <div className="bg-[#F6F8FB] p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-[#2F80ED] font-bold uppercase block">TreeSHAP Attribution</span>
                <p className="text-[#64748B] mt-1">
                  Transparent mathematical attribution showing exact delta contribution of rain, slope, and soil.
                </p>
              </div>
              <div className="bg-[#F6F8FB] p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-[#176B87] font-bold uppercase block">Interactive Simulation</span>
                <p className="text-[#64748B] mt-1">
                  Real-time what-if cloudburst scenario modeling to test critical pore-water threshold escalation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-[#F6F8FB] flex items-center justify-between">
          <span className="text-xs text-[#64748B]">
            Disaster Management Authority Technical Architecture
          </span>
          <button
            onClick={() => {
              onClose();
              onOpenDashboard();
            }}
            className="bg-[#0F2747] hover:bg-[#176B87] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-xs"
          >
            <span>Launch Risk Surveillance</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
