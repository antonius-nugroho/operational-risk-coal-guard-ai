import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  CheckCircle, 
  Lightbulb, 
  ArrowUpRight, 
  Zap, 
  Radio, 
  Activity,
  Plus,
  Play,
  Upload,
  RotateCcw,
  Database
} from 'lucide-react';
import { MLRiskPrediction } from '../types/riskModel';
import { formatCurrencyIDR, formatNumberID } from '../lib/formatters';

interface MLPredictionsViewProps {
  predictions: MLRiskPrediction[];
  onTriggerRetrain: () => void;
  isRetraining: boolean;
  onOpenUploadData?: () => void;
  onRestoreDemo?: () => void;
}

export const MLPredictionsView: React.FC<MLPredictionsViewProps> = ({
  predictions,
  onTriggerRetrain,
  isRetraining,
  onOpenUploadData,
  onRestoreDemo,
}) => {
  const [selectedSubsystem, setSelectedSubsystem] = useState<MLRiskPrediction | null>(
    predictions && predictions.length > 0 ? predictions[0] : null
  );

  useEffect(() => {
    if (!predictions || predictions.length === 0) {
      setSelectedSubsystem(null);
    } else if (!selectedSubsystem || !predictions.some(p => p.subsystem === selectedSubsystem.subsystem)) {
      setSelectedSubsystem(predictions[0]);
    }
  }, [predictions]);

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case 'escalating':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
            <TrendingUp className="w-3 h-3" /> Escalating Risk
          </span>
        );
      case 'stable':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Activity className="w-3 h-3" /> Stable Envelope
          </span>
        );
      case 'improving':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <TrendingDown className="w-3 h-3" /> Improving
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Vertex AI Predictive Subsystem Risk Models</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ensemble Gradient Boosted Trees & LSTM Anomaly Autoencoders trained on operational loss records from BigQuery and streaming SCADA sensor telemetry.
          </p>
        </div>

        <button
          onClick={onTriggerRetrain}
          disabled={isRetraining}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-semibold text-xs transition-all shadow-sm self-start sm:self-auto"
        >
          <Play className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
          <span>{isRetraining ? 'Vertex AI Pipeline Running (BigQuery Extract)...' : 'Execute Vertex AI Retraining'}</span>
        </button>
      </div>

      {/* BigQuery & Vertex AI Feature Store Integration Strip */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Database className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Training Feature Source: <strong className="text-white font-mono">BigQuery (`coal_guard_analytics.failure_events` & `scada_telemetry`)</strong>
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
          <span>Partition: DAY(timestamp_start)</span>
          <span>•</span>
          <span>Target: Vertex AI Managed Dataset</span>
        </div>
      </div>

      {/* When Predictions are Empty (Workspace Cleared) */}
      {(!predictions || predictions.length === 0) ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Cpu className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Active Subsystem Risk Models Loaded</h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
              Operational failure logs and previous datasets were cleared from the workspace. Vertex AI predictive models rely on failure logs to calculate 30-day trip probabilities, root risk feature attribution, and early warning acoustic signatures.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onOpenUploadData && (
              <button
                onClick={onOpenUploadData}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-900/30"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Fresh Failure Logs (.xlsx / .csv)</span>
              </button>
            )}

            {onRestoreDemo && (
              <button
                onClick={onRestoreDemo}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Reload Tarahan CFB Sample Models</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Grid of Subsystem Models */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {predictions.map((pred, idx) => {
              const isSelected = selectedSubsystem?.subsystem === pred.subsystem;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedSubsystem(pred)}
                  className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 relative overflow-hidden ${
                    isSelected 
                      ? 'bg-slate-850 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40' 
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-slate-200 line-clamp-1">{pred.subsystem}</span>
                    {getTrendBadge(pred.riskTrend)}
                  </div>

                  <div className="mt-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">30-Day Trip Prob:</span>
                      <span className={`text-xl font-black ${
                        pred.predictedOutageProbabilityNext30DaysPct > 30 ? 'text-red-400' :
                        pred.predictedOutageProbabilityNext30DaysPct > 15 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {formatNumberID(pred.predictedOutageProbabilityNext30DaysPct, 1)}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          pred.predictedOutageProbabilityNext30DaysPct > 30 ? 'bg-red-500' :
                          pred.predictedOutageProbabilityNext30DaysPct > 15 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, pred.predictedOutageProbabilityNext30DaysPct * 2)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Value at Risk:</span>
                    <span className="font-semibold text-slate-200">{formatCurrencyIDR(pred.expectedFinancialImpactUSD, { compact: true })}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Subsystem Deep Dive */}
          {selectedSubsystem && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Subsystem Diagnostic Matrix
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    {selectedSubsystem.subsystem}
                  </h3>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                    Model Confidence: <strong className="text-emerald-400 font-mono">{formatNumberID(selectedSubsystem.modelConfidencePct, 1)}%</strong>
                  </span>
                  <span className="px-3 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                    VaR Exposure: <strong className="text-red-400 font-mono">{formatCurrencyIDR(selectedSubsystem.expectedFinancialImpactUSD, { compact: true })}</strong>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Key Risk Drivers */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-4 space-y-3">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Root Risk Drivers (Machine Learning Feature Attribution)
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {selectedSubsystem.keyRiskDrivers.map((driver, i) => (
                      <li key={i} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded border border-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></span>
                        <span>{driver}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Early Warning Signals */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-4 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-amber-400" />
                    Early Warning Acoustic & Thermal Indicators
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {selectedSubsystem.earlyWarningSignals.map((signal, i) => (
                      <li key={i} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded border border-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Actionable Engineering Recommendation */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Recommended Proactive Engineering Intervention
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
                    {selectedSubsystem.recommendedProactiveIntervention}
                  </p>
                </div>
              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
};
