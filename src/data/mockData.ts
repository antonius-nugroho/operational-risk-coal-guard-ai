import { PlantConfig, LossEvent, MLRiskPrediction, MonteCarloOpportunityResult, TelemetryReading } from '../types/riskModel';
import { RAW_FAILURE_RECORDS, mapRawFailuresToLossEvents } from './plantDataset';
import { formatCurrencyIDR } from '../lib/formatters';

export const INITIAL_PLANTS: PlantConfig[] = [
  {
    id: 'plant-tarahan',
    name: 'Tarahan CFB Coal-Fired Power Station (Unit 3 & 4)',
    location: 'South Sumatra / Lampung Grid',
    capacityMW: 200, // 2x 100 MW CFB Units (Unit 3 & Unit 4)
    boilerType: 'Circulating Fluidized Bed (CFB)',
    coalType: 'Sub-bituminous',
    commissionYear: 2013,
    coolingSystem: 'Wet Cooling Tower',
    baseHeatRateBtuKWh: 9850,
    powerPPAUSDPerMWh: 72.5,
    coalCostUSDPerTon: 82.0,
    carbonTaxUSDPerTon: 25.0,
    plannedCapacityFactorPct: 84.5,
  },
  {
    id: 'plant-suralaya-u7',
    name: 'Tanjung Jati Supercritical Station - Unit 4',
    location: 'Central Java Coast',
    capacityMW: 660,
    boilerType: 'Supercritical',
    coalType: 'Sub-bituminous',
    commissionYear: 2014,
    coolingSystem: 'Once-through',
    baseHeatRateBtuKWh: 9150,
    powerPPAUSDPerMWh: 72.5,
    coalCostUSDPerTon: 88.0,
    carbonTaxUSDPerTon: 22.0,
    plannedCapacityFactorPct: 82,
  },
  {
    id: 'plant-baton-rouge-u2',
    name: 'Prairie Basin Thermal Unit 2',
    location: 'Midwest Basin',
    capacityMW: 800,
    boilerType: 'Ultra-Supercritical',
    coalType: 'Bituminous',
    commissionYear: 2018,
    coolingSystem: 'Wet Cooling Tower',
    baseHeatRateBtuKWh: 8850,
    powerPPAUSDPerMWh: 69.0,
    coalCostUSDPerTon: 94.0,
    carbonTaxUSDPerTon: 30.0,
    plannedCapacityFactorPct: 78,
  },
  {
    id: 'plant-cfb-lignite',
    name: 'Mae Moh Fluidized Lignite Unit 8',
    location: 'Northern Lignite Belt',
    capacityMW: 350,
    boilerType: 'Circulating Fluidized Bed (CFB)',
    coalType: 'Lignite',
    commissionYear: 2011,
    coolingSystem: 'Wet Cooling Tower',
    baseHeatRateBtuKWh: 10450,
    powerPPAUSDPerMWh: 76.0,
    coalCostUSDPerTon: 48.0,
    carbonTaxUSDPerTon: 35.0,
    plannedCapacityFactorPct: 85,
  }
];

export const INITIAL_LOSS_EVENTS: LossEvent[] = mapRawFailuresToLossEvents(RAW_FAILURE_RECORDS);

export const INITIAL_TELEMETRY: TelemetryReading[] = [
  {
    timestamp: '2026-09-27 21:00:00',
    unitId: 'Unit 4',
    mainSteamTempC: 566.2,
    mainSteamPressureBar: 242.1,
    reheatSteamTempC: 564.8,
    boilerVibrationMmS: 2.8,
    turbineVibrationUm: 48.5,
    flueGasSO2MgNm3: 168.4,
    flueGasNOxMgNm3: 194.2,
    flueGasOpacityPct: 11.2,
    coalFeedRateTph: 245.0,
    pulverizerCurrentAmps: 112.4,
    netOutputMW: 642.0,
    heatRateBtuKWh: 9140,
    anomalyScore: 14,
    anomalyPredictedSubsystem: 'Normal Operation'
  },
  {
    timestamp: '2026-09-27 21:05:00',
    unitId: 'Unit 4',
    mainSteamTempC: 567.0,
    mainSteamPressureBar: 243.5,
    reheatSteamTempC: 565.1,
    boilerVibrationMmS: 3.1,
    turbineVibrationUm: 52.0,
    flueGasSO2MgNm3: 172.0,
    flueGasNOxMgNm3: 198.5,
    flueGasOpacityPct: 12.0,
    coalFeedRateTph: 248.5,
    pulverizerCurrentAmps: 115.1,
    netOutputMW: 645.2,
    heatRateBtuKWh: 9165,
    anomalyScore: 22,
    anomalyPredictedSubsystem: 'Normal Operation'
  },
  {
    timestamp: '2026-09-27 21:10:00',
    unitId: 'Unit 4',
    mainSteamTempC: 568.4,
    mainSteamPressureBar: 244.2,
    reheatSteamTempC: 566.0,
    boilerVibrationMmS: 4.8,
    turbineVibrationUm: 68.3,
    flueGasSO2MgNm3: 185.0,
    flueGasNOxMgNm3: 215.3,
    flueGasOpacityPct: 14.8,
    coalFeedRateTph: 254.1,
    pulverizerCurrentAmps: 128.6,
    netOutputMW: 648.8,
    heatRateBtuKWh: 9240,
    anomalyScore: 68,
    anomalyPredictedSubsystem: 'Pulverizer Mill C & Reheater Tube Stress'
  },
  {
    timestamp: '2026-09-27 21:15:00',
    unitId: 'Unit 4',
    mainSteamTempC: 565.8,
    mainSteamPressureBar: 241.0,
    reheatSteamTempC: 563.2,
    boilerVibrationMmS: 4.2,
    turbineVibrationUm: 62.1,
    flueGasSO2MgNm3: 178.2,
    flueGasNOxMgNm3: 204.0,
    flueGasOpacityPct: 13.5,
    coalFeedRateTph: 250.2,
    pulverizerCurrentAmps: 124.0,
    netOutputMW: 641.5,
    heatRateBtuKWh: 9205,
    anomalyScore: 49,
    anomalyPredictedSubsystem: 'High Ash Slagging Tendency'
  }
];

export const INITIAL_ML_PREDICTIONS: MLRiskPrediction[] = [
  {
    subsystem: 'Boiler Waterwall & Superheater Tubes',
    predictedOutageProbabilityNext30DaysPct: 34.2,
    expectedFinancialImpactUSD: 2450000,
    modelConfidencePct: 91.5,
    riskTrend: 'escalating',
    keyRiskDrivers: [
      'Cumulative thermal cyclic stress (58 cold starts in 18 months)',
      'High gas velocity channeling across secondary superheater bank',
      'Ultrasonic thickness reading at 2.45mm near weld seam J-14'
    ],
    earlyWarningSignals: [
      'Acoustic emission sensor #4 signal amplitude rose 18% in 72h',
      'Flue gas exit differential temperature delta increased 14°C'
    ],
    recommendedProactiveIntervention: 'Execute drone-based ultrasonic thickness survey during scheduled Sunday 40% dispatch low; apply ceramic composite spray barrier.'
  },
  {
    subsystem: 'Pulverizer & Coal Mill Bearings',
    predictedOutageProbabilityNext30DaysPct: 21.8,
    expectedFinancialImpactUSD: 520000,
    modelConfidencePct: 88.0,
    riskTrend: 'stable',
    keyRiskDrivers: [
      'Mill C motor amperage variance spiking during high moisture coal charge (>21%)',
      'Bearing vibration harmonic spectrum showing 2x rotational frequency'
    ],
    earlyWarningSignals: [
      'Lube oil temperature +6°C above baseline operating envelope',
      'Pyrite reject rate tripled over last 5 days'
    ],
    recommendedProactiveIntervention: 'Drain and swap lube oil filter assembly; blend 15% high-HGI dry coal to reduce grinding energy consumption.'
  },
  {
    subsystem: 'Turbine Low-Pressure Section & Seals',
    predictedOutageProbabilityNext30DaysPct: 12.4,
    expectedFinancialImpactUSD: 1680000,
    modelConfidencePct: 86.4,
    riskTrend: 'improving',
    keyRiskDrivers: [
      'Condenser vacuum slight degradation during peak ambient temperature',
      'Moisture droplet erosion on L-0 titanium blade shrouds'
    ],
    earlyWarningSignals: [
      'Condenser backpressure increased from 0.068 bar to 0.082 bar'
    ],
    recommendedProactiveIntervention: 'Clean circulating water debris screens; run condenser tube ball-cleaning system 2x daily.'
  },
  {
    subsystem: 'FGD Absorber & Flue Gas Desulfurization',
    predictedOutageProbabilityNext30DaysPct: 18.6,
    expectedFinancialImpactUSD: 410000,
    modelConfidencePct: 93.1,
    riskTrend: 'stable',
    keyRiskDrivers: [
      'Feed coal sulfur content fluctuating between 0.65% and 1.25%',
      'Recycle pump B mechanical seal wear index at 78%'
    ],
    earlyWarningSignals: [
      'Absorber header pressure dropped 0.2 bar indicating nozzle partial scaling'
    ],
    recommendedProactiveIntervention: 'Switch duty to backup recycle pump C; perform chemical acid wash on header nozzle grid.'
  }
];

/**
 * Generate ML Risk Predictions derived from active operational loss events.
 * Returns an empty array when historicalEvents is empty (cleared workspace state).
 */
export function generateMLPredictionsFromEvents(historicalEvents: LossEvent[]): MLRiskPrediction[] {
  if (!historicalEvents || historicalEvents.length === 0) {
    return [];
  }

  const subsystems = [
    {
      name: 'Boiler Waterwall & Superheater Tubes',
      categoryMatch: ['Boiler Tube Leakage & Pressure Parts', 'Ash Handling & Slagging'],
      defaultProb: 34.2,
      baseImpactUSD: 2450000,
      confidence: 91.5,
      drivers: [
        'Cumulative thermal cyclic stress and sootblower impingement',
        'Gas velocity channeling across reheater / superheater tube banks',
        'Ultrasonic wall thickness degradation near lower waterwall headers'
      ],
      earlyWarning: [
        'Acoustic leak sensor amplitude elevated above dynamic threshold envelope',
        'Differential furnace pressure variance during high load ramp'
      ],
      recommendation: 'Perform ultrasonic wall thickness inspection on next planned dispatch window; adjust sootblower frequency.'
    },
    {
      name: 'Pulverizer & Coal Mill Bearings',
      categoryMatch: ['Coal Mill & Pulverizer Trip', 'Coal Supply Quality Variance & Moisture'],
      defaultProb: 21.8,
      baseImpactUSD: 520000,
      confidence: 88.0,
      drivers: [
        'Pulverizer motor amperage spike during high moisture coal blend',
        'Bearing vibration harmonic spectrum showing elevated 2x running speed peak'
      ],
      earlyWarning: [
        'Lube oil cooler differential temperature departure (+5°C)',
        'Classifier reject rate variation in bowl mill compartment'
      ],
      recommendation: 'Replace primary lube oil cartridge filters and adjust classifier vane angle for uniform fineness.'
    },
    {
      name: 'Turbine Low-Pressure Section & Seals',
      categoryMatch: ['Turbine Vibration & Blade Erosion', 'Grid Curtailment & Generator Trip'],
      defaultProb: 12.4,
      baseImpactUSD: 1680000,
      confidence: 86.4,
      drivers: [
        'Condenser backpressure variance during elevated ambient cooling water temperature',
        'Moisture droplet erosion on titanium rotating blade shrouds'
      ],
      earlyWarning: [
        'Shaft vibration telemetry elevated during synchronizing run-up',
        'Gland steam pressure regulation drift'
      ],
      recommendation: 'Clean intake condenser water screens and verify turbine valve servo calibration limits.'
    },
    {
      name: 'FGD Absorber & Flue Gas Desulfurization',
      categoryMatch: ['FGD / Flue Gas Desulfurization Outage', 'Environmental Emission Exceedance (NOx/SO2/Particulate)'],
      defaultProb: 18.6,
      baseImpactUSD: 410000,
      confidence: 93.1,
      drivers: [
        'Feed coal sulfur content fluctuating with blend variance',
        'Absorber slurry recycle pump impeller cavitation index'
      ],
      earlyWarning: [
        'Spray header differential pressure drop indicating nozzle scaling',
        'Limestone stoichiometry feedback loop hunting'
      ],
      recommendation: 'Rotate duty to standby slurry recycle pump and perform high-pressure chemical wash on header.'
    }
  ];

  return subsystems.map(sub => {
    const matching = historicalEvents.filter(e => 
      sub.categoryMatch.some(cat => 
        (e.category && e.category.toLowerCase().includes(cat.toLowerCase())) || 
        cat.toLowerCase().includes((e.category || '').toLowerCase())
      )
    );

    const matchLossUSD = matching.reduce((sum, e) => sum + e.financialLossUSD, 0);
    const matchHours = matching.reduce((sum, e) => sum + e.forcedOutageHours, 0);
    
    const count = matching.length;
    let prob = sub.defaultProb;
    let trend: 'escalating' | 'stable' | 'improving' = 'stable';

    if (count > 0) {
      prob = Math.min(85, Math.max(8, Number(((count / historicalEvents.length) * 60 + (matchHours > 50 ? 15 : 0)).toFixed(1))));
      trend = count >= 2 ? 'escalating' : 'stable';
    } else {
      prob = Math.max(5, Number((sub.defaultProb * 0.4).toFixed(1)));
      trend = 'improving';
    }

    const impactUSD = matchLossUSD > 0 ? matchLossUSD : sub.baseImpactUSD;

    const actualDrivers = matching.length > 0 
      ? matching.slice(0, 3).map(m => `${m.category}: ${m.rootCause}`)
      : sub.drivers;

    const actualIntervention = matching.length > 0 && matching[0].mitigationActionTaken
      ? `Mitigation based on historical RCA: ${matching[0].mitigationActionTaken}`
      : sub.recommendation;

    return {
      subsystem: sub.name,
      predictedOutageProbabilityNext30DaysPct: prob,
      expectedFinancialImpactUSD: impactUSD,
      modelConfidencePct: sub.confidence,
      riskTrend: trend,
      keyRiskDrivers: actualDrivers,
      earlyWarningSignals: sub.earlyWarning,
      recommendedProactiveIntervention: actualIntervention
    };
  });
}

export function runMonteCarloRiskSimulation(
  plant: PlantConfig, 
  historicalEvents: LossEvent[], 
  iterations = 2500
): MonteCarloOpportunityResult {
  if (!historicalEvents || historicalEvents.length === 0) {
    return {
      percentileP10USD: 0,
      percentileP50USD: 0,
      percentileP90USD: 0,
      annualExpectedForcedOutageHours: 0,
      expectedAnnualLossUSD: 0,
      mlPredictiveSavingsOpportunityUSD: 0,
      heatRateOptimizationOpportunityUSD: 0,
      coalBlendingArbitrageOpportunityUSD: 0,
      totalAnnualNetOpportunityUSD: 0,
      iterations: iterations,
      distributionBuckets: [
        { rangeUSD: `${formatCurrencyIDR(0, { compact: true })} - ${formatCurrencyIDR(200000, { compact: true })}`, frequency: iterations },
        { rangeUSD: `${formatCurrencyIDR(200000, { compact: true })} - ${formatCurrencyIDR(400000, { compact: true })}`, frequency: 0 },
        { rangeUSD: `${formatCurrencyIDR(400000, { compact: true })} - ${formatCurrencyIDR(600000, { compact: true })}`, frequency: 0 },
        { rangeUSD: `${formatCurrencyIDR(600000, { compact: true })} - ${formatCurrencyIDR(800000, { compact: true })}`, frequency: 0 },
        { rangeUSD: `${formatCurrencyIDR(800000, { compact: true })} - ${formatCurrencyIDR(1000000, { compact: true })}`, frequency: 0 },
        { rangeUSD: `${formatCurrencyIDR(1000000, { compact: true })} - ${formatCurrencyIDR(1200000, { compact: true })}`, frequency: 0 },
        { rangeUSD: `${formatCurrencyIDR(1200000, { compact: true })} - ${formatCurrencyIDR(1400000, { compact: true })}`, frequency: 0 },
        { rangeUSD: `${formatCurrencyIDR(1400000, { compact: true })} - ${formatCurrencyIDR(1600000, { compact: true })}`, frequency: 0 },
      ]
    };
  }

  const totalHistoricalLoss = historicalEvents.reduce((acc, curr) => acc + curr.financialLossUSD, 0);
  const totalOutageHours = historicalEvents.reduce((acc, curr) => acc + curr.forcedOutageHours, 0);
  
  // Base parameters from plant capacity and loss events
  const meanEventLoss = historicalEvents.length > 0 ? totalHistoricalLoss / historicalEvents.length : 850000;
  const stdEventLoss = meanEventLoss * 0.45;
  const annualEventFrequencyLambda = Math.max(2, historicalEvents.length); // Poisson frequency

  const simulatedAnnualLosses: number[] = [];
  const simulatedOutageHours: number[] = [];

  for (let i = 0; i < iterations; i++) {
    // Generate Poisson-distributed number of loss events
    let L = Math.exp(-annualEventFrequencyLambda);
    let k = 0;
    let p = 1.0;
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    const eventCount = Math.max(0, k - 1);

    let yearLoss = 0;
    let yearHours = 0;

    for (let e = 0; e < eventCount; e++) {
      // Box-Muller normal distribution for loss
      const u1 = Math.max(0.0001, Math.random());
      const u2 = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const eventLoss = Math.max(50000, meanEventLoss + z * stdEventLoss);
      
      const hoursPerDollar = (totalOutageHours / Math.max(1, totalHistoricalLoss)) || 0.00002;
      const hours = Math.max(4, eventLoss * hoursPerDollar * (0.8 + Math.random() * 0.4));

      yearLoss += eventLoss;
      yearHours += hours;
    }

    simulatedAnnualLosses.push(yearLoss);
    simulatedOutageHours.push(yearHours);
  }

  simulatedAnnualLosses.sort((a, b) => a - b);
  simulatedOutageHours.sort((a, b) => a - b);

  const p10Idx = Math.floor(iterations * 0.10);
  const p50Idx = Math.floor(iterations * 0.50);
  const p90Idx = Math.floor(iterations * 0.90);

  const percentileP10USD = simulatedAnnualLosses[p10Idx];
  const percentileP50USD = simulatedAnnualLosses[p50Idx];
  const percentileP90USD = simulatedAnnualLosses[p90Idx];
  const expectedAnnualLossUSD = simulatedAnnualLosses.reduce((a, b) => a + b, 0) / iterations;
  const annualExpectedForcedOutageHours = Math.round(simulatedOutageHours.reduce((a, b) => a + b, 0) / iterations);

  // Opportunity Quantifications
  // 1. ML Predictive maintenance saves 42% of preventable forced outages
  const preventableRatio = historicalEvents.filter(e => e.preventableWithML).length / Math.max(1, historicalEvents.length);
  const mlPredictiveSavingsOpportunityUSD = Math.round(expectedAnnualLossUSD * preventableRatio * 0.42);

  // 2. Heat rate optimization: 1% heat rate improvement on plant capacity
  // Annual generation MWh = capacityMW * 8760 * plannedCapacityFactorPct / 100
  const annualGenMWh = plant.capacityMW * 8760 * (plant.plannedCapacityFactorPct / 100);
  // Heat rate reduction by 75 Btu/kWh translates into fuel savings
  const fuelTonsPerYear = (annualGenMWh * 1000 * (plant.baseHeatRateBtuKWh / 1000000)) / 22; // rough metric tons
  const heatRateOptimizationOpportunityUSD = Math.round(fuelTonsPerYear * 0.012 * plant.coalCostUSDPerTon);

  // 3. Coal blending arbitrage: optimal blend saves ~$1.80/ton on fuel mix
  const coalBlendingArbitrageOpportunityUSD = Math.round(fuelTonsPerYear * 1.85);

  const totalAnnualNetOpportunityUSD = mlPredictiveSavingsOpportunityUSD + heatRateOptimizationOpportunityUSD + coalBlendingArbitrageOpportunityUSD;

  // Distribution buckets for charting
  const bucketCount = 8;
  const minLoss = simulatedAnnualLosses[0];
  const maxLoss = simulatedAnnualLosses[simulatedAnnualLosses.length - 1];
  const step = (maxLoss - minLoss) / bucketCount;

  const distributionBuckets: { rangeUSD: string; frequency: number }[] = [];
  for (let b = 0; b < bucketCount; b++) {
    const bStart = minLoss + b * step;
    const bEnd = bStart + step;
    const count = simulatedAnnualLosses.filter(val => val >= bStart && (b === bucketCount - 1 ? val <= bEnd : val < bEnd)).length;
    distributionBuckets.push({
      rangeUSD: `${formatCurrencyIDR(bStart, { compact: true, decimals: 1 })} - ${formatCurrencyIDR(bEnd, { compact: true, decimals: 1 })}`,
      frequency: count,
    });
  }

  return {
    percentileP10USD: Math.round(percentileP10USD),
    percentileP50USD: Math.round(percentileP50USD),
    percentileP90USD: Math.round(percentileP90USD),
    annualExpectedForcedOutageHours,
    expectedAnnualLossUSD: Math.round(expectedAnnualLossUSD),
    mlPredictiveSavingsOpportunityUSD,
    heatRateOptimizationOpportunityUSD,
    coalBlendingArbitrageOpportunityUSD,
    totalAnnualNetOpportunityUSD,
    iterations,
    distributionBuckets
  };
}
