import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Zap, 
  Gauge, 
  DollarSign, 
  Flame, 
  Sliders, 
  RefreshCw, 
  TrendingDown, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles, 
  BarChart, 
  ChevronRight,
  Info,
  CheckCircle2,
  FileText,
  Save,
  Trash2,
  Upload,
  Database
} from 'lucide-react';
import { PlantConfig, LossEvent, MonteCarloOpportunityResult } from '../types/riskModel';
import confetti from 'canvas-confetti';
import { D3RiskLandscape } from './D3RiskLandscape';
import { formatCurrencyIDR, formatNumberID, formatHoursID } from '../lib/formatters';

interface ExecutiveDashboardProps {
  plant: PlantConfig;
  onUpdatePlant: (updated: PlantConfig) => void;
  historicalEvents: LossEvent[];
  monteCarlo: MonteCarloOpportunityResult;
  onRunSimulation: () => void;
  aiSummary: string;
  isGeneratingAI: boolean;
  onGenerateAISummary: () => void;
  onSaveAssessment: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
  onOpenClearModal?: () => void;
  onOpenUploadData?: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  plant,
  onUpdatePlant,
  historicalEvents,
  monteCarlo,
  onRunSimulation,
  aiSummary,
  isGeneratingAI,
  onGenerateAISummary,
  onSaveAssessment,
  isSaving,
  saveSuccess,
  onOpenClearModal,
  onOpenUploadData,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editConfig, setEditConfig] = useState<PlantConfig>({ ...plant });

  const totalHistoricalLoss = historicalEvents.reduce((sum, e) => sum + e.financialLossUSD, 0);
  const totalOutageHours = historicalEvents.reduce((sum, e) => sum + e.forcedOutageHours, 0);

  const handleSaveConfig = () => {
    onUpdatePlant(editConfig);
    setShowConfigModal(false);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Plant Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider">
                Active Assessment
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {plant.location}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {plant.name}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Quantitative Operational Risk Profile • {plant.boilerType} ({formatNumberID(plant.capacityMW)} MW) fueled by {plant.coalType} • Base Heat Rate: {formatNumberID(plant.baseHeatRateBtuKWh)} Btu/kWh
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenClearModal && (
              <button
                onClick={onOpenClearModal}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-700/50 text-xs font-semibold transition-all shadow-sm"
                title="Purge existing failure and business records to upload fresh data"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Clear All Data</span>
              </button>
            )}

            {onOpenUploadData && (
              <button
                onClick={onOpenUploadData}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all shadow-sm"
                title="Upload new monthly Excel or CSV dataset"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Upload Data (.xlsx/.csv)</span>
              </button>
            )}

            <button
              onClick={() => {
                setEditConfig({ ...plant });
                setShowConfigModal(true);
              }}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all shadow-sm"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Calibrate Plant Parameters</span>
            </button>

            <button
              onClick={onRunSimulation}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-900/40"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Rerun Monte Carlo (2,500 Iterations)</span>
            </button>

            <button
              onClick={onSaveAssessment}
              disabled={isSaving}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Persisting...' : 'Save to Firestore'}</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Risk assessment snapshot successfully persisted to user's Firestore collection.
            </span>
          </div>
        )}

        {/* BigQuery Analytical VaR & Storage Vault Strip */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono text-[11px] font-semibold">
              <Database className="w-3.5 h-3.5" />
              BigQuery Engine: PERCENTILE_CONT Analytical VaR
            </span>
            <span className="text-slate-400 text-[11px]">
              Table: <code className="text-slate-300">coal_guard_analytics.failure_events</code>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>Vault: gs://coal-guard-analytics-vault</span>
            <span>•</span>
            <span>State: Firestore users/{'{uid}'}</span>
          </div>
        </div>
      </div>

      {/* 3 Pillars of Risk & Opportunity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Pillar 1: Quantitative Operational Risk (Downside / Expected Loss) */}
        <div className="bg-slate-900/90 border border-red-500/20 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
              1. Downside Risk (EFOR)
            </span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white">
              {formatCurrencyIDR(monteCarlo.expectedAnnualLossUSD, { compact: true })}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>Expected Annual Forced Outage Loss (BigQuery P50 VaR)</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">P10 (Optimistic):</span>
              <span className="font-semibold text-emerald-400">{formatCurrencyIDR(monteCarlo.percentileP10USD, { compact: true })}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">P90 (Severe Tail Risk):</span>
              <span className="font-semibold text-red-400">{formatCurrencyIDR(monteCarlo.percentileP90USD, { compact: true })}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Annual Outage Exposure:</span>
              <span className="font-semibold text-amber-300">{formatHoursID(monteCarlo.annualExpectedForcedOutageHours)} / thn</span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Opportunity & Optimization Value Capture */}
        <div className="bg-slate-900/90 border border-emerald-500/20 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              2. Opportunity Capture
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-300">
              {formatCurrencyIDR(monteCarlo.totalAnnualNetOpportunityUSD, { compact: true })}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Annual Economic Upside via ML & Blending
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Preventative ML Avoidance:</span>
              <span className="font-semibold text-emerald-400">+{formatCurrencyIDR(monteCarlo.mlPredictiveSavingsOpportunityUSD, { compact: true })}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Heat Rate (75 Btu/kWh dip):</span>
              <span className="font-semibold text-emerald-400">+{formatCurrencyIDR(monteCarlo.heatRateOptimizationOpportunityUSD, { compact: true })}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Coal Blending Fuel Spread:</span>
              <span className="font-semibold text-emerald-400">+{formatCurrencyIDR(monteCarlo.coalBlendingArbitrageOpportunityUSD, { compact: true })}</span>
            </div>
          </div>
        </div>

        {/* Pillar 3: Uncertainty & Volatility Band */}
        <div className="bg-slate-900/90 border border-amber-500/20 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              3. Operational Uncertainty
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <BarChart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-amber-300">
              {formatCurrencyIDR(monteCarlo.percentileP90USD - monteCarlo.percentileP10USD, { compact: true })}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              P90 - P10 Interquartile Volatility Spread
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Historical Recorded Events:</span>
              <span className="font-semibold text-slate-200">{formatNumberID(historicalEvents.length)} insiden</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Historical Loss Total:</span>
              <span className="font-semibold text-red-300">{formatCurrencyIDR(totalHistoricalLoss, { compact: true })}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Total Downtime Logged:</span>
              <span className="font-semibold text-slate-200">{formatHoursID(totalOutageHours)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Monte Carlo Probability Distribution Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart className="w-5 h-5 text-amber-400" />
              Monte Carlo Loss Distribution & Value-at-Risk (VaR)
            </h2>
            <p className="text-xs text-slate-400">
              Simulated 2,500 annual operating cycles based on historical frequency (Poisson) and loss severity (Lognormal/Box-Muller).
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-emerald-500/80"></span> P10 Limit
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-amber-500/80"></span> P50 Median
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded bg-red-500/80"></span> P90 Tail
            </span>
          </div>
        </div>

        {/* Histogram visualization */}
        <div className="space-y-3">
          <div className="grid grid-cols-8 gap-2 items-end h-48 pt-4 pb-2 border-b border-slate-800">
            {monteCarlo.distributionBuckets.map((bucket, index) => {
              const maxFreq = Math.max(...monteCarlo.distributionBuckets.map(b => b.frequency), 1);
              const heightPct = Math.max(8, (bucket.frequency / maxFreq) * 100);
              
              let barColor = 'bg-slate-700 hover:bg-slate-600';
              if (index < 2) barColor = 'bg-emerald-600/80 hover:bg-emerald-500';
              else if (index >= 2 && index <= 5) barColor = 'bg-amber-600/80 hover:bg-amber-500';
              else barColor = 'bg-red-600/80 hover:bg-red-500';

              return (
                <div key={index} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                    {bucket.frequency} runs
                  </span>
                  <div 
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-sm transition-all duration-300 ${barColor}`}
                  ></div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-8 gap-2 text-center">
            {monteCarlo.distributionBuckets.map((bucket, index) => (
              <div key={index} className="text-[9px] sm:text-[10px] text-slate-400 font-mono truncate" title={bucket.rangeUSD}>
                {bucket.rangeUSD}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* D3.js Risk Landscape: Historical Loss Events vs. Empirical Probability Density */}
      <D3RiskLandscape
        historicalEvents={historicalEvents}
        monteCarlo={monteCarlo}
      />

      {/* Gemini Reasoning & Vertex AI Executive Guidance */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 rounded-xl p-6 shadow-xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Vertex AI Operational Guidance & Chief Engineer Analysis
              </h2>
              <p className="text-xs text-slate-400">
                Resilient Gemini synthesis synthesizing BigQuery telemetry, forced outage trends, and unit heat balance.
              </p>
            </div>
          </div>

          <button
            onClick={onGenerateAISummary}
            disabled={isGeneratingAI}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
            <span>{isGeneratingAI ? 'Synthesizing ML...' : 'Refresh AI Reasoning'}</span>
          </button>
        </div>

        <div className="prose prose-invert max-w-none text-slate-300 text-xs sm:text-sm bg-slate-950/60 rounded-lg p-5 border border-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
          {aiSummary || 'Click "Refresh AI Reasoning" to invoke Gemini with the resilient multi-model fallback protocol.'}
        </div>
      </div>

      {/* Plant Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Calibrate Coal Plant Operating Parameters
              </h3>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Gross Capacity (MW)</label>
                <input 
                  type="number" 
                  value={editConfig.capacityMW}
                  onChange={(e) => setEditConfig({ ...editConfig, capacityMW: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" 
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Base Heat Rate (Btu/kWh)</label>
                <input 
                  type="number" 
                  value={editConfig.baseHeatRateBtuKWh}
                  onChange={(e) => setEditConfig({ ...editConfig, baseHeatRateBtuKWh: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" 
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Power Tariff PPA ($/MWh ~ Rp 1.160.000)</label>
                <input 
                  type="number" 
                  step="0.5"
                  value={editConfig.powerPPAUSDPerMWh}
                  onChange={(e) => setEditConfig({ ...editConfig, powerPPAUSDPerMWh: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono" 
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Coal Delivered Cost ($/ton ~ Rp 1.312.000)</label>
                <input 
                  type="number" 
                  step="0.5"
                  value={editConfig.coalCostUSDPerTon}
                  onChange={(e) => setEditConfig({ ...editConfig, coalCostUSDPerTon: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono" 
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Target Capacity Factor (%)</label>
                <input 
                  type="number" 
                  value={editConfig.plannedCapacityFactorPct}
                  onChange={(e) => setEditConfig({ ...editConfig, plannedCapacityFactorPct: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" 
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Boiler Class</label>
                <select 
                  value={editConfig.boilerType}
                  onChange={(e) => setEditConfig({ ...editConfig, boilerType: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                >
                  <option value="Supercritical">Supercritical</option>
                  <option value="Ultra-Supercritical">Ultra-Supercritical</option>
                  <option value="Subcritical">Subcritical</option>
                  <option value="Circulating Fluidized Bed (CFB)">Circulating Fluidized Bed (CFB)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Save & Recalculate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
