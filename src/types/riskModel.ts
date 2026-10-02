export interface PlantConfig {
  id: string;
  name: string;
  location: string;
  capacityMW: number;
  boilerType: 'Supercritical' | 'Subcritical' | 'Ultra-Supercritical' | 'Circulating Fluidized Bed (CFB)';
  coalType: 'Bituminous' | 'Sub-bituminous' | 'Lignite' | 'Anthracite';
  commissionYear: number;
  coolingSystem: 'Once-through' | 'Wet Cooling Tower' | 'Dry Cooling';
  baseHeatRateBtuKWh: number; // e.g. 9800
  powerPPAUSDPerMWh: number; // e.g. 68
  coalCostUSDPerTon: number; // e.g. 85
  carbonTaxUSDPerTon: number; // e.g. 25
  plannedCapacityFactorPct: number; // e.g. 78
}

export type LossCategory = 
  | 'Boiler Tube Leakage & Pressure Parts'
  | 'Turbine Vibration & Blade Erosion'
  | 'Coal Mill & Pulverizer Trip'
  | 'FGD / Flue Gas Desulfurization Outage'
  | 'Ash Handling & Slagging'
  | 'Grid Curtailment & Generator Trip'
  | 'Coal Supply Quality Variance & Moisture'
  | 'Environmental Emission Exceedance (NOx/SO2/Particulate)';

export interface LossEvent {
  id: string;
  date: string;
  plantId: string;
  unit: string;
  category: LossCategory;
  forcedOutageHours: number;
  mwhLost: number;
  financialLossUSD: number;
  rootCause: string;
  detectedBy: 'Acoustic Leak Sensor' | 'Vibration Telemetry' | 'Pyrometer/Thermal' | 'Operator Inspection' | 'BigQuery Anomaly Model';
  severity: 'Low' | 'Medium' | 'High' | 'Catastrophic';
  preventableWithML: boolean;
  mitigationActionTaken: string;
}

export interface TelemetryReading {
  timestamp: string;
  unitId: string;
  mainSteamTempC: number;
  mainSteamPressureBar: number;
  reheatSteamTempC: number;
  boilerVibrationMmS: number;
  turbineVibrationUm: number;
  flueGasSO2MgNm3: number;
  flueGasNOxMgNm3: number;
  flueGasOpacityPct: number;
  coalFeedRateTph: number;
  pulverizerCurrentAmps: number;
  netOutputMW: number;
  heatRateBtuKWh: number;
  anomalyScore: number; // 0 - 100
  anomalyPredictedSubsystem?: string;
}

export interface MLRiskPrediction {
  subsystem: string;
  predictedOutageProbabilityNext30DaysPct: number;
  expectedFinancialImpactUSD: number;
  modelConfidencePct: number;
  riskTrend: 'escalating' | 'stable' | 'improving';
  keyRiskDrivers: string[];
  earlyWarningSignals: string[];
  recommendedProactiveIntervention: string;
}

export interface MonteCarloOpportunityResult {
  percentileP10USD: number; // pessimistic loss
  percentileP50USD: number; // median expected loss
  percentileP90USD: number; // optimistic loss
  annualExpectedForcedOutageHours: number;
  expectedAnnualLossUSD: number;
  mlPredictiveSavingsOpportunityUSD: number;
  heatRateOptimizationOpportunityUSD: number;
  coalBlendingArbitrageOpportunityUSD: number;
  totalAnnualNetOpportunityUSD: number;
  iterations: number;
  distributionBuckets: { rangeUSD: string; frequency: number }[];
}

export interface FullRiskAssessment {
  id: string;
  createdAt: string;
  plantConfig: PlantConfig;
  periodDays: number;
  totalHistoricalLossUSD: number;
  mlPredictions: MLRiskPrediction[];
  monteCarlo: MonteCarloOpportunityResult;
  aiExecutiveSummary: string;
  vertexAIPipelineStatus: {
    bigqueryIngestion: 'Connected' | 'Idle' | 'Syncing';
    vertexAIModelVersion: string;
    pubsubEventLagMs: number;
    dataflowWorkerNodes: number;
  };
}

export interface ArchitectureComponent {
  name: string;
  badge: string;
  iconName: string;
  role: string;
  gcpService: string;
  telemetryMetric: string;
  status: 'Healthy' | 'Active' | 'Optimizing';
}
