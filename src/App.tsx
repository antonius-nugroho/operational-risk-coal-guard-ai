/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { MLPredictionsView } from './components/MLPredictionsView';
import { HistoricalEventsView } from './components/HistoricalEventsView';
import { TelemetryStreamView } from './components/TelemetryStreamView';
import { IndustrialArchitectureView } from './components/IndustrialArchitectureView';
import { DataSourceExplorerView } from './components/DataSourceExplorerView';
import { WalkthroughModal } from './components/WalkthroughModal';
import { DataStorageInfoModal } from './components/DataStorageInfoModal';
import { ClearDataConfirmModal } from './components/ClearDataConfirmModal';
import { DataUploadReviewModal } from './components/DataUploadReviewModal';

import { 
  INITIAL_PLANTS, 
  INITIAL_LOSS_EVENTS, 
  INITIAL_TELEMETRY, 
  INITIAL_ML_PREDICTIONS,
  runMonteCarloRiskSimulation,
  generateMLPredictionsFromEvents 
} from './data/mockData';
import { 
  RAW_BUSINESS_RECORDS, 
  RAW_FAILURE_RECORDS, 
  mapRawFailuresToLossEvents 
} from './data/plantDataset';
import { RawBusinessData, RawFailureData } from './types/datasetTypes';
import { PlantConfig, LossEvent, TelemetryReading, MLRiskPrediction, MonteCarloOpportunityResult } from './types/riskModel';
import { runGeminiWithFallback } from './lib/geminiService';
import { formatCurrencyIDR, parseNumberSafe } from './lib/formatters';
import { useAuth } from './context/AuthContext';
import { db } from './lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { 
  fetchMonteCarloStats, 
  streamTelemetryToBigQuery, 
  clearBigQueryDataset, 
  commitFailureEventsToBigQuery,
  fetchBigQueryTrainingDataset 
} from './services/bigQueryService';

export default function App() {
  const { user } = useAuth();

  // Helper to read initial state taking into account user-cleared status and custom uploads
  const getInitialFailures = (): RawFailureData[] => {
    try {
      const status = localStorage.getItem('coal_data_status');
      if (status === 'cleared') return [];
      const custom = localStorage.getItem('coal_custom_failures');
      if (custom) return JSON.parse(custom);
    } catch (e) {
      console.warn('Initial failure load warning:', e);
    }
    return RAW_FAILURE_RECORDS;
  };

  const getInitialBusiness = (): RawBusinessData[] => {
    try {
      const status = localStorage.getItem('coal_data_status');
      if (status === 'cleared') return [];
      const custom = localStorage.getItem('coal_custom_business');
      if (custom) return JSON.parse(custom);
    } catch (e) {
      console.warn('Initial business load warning:', e);
    }
    return RAW_BUSINESS_RECORDS;
  };

  const getInitialLossEvents = (initFailures: RawFailureData[]): LossEvent[] => {
    try {
      const status = localStorage.getItem('coal_data_status');
      if (status === 'cleared') return [];
      if (initFailures && initFailures.length > 0) {
        return mapRawFailuresToLossEvents(initFailures);
      }
    } catch (e) {
      console.warn('Initial loss events load warning:', e);
    }
    return initFailures.length === 0 ? [] : INITIAL_LOSS_EVENTS;
  };

  const getInitialMLPredictions = (initLosses: LossEvent[]): MLRiskPrediction[] => {
    try {
      const status = localStorage.getItem('coal_data_status');
      if (status === 'cleared') return [];
      if (initLosses && initLosses.length > 0) {
        return generateMLPredictionsFromEvents(initLosses);
      }
    } catch (e) {
      console.warn('Initial ML predictions load warning:', e);
    }
    return initLosses.length === 0 ? [] : INITIAL_ML_PREDICTIONS;
  };

  // State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(false);
  const [isStorageInfoOpen, setIsStorageInfoOpen] = useState<boolean>(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [currentPlant, setCurrentPlant] = useState<PlantConfig>(INITIAL_PLANTS[0]);

  const [failures, setFailures] = useState<RawFailureData[]>(getInitialFailures);
  const [businessData, setBusinessData] = useState<RawBusinessData[]>(getInitialBusiness);
  const [lossEvents, setLossEvents] = useState<LossEvent[]>(() => {
    const initFailures = getInitialFailures();
    return getInitialLossEvents(initFailures);
  });
  const [telemetry, setTelemetry] = useState<TelemetryReading[]>(INITIAL_TELEMETRY);
  const [mlPredictions, setMlPredictions] = useState<MLRiskPrediction[]>(() => {
    const initFailures = getInitialFailures();
    const initLosses = getInitialLossEvents(initFailures);
    return getInitialMLPredictions(initLosses);
  });
  const [monteCarloResult, setMonteCarloResult] = useState<MonteCarloOpportunityResult>(() => {
    const initFailures = getInitialFailures();
    const initLosses = getInitialLossEvents(initFailures);
    return runMonteCarloRiskSimulation(INITIAL_PLANTS[0], initLosses, 2500);
  });

  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);

  // Clear data handler: purges failures, business metrics, and resets risk models for fresh upload
  const handleDataCleared = () => {
    const userId = user?.uid || 'guest-engineer-session';
    clearBigQueryDataset(userId);
    try {
      localStorage.setItem('coal_data_status', 'cleared');
      localStorage.removeItem('coal_custom_failures');
      localStorage.removeItem('coal_custom_business');
    } catch (e) {
      console.warn('localStorage clear warning:', e);
    }

    try {
      const stateDocRef = doc(db, 'users', userId, 'settings', 'workspace_state');
      setDoc(stateDocRef, {
        status: 'cleared',
        clearedAt: new Date().toISOString(),
        activeDataset: null
      }).catch(() => {});
    } catch (e) {}

    setFailures([]);
    setBusinessData([]);
    setLossEvents([]);
    setMlPredictions([]);
    // Reset simulation with empty/zero baseline
    setMonteCarloResult({
      percentileP10USD: 0,
      percentileP50USD: 0,
      percentileP90USD: 0,
      annualExpectedForcedOutageHours: 0,
      expectedAnnualLossUSD: 0,
      mlPredictiveSavingsOpportunityUSD: 0,
      heatRateOptimizationOpportunityUSD: 0,
      coalBlendingArbitrageOpportunityUSD: 0,
      totalAnnualNetOpportunityUSD: 0,
      iterations: 2500,
      distributionBuckets: [
        { rangeUSD: `${formatCurrencyIDR(0, { compact: true })} - ${formatCurrencyIDR(200000, { compact: true })}`, frequency: 2500 },
        { rangeUSD: `${formatCurrencyIDR(200000, { compact: true })} - ${formatCurrencyIDR(400000, { compact: true })}`, frequency: 0 },
        { rangeUSD: `${formatCurrencyIDR(400000, { compact: true })} - ${formatCurrencyIDR(600000, { compact: true })}`, frequency: 0 },
        { rangeUSD: `${formatCurrencyIDR(600000, { compact: true })} - ${formatCurrencyIDR(800000, { compact: true })}`, frequency: 0 },
        { rangeUSD: `${formatCurrencyIDR(800000, { compact: true })} - ${formatCurrencyIDR(1000000, { compact: true })}`, frequency: 0 },
        { rangeUSD: `${formatCurrencyIDR(1000000, { compact: true })} - ${formatCurrencyIDR(1200000, { compact: true })}`, frequency: 0 },
        { rangeUSD: `${formatCurrencyIDR(1200000, { compact: true })} - ${formatCurrencyIDR(1400000, { compact: true })}`, frequency: 0 },
        { rangeUSD: `${formatCurrencyIDR(1400000, { compact: true })} - ${formatCurrencyIDR(1600000, { compact: true })}`, frequency: 0 },
      ]
    });
    setAiSummary('### Workspace Initialized for Fresh Data Upload\n*All historical failure events and business realization records have been cleared from memory and database collections.*\n\n1. Use **"Plant Data Sources" -> "Upload Monthly Data"** to upload your fresh `.xlsx` or `.csv` files.\n2. You can also download standardized `.xlsx` or `.csv` sample templates from the "Download Templates" menu.\n3. Upon file commitment, the Monte Carlo Risk Engine, D3 Risk Landscape, and telemetry will automatically recalculate.');
  };

  // Restore sample demo data
  const handleRestoreDemo = () => {
    try {
      localStorage.removeItem('coal_data_status');
      localStorage.removeItem('coal_custom_failures');
      localStorage.removeItem('coal_custom_business');
    } catch (e) {
      console.warn('localStorage restore warning:', e);
    }
    setFailures(RAW_FAILURE_RECORDS);
    setBusinessData(RAW_BUSINESS_RECORDS);
    const restoredLosses = mapRawFailuresToLossEvents(RAW_FAILURE_RECORDS);
    setLossEvents(restoredLosses);
    setMlPredictions(INITIAL_ML_PREDICTIONS);
    setAiSummary('');
  };

  // Initialize initial Monte Carlo on load
  const handleRunSimulation = () => {
    const updatedSim = runMonteCarloRiskSimulation(currentPlant, lossEvents, 2500);
    setMonteCarloResult(updatedSim);
  };

  // Recalculate simulation whenever plant or loss events change
  useEffect(() => {
    handleRunSimulation();
  }, [currentPlant, lossEvents]);

  // Initial AI summary generation
  useEffect(() => {
    handleGenerateAISummary();
  }, []);

  const handleGenerateAISummary = async () => {
    setIsGeneratingAI(true);
    try {
      const prompt = `Perform an operational risk & opportunity assessment for ${currentPlant.name} (${currentPlant.capacityMW} MW, ${currentPlant.boilerType} boiler, burning ${currentPlant.coalType}).
Key Data:
- Expected Annual Forced Outage Loss: $${(monteCarloResult.expectedAnnualLossUSD / 1000000).toFixed(2)}M
- Tail Risk (P90): $${(monteCarloResult.percentileP90USD / 1000000).toFixed(2)}M
- Opportunity via ML & Heat Rate Optimization: $${(monteCarloResult.totalAnnualNetOpportunityUSD / 1000000).toFixed(2)}M
- Recent Major Historical Incidents: ${lossEvents.slice(0, 3).map(e => `${e.category} ($${(e.financialLossUSD / 1000).toFixed(0)}k loss: ${e.rootCause})`).join('; ')}

Format with:
1. Primary Operational Vulnerabilities & Unit Integrity
2. BigQuery & Vertex AI Telemetry Pattern Corroboration
3. Immediate Chief Engineer Mitigation Directives`;

      const result = await runGeminiWithFallback(prompt);
      setAiSummary(result);
    } catch (err) {
      console.error('AI generation failed', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleUpdatePlant = (updated: PlantConfig) => {
    setCurrentPlant(updated);
  };

  const handleAddLossEvent = (newEvent: Omit<LossEvent, 'id'>) => {
    const fullEvent: LossEvent = {
      ...newEvent,
      id: `loss-${Date.now()}`
    };
    setLossEvents(prev => [fullEvent, ...prev]);
  };

  const handleDeleteLossEvent = (id: string) => {
    setLossEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleInjectTelemetrySpike = () => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newReading: TelemetryReading = {
      timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
      unitId: 'Unit 4',
      mainSteamTempC: 574.8,
      mainSteamPressureBar: 249.2,
      reheatSteamTempC: 570.1,
      boilerVibrationMmS: 7.4,
      turbineVibrationUm: 88.5,
      flueGasSO2MgNm3: 245.0,
      flueGasNOxMgNm3: 260.0,
      flueGasOpacityPct: 18.5,
      coalFeedRateTph: 268.0,
      pulverizerCurrentAmps: 138.0,
      netOutputMW: 658.0,
      heatRateBtuKWh: 9450,
      anomalyScore: 84,
      anomalyPredictedSubsystem: 'CRITICAL: Severe Platen Superheater Thermal Stress & Pulverizer C High-Amperage Cavitation'
    };

    setTelemetry(prev => [...prev.slice(-15), newReading]);
  };

  const handleTriggerVertexRetrain = async () => {
    setIsRetraining(true);
    const userId = user?.uid || 'guest-engineer-session';
    try {
      // Feature extraction directly from BigQuery analytical tables
      const bqFeatures = await fetchBigQueryTrainingDataset(userId);
      setTimeout(() => {
        if (lossEvents.length > 0 || (bqFeatures.trainingRows && bqFeatures.trainingRows.length > 0)) {
          setMlPredictions(generateMLPredictionsFromEvents(lossEvents));
        } else {
          setMlPredictions([]);
        }
        setIsRetraining(false);
      }, 1200);
    } catch {
      setTimeout(() => {
        if (lossEvents.length > 0) {
          setMlPredictions(generateMLPredictionsFromEvents(lossEvents));
        } else {
          setMlPredictions([]);
        }
        setIsRetraining(false);
      }, 1200);
    }
  };

  const handleSaveToFirestore = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const userId = user?.uid || 'guest-engineer-session';
      const assessmentId = `assess-${Date.now()}`;
      
      // Strict payload sanitization: zero undefined properties
      const rawPayload = {
        id: assessmentId,
        createdAt: new Date().toISOString(),
        plantConfig: currentPlant,
        totalHistoricalLossUSD: lossEvents.reduce((s, e) => s + e.financialLossUSD, 0),
        monteCarloSummary: {
          p10: monteCarloResult.percentileP10USD,
          p50: monteCarloResult.percentileP50USD,
          p90: monteCarloResult.percentileP90USD,
          netOpportunityUSD: monteCarloResult.totalAnnualNetOpportunityUSD,
        },
        aiExecutiveSummary: aiSummary || 'Assessment created.',
        savedBy: user?.email || 'Anonymous Engineer',
      };

      const sanitizedPayload = JSON.parse(JSON.stringify(rawPayload));

      // Attempt to save to Firestore
      const docRef = doc(db, 'users', userId, 'assessments', assessmentId);
      await setDoc(docRef, sanitizedPayload);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err: any) {
      console.warn('Firestore write warning:', err?.message || err);
      // Fallback local storage persistence
      try {
        localStorage.setItem(`coal_risk_assessment_${Date.now()}`, JSON.stringify(currentPlant));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 5000);
      } catch (localErr) {
        console.error('Local persistence also failed', localErr);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Header & Navigation */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
        onOpenStorageInfo={() => setIsStorageInfoOpen(true)}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'dashboard' && (
          <ExecutiveDashboard
            plant={currentPlant}
            onUpdatePlant={handleUpdatePlant}
            historicalEvents={lossEvents}
            monteCarlo={monteCarloResult}
            onRunSimulation={handleRunSimulation}
            aiSummary={aiSummary}
            isGeneratingAI={isGeneratingAI}
            onGenerateAISummary={handleGenerateAISummary}
            onSaveAssessment={handleSaveToFirestore}
            isSaving={isSaving}
            saveSuccess={saveSuccess}
            onOpenClearModal={() => setIsClearModalOpen(true)}
            onOpenUploadData={() => setActiveTab('data-sources')}
          />
        )}

        {activeTab === 'data-sources' && (
          <DataSourceExplorerView 
            failures={failures}
            businessData={businessData}
            onDataCleared={handleDataCleared}
            onRestoreDemo={handleRestoreDemo}
            onDataCommitted={(type, count, newRecords) => {
              try {
                localStorage.removeItem('coal_data_status');
              } catch (e) {}

              if (type === 'failure' && newRecords && newRecords.length > 0) {
                // Enrich and add to failures
                const enriched = newRecords.map((r, i) => {
                  const rawMwh = parseNumberSafe(r.loss_output_mwh || r.lossOutputMwh || 0);
                  const mwh = isNaN(rawMwh) ? 0 : rawMwh;
                  const rawDur = parseNumberSafe(r.failure_duration_hours || r.failureDurationHours || 1);
                  const dur = isNaN(rawDur) ? 1 : rawDur;
                  return {
                    id: r.id || `uploaded-fail-${Date.now()}-${i}`,
                    timestamp_start: r.timestamp_start || r.date || new Date().toISOString().split('T')[0],
                    unit_status: r.unit_status || 'FO',
                    asset_number: r.asset_number || 'General Asset',
                    root_cause_failure_analysis: r.root_cause_failure_analysis || r.rootCause || 'Operational failure event',
                    failure_cause_code: r.failure_cause_code || 'General system problem',
                    failure_mode: r.failure_mode || 'F060 Broken',
                    mitigation: r.mitigation || 'Corrective action taken',
                    power_gross_realization: parseNumberSafe(r.power_gross_realization || 0) || 0,
                    power_net_realization: parseNumberSafe(r.power_net_realization || 0) || 0,
                    failure_impact: r.failure_impact || 'Tripped',
                    loss_output_mw: parseNumberSafe(r.loss_output_mw || 100) || 100,
                    timestamp_stop: r.timestamp_stop || '',
                    failure_duration_hour_minute: r.failure_duration_hour_minute || `${dur} hrs`,
                    failure_duration_hours: dur,
                    loss_output_mwh: mwh,
                    unit_no: r.unit_no || 'Unit 3',
                    financialLossUSD: mwh * 72.5,
                    category: r.category || 'Boiler Tube Leakage & Pressure Parts',
                    preventableWithML: true,
                    severity: (dur > 48 ? 'Catastrophic' : dur > 20 ? 'High' : 'Medium') as any,
                    detectedBy: (r.detectedBy || 'BigQuery Anomaly Model') as any,
                  };
                });
                setFailures(prev => {
                  const updated = [...enriched, ...prev];
                  try {
                    localStorage.setItem('coal_custom_failures', JSON.stringify(updated));
                  } catch (e) {}
                  return updated;
                });
                const mappedEvents = mapRawFailuresToLossEvents(enriched);
                setLossEvents(prev => {
                  const updated = [...mappedEvents, ...prev];
                  setMlPredictions(generateMLPredictionsFromEvents(updated));
                  return updated;
                });
              } else if (type === 'business' && newRecords && newRecords.length > 0) {
                setBusinessData(prev => {
                  const updated = [...newRecords, ...prev];
                  try {
                    localStorage.setItem('coal_custom_business', JSON.stringify(updated));
                  } catch (e) {}
                  return updated;
                });
              }
              // Re-trigger Monte Carlo risk model simulation and refresh metrics
              handleRunSimulation();
            }}
          />
        )}

        {activeTab === 'ml-predictions' && (
          <MLPredictionsView
            predictions={mlPredictions}
            onTriggerRetrain={handleTriggerVertexRetrain}
            isRetraining={isRetraining}
            onOpenUploadData={() => setActiveTab('data-sources')}
            onRestoreDemo={handleRestoreDemo}
          />
        )}

        {activeTab === 'historical-events' && (
          <HistoricalEventsView
            events={lossEvents}
            onAddEvent={handleAddLossEvent}
            onDeleteEvent={handleDeleteLossEvent}
          />
        )}

        {activeTab === 'telemetry' && (
          <TelemetryStreamView
            telemetry={telemetry}
            onInjectSpike={handleInjectTelemetrySpike}
          />
        )}

        {activeTab === 'architecture' && (
          <IndustrialArchitectureView />
        )}

      </main>

      {/* Verification Walkthrough Checklist Modal */}
      <WalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
      />

      {/* Data Storage & Retention Architecture Info Modal */}
      <DataStorageInfoModal
        isOpen={isStorageInfoOpen}
        onClose={() => setIsStorageInfoOpen(false)}
        onOpenClearModal={() => setIsClearModalOpen(true)}
        onOpenUpload={() => {
          setActiveTab('data-sources');
        }}
        failureCount={failures.length}
        businessCount={businessData.length}
      />

      {/* Global Clear Data Confirmation Modal */}
      <ClearDataConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onCleared={handleDataCleared}
        onRestoreDemo={handleRestoreDemo}
      />

      {/* Industrial Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-800/80 py-4 px-4 sm:px-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>COAL-GUARD™ Risk Modeling System • Vertex AI & BigQuery Industrial Architecture</span>
          <span className="font-mono text-[11px] text-slate-400">Environment: Google Cloud Run • Model: Gemini 3.6/3.7 Multi-Ladder</span>
        </div>
      </footer>

    </div>
  );
}
