import React from 'react';
import { 
  CheckCircle, 
  HelpCircle, 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  Database, 
  BarChart, 
  AlertTriangle 
} from 'lucide-react';

interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalkthroughModal: React.FC<WalkthroughModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const testCases = [
    {
      id: 'TC-1',
      title: 'Monte Carlo Operational Risk Quantification & Uncertainty Simulation',
      trigger: 'Click "Rerun Monte Carlo (2,500 Iterations)" on the Executive Dashboard tab.',
      expected: 'The Monte Carlo simulation engine recomputes 2,500 Poisson-Lognormal stochastic operating cycles. Values for P10 (Optimistic loss), P50 (Expected loss), P90 (Severe tail risk), and the 8-bucket frequency distribution histogram immediately re-render with updated statistics.',
      verification: 'Observe the histogram bars update and the uncertainty spread ($P90 - P10) recalculate.'
    },
    {
      id: 'TC-2',
      title: 'Plant Parameter Calibration & Sensitivity Adjustment',
      trigger: 'Click "Calibrate Plant Parameters", adjust Gross Capacity (e.g. 660 MW to 800 MW) or Base Heat Rate, and click "Save & Recalculate".',
      expected: 'New technical parameters are applied to the simulation model, confetti triggers, and all fuel spread, heat rate optimization opportunities, and downside loss metrics update proportionally.',
      verification: 'Gross capacity header reflects new MW and opportunity capture estimates adjust.'
    },
    {
      id: 'TC-3',
      title: 'Resilient Gemini Reasoning with Multi-Model Fallback',
      trigger: 'Click "Refresh AI Reasoning" on the Executive Dashboard.',
      expected: 'Invokes Gemini using the resilient fallback protocol ladder (gemini-3.6-flash -> gemini-3.1-flash-lite -> gemini-flash-latest -> gemini-3.7-flash). Generates Chief Risk Officer guidance diagnosing acoustic leak signals, pulverizer moisture sensitivity, and sootblowing optimization.',
      verification: 'Text area populates with fresh markdown operational guidance.'
    },
    {
      id: 'TC-4',
      title: 'Vertex AI Subsystem Risk Diagnostic & Feature Attribution',
      trigger: 'Navigate to "Vertex AI Subsystem Risks" and click between "Boiler Waterwall", "Pulverizer & Coal Mill Bearings", etc.',
      expected: 'Interactive diagnostic matrix switches dynamically to show root risk drivers, acoustic early warning signals, and proactive engineering recommendations for the selected subsystem.',
      verification: 'Clicking different subsystem cards updates the lower diagnostic view with confidence percentages and dollar VaR.'
    },
    {
      id: 'TC-5',
      title: 'Historical Loss Event Ingestion & Outage Log Management',
      trigger: 'Navigate to "Loss Events & RCA", click "Log New Outage Event", enter outage hours, financial loss, root cause, and submit.',
      expected: 'New failure event is added to the historical ledger with automatic recalculation of total downtime hours and cumulative losses.',
      verification: 'Table displays new record with severity badges and delete controls.'
    },
    {
      id: 'TC-6',
      title: 'BigQuery Telemetry Ingestion & Anomaly Simulation',
      trigger: 'Navigate to "BigQuery Telemetry Stream" and click "Simulate Sensor Thermal Anomaly Spike".',
      expected: 'Injects a high-vibration, high-steam-temperature anomaly record into the SCADA streaming buffer. Anomaly Score elevates (>60%) with red alert indicators.',
      verification: 'Telemetry gauge cluster and BigQuery query stream table reflect the new anomalous data points.'
    },
    {
      id: 'TC-7',
      title: 'Google Cloud Platform (GCP) Industrial Architecture Mapping',
      trigger: 'Navigate to "GCP Industrial Architecture".',
      expected: 'Displays the complete data pipeline topology (OT Sensors -> Pub/Sub -> Dataflow -> BigQuery/GCS -> Vertex AI / Gemini -> Cloud Run) with specs for industrial reliability.',
      verification: 'View architecture topology and interactive service cards.'
    },
    {
      id: 'TC-8',
      title: 'Secure Firestore Persistence & Owner-Bound Security Rules',
      trigger: 'Click "Save to Firestore" on the Executive Dashboard.',
      expected: 'Sanitizes the risk model snapshot payload (stripping undefined properties) and persists the state into Cloud Firestore under the user-scoped document path (`users/{userId}/assessments/{id}`).',
      verification: 'Green confirmation banner confirms successful document write in compliance with firestore.rules.'
    },
    {
      id: 'TC-9',
      title: 'D3.js Risk Landscape: Empirical Probability Density vs. Historical Loss Events',
      trigger: 'On the Executive Dashboard, scroll to "D3.js Risk Landscape". Hover over scatter event bubbles or toggle "KDE Curve", "VaR Lines (P10/50/90)", and "Rug Marks".',
      expected: 'D3.js renders a smooth continuous Kernel Density Estimation (KDE) curve with an amber-red risk gradient. Discrete historical loss events are dynamically projected as sized bubbles (proportional to outage duration) along the probability density terrain with a hover tooltip showing root cause analysis (RCA).',
      verification: 'Hovering a bubble displays event RCA tooltip; toggles show/hide layers dynamically.'
    },
    {
      id: 'TC-10',
      title: 'Plant Data Sources (Failure Data, Business Data & Status Taxonomy)',
      trigger: 'Click "Plant Data Sources (CSV)" in the top navigation bar. Switch between "Failure Data", "Business Data", and "Unit Status Codes" tabs, and test the search bar.',
      expected: 'Displays the parsed real-world operational datasets: Failure Data with equipment numbers, RCFA, cause codes, lost MWh; Business Data with monthly generation, heat rate (NPHR/GPHR), EFOR, and coal usage; and the 29 official NERC/IEEE operational status codes.',
      verification: 'Search filters rows in real time; unit filter isolates Unit 3 or Unit 4 data.'
    },
    {
      id: 'TC-11',
      title: 'Multi-Format File Ingestion (.xlsx / .csv), Template Downloads & Firestore Batch Commit',
      trigger: 'On "Plant Data Sources", click "Download Templates" to download sample .xlsx or .csv files, then click "Upload Monthly Data (.xlsx / .csv)". Drag or select a file, inspect the 50-row pre-commit review grid and summary cards, then click "Confirm & Commit to Firestore".',
      expected: 'Generates and downloads valid Excel (.xlsx) and CSV templates client-side. The upload modal parses Excel workbooks or CSV strings, validates schema columns, shows metric summaries (row count, date span, loss exposure), batches documents into Firestore (`users/{userId}/failure_events` or `business_metrics`) with upload metadata, triggers celebration confetti, and re-triggers the Monte Carlo simulation.',
      verification: 'Download triggers file save; modal displays interactive pre-commit grid; committing displays green Firestore confirmation.'
    },
    {
      id: 'TC-12',
      title: 'Data Storage Architecture Inspection & Safe Workspace Purge / Fresh Upload Reset',
      trigger: 'Click "Data Storage" in the top navigation bar or "Clear All Data" on the Executive Dashboard / Plant Data Sources. Inspect the storage tiers (Firestore DB ID, Region, Collection paths, isolation rules), then click "Yes, Clear All Data".',
      expected: 'Data Storage modal reveals exact Google Cloud Firestore project and collection mappings with active record metrics. Clicking "Yes, Clear All Data" purges Firestore collections (`failure_events`, `business_metrics`, `lossEvents`, `assessments`), cleans local storage cache, sets persistent cleared status across page refreshes, resets Vertex AI subsystem risk models to an empty awaiting state, and recalibrates the Monte Carlo risk engine to a clean zero baseline awaiting fresh uploads.',
      verification: 'Modal displays active database details; clicking "Yes, Clear All Data" immediately resets table counts and Vertex AI subsystem risk models to 0, displaying fresh upload prompts.'
    },
    {
      id: 'TC-13',
      title: 'Indonesian Regional Settings & Localization Formats (IDR, Dates, Numbers)',
      trigger: 'Browse across Executive Dashboard, Plant Data Sources, Telemetry Stream, and Loss Events tabs.',
      expected: 'All financial figures are denominated in Indonesian Rupiah (Rp) with dot thousand separator and comma decimal separator (e.g., Rp 1.940.323 or Rp 2,50 Miliar). Timestamps display in `dd mmm yyyy hh:mm` format (e.g., 16 Jan 2023 08:22), dates in `dd mmm yyyy` (e.g., 16 Jan 2023), times in `hh:mm` (e.g., 08:22), and telemetry/metrics use comma decimal separators (e.g., 566,0 °C, 255,0 bar).',
      verification: 'Values show Indonesian Rupiah (Rp), dates show 3-letter month abbreviations, and numerical decimals consistently use commas rather than dots.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">Functional Stability & Verification Walkthrough</h3>
              <p className="text-xs text-slate-400">Step-by-step test cases for every user interaction and system capability.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {testCases.map((tc) => (
            <div key={tc.id} className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 font-mono">{tc.id}: {tc.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Test Ready
                </span>
              </div>
              <div className="text-xs text-slate-300">
                <strong className="text-slate-400">Trigger:</strong> {tc.trigger}
              </div>
              <div className="text-xs text-slate-300">
                <strong className="text-slate-400">Expected Result:</strong> {tc.expected}
              </div>
              <div className="text-xs text-emerald-300/90 font-mono bg-slate-900/60 p-2 rounded border border-slate-800/80">
                ✓ Verification: {tc.verification}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
          >
            Close Checklist
          </button>
        </div>

      </div>
    </div>
  );
};
