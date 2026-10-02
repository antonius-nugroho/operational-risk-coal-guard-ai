import React from 'react';
import { 
  Database, 
  ShieldCheck, 
  Server, 
  HardDrive, 
  Trash2, 
  X, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  FileSpreadsheet,
  Lock,
  ArrowRight,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DataStorageInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenClearModal: () => void;
  onOpenUpload: () => void;
  failureCount: number;
  businessCount: number;
}

export const DataStorageInfoModal: React.FC<DataStorageInfoModalProps> = ({
  isOpen,
  onClose,
  onOpenClearModal,
  onOpenUpload,
  failureCount,
  businessCount,
}) => {
  const { user } = useAuth();

  if (!isOpen) return null;

  const firestoreDbId = 'ai-studio-376d1d38-177e-4009-a4b1-9f9fafa1117b';
  const region = 'asia-southeast1';
  const userId = user?.uid || 'guest-engineer-session';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Data Storage Architecture & Retention
              </h3>
              <p className="text-xs text-slate-400">
                Where your plant operational datasets, risk models, and telemetry reside
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Summary Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Active User Scope</div>
            <div className="text-xs font-mono font-bold text-amber-400 truncate" title={userId}>
              {user ? (user.email || userId) : 'Anonymous Engineer'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Failure Events Staged</div>
            <div className="text-xs font-mono font-bold text-emerald-400">
              {failureCount} records
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Business Metrics</div>
            <div className="text-xs font-mono font-bold text-cyan-400">
              {businessCount} months
            </div>
          </div>
        </div>

        {/* 4 Storage & Analytics Tiers (Hybrid Architecture) */}
        <div className="space-y-3.5 text-xs">
          
          {/* Tier 1: Google Cloud BigQuery */}
          <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
                <Database className="w-4 h-4" />
                <span>1. Google BigQuery (Data Warehouse & Analytical Engine)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono">
                Analytics Warehouse
              </span>
            </div>
            
            <p className="text-slate-300 leading-relaxed text-xs">
              When you click <strong>"Confirm & Commit to BigQuery & Cloud Storage"</strong>, plant failure event rows are streamed directly into managed Google BigQuery tables. Analytical aggregations (e.g. <code>PERCENTILE_CONT(0.10/0.50/0.90)</code>) compute quantitative Value-at-Risk (VaR) baselines and feed the Vertex AI predictive risk feature store.
            </p>

            <div className="bg-slate-900/90 rounded-lg p-3 space-y-1.5 font-mono text-[11px] border border-slate-800">
              <div className="text-slate-400">
                <span className="text-slate-500 font-sans">Dataset: </span>
                <span className="text-emerald-400 font-semibold">gen-lang-client-0134955637.coal_guard_analytics</span>
              </div>
              <div className="text-slate-400">
                <span className="text-slate-500 font-sans">Ingestion Tables: </span>
              </div>
              <ul className="list-disc list-inside pl-2 space-y-1 text-slate-300 text-[10px]">
                <li><code className="text-cyan-300">coal_guard_analytics.failure_events</code> - Timestamp-partitioned outage logs, RCFA, lost MWh</li>
                <li><code className="text-cyan-300">coal_guard_analytics.scada_telemetry</code> - 10-second thermal & vibration DCS sensor tag streams</li>
              </ul>
              <div className="text-slate-400">
                <span className="text-slate-500 font-sans">Storage Vault: </span>
                <span className="text-amber-300">gs://coal-guard-analytics-vault/{'{userId}'}</span>
              </div>
            </div>
          </div>

          {/* Tier 2: Cloud Firestore */}
          <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <Server className="w-4 h-4" />
                <span>2. Google Cloud Firestore (Workspace State & Audit History)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono">
                Real-Time State DB
              </span>
            </div>
            
            <p className="text-slate-300 leading-relaxed text-xs">
              Firestore maintains user-scoped workspace metadata, app settings, and fast UI state management under <code>users/{'{userId}'}/...</code>.
            </p>

            <div className="bg-slate-900/90 rounded-lg p-3 space-y-1.5 font-mono text-[11px] border border-slate-800">
              <div className="text-slate-400">
                <span className="text-slate-500 font-sans">Database ID: </span>
                <span className="text-emerald-400 font-semibold">{firestoreDbId}</span>
              </div>
              <div className="text-slate-400">
                <span className="text-slate-500 font-sans">Collection Paths: </span>
              </div>
              <ul className="list-disc list-inside pl-2 space-y-1 text-slate-300 text-[10px]">
                <li><code className="text-amber-300">/users/{'{userId}'}/upload_history</code> - BigQuery batch ingestion audit logs</li>
                <li><code className="text-amber-300">/users/{'{userId}'}/failure_events</code> - Operational outage logs for fast client UI rendering</li>
                <li><code className="text-amber-300">/users/{'{userId}'}/assessments</code> - Saved Monte Carlo snapshots (VaR P10/P50/P90, annual loss)</li>
                <li><code className="text-amber-300">/users/{'{userId}'}/settings</code> - Persistent workspace preferences and clear data flags</li>
              </ul>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md p-2">
              <Lock className="w-4 h-4 shrink-0" />
              <span>Owner-Bound Security: Access is governed by strict <code>firestore.rules</code> isolating data per authenticated UID (<code>request.auth.uid == userId</code>).</span>
            </div>
          </div>

          {/* Tier 3: In-Memory Client Runtime & Cache */}
          <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <Layers className="w-4 h-4" />
                <span>3. React Client State & Simulation Memory</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono">
                Active Runtime
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              Real-time operational analyses—including the <strong>2,500-iteration Monte Carlo Poisson/Normal Loss Distribution engine</strong>, <strong>D3.js Probability Density (KDE) curve</strong>, and active telemetry streams—run in high-speed browser memory for zero-latency interactive calibration.
            </p>
          </div>

          {/* Tier 3: Browser Local Storage */}
          <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-300 font-bold text-sm">
                <HardDrive className="w-4 h-4" />
                <span>3. Browser Local Storage (Offline Cache & Backups)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono">
                Client Cache
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              Temporary offline cache entries with keys prefixed <code>coal_risk_assessment_*</code> are maintained in your browser for session recovery and fallback when offline.
            </p>
          </div>

        </div>

        {/* Clear Data & Reset Actions */}
        <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Want to start over with completely fresh datasets?
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onOpenClearModal();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-700/50 text-xs font-bold transition-all shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Clear All Data Now</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenUpload();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Fresh Data</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
