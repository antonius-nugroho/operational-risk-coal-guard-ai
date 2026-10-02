export interface FailureDataRow {
  id: string;
  timestampStart: string;
  timestampStop: string;
  unitNo: string;
  unitStatus: string;
  unitStatusDescription: string;
  unitStatusMeaning: string;
  assetNumber: string;
  rcfa: string;
  failureCauseCode: string;
  failureMode: string;
  mitigation: string;
  powerGrossMW: number;
  powerNetMW: number;
  failureImpact: 'Tripped' | 'Stopped' | 'Derating';
  lossOutputMW: number;
  durationHours: number;
  lossOutputMWh: number;
  estimatedFinancialLossUSD: number;
  category: 'Boiler Tube Leakage & Pressure Parts'
    | 'Coal Feeder & Bunker Fuel Supply'
    | 'Turbine Auxiliary & Valves'
    | 'Generator & Electrical Exciter'
    | 'Fans & Gas System (PA/SA/IDF)'
    | 'Circulating Water & Feedwater System'
    | 'Grid Dispatcher Curtailment (Non-Curtailing)'
    | 'Planned / Overhaul Outage'
    | 'Ash Handling & Bed Material'
    | 'Other Operational Event';
  preventableWithML: boolean;
}

export interface BusinessDataMetric {
  endOfMonth: string;
  unit: string;
  kwhProduksi: number;
  kwhNettoPenjualan: number;
  serviceHours: number;
  forcedOutageHours: number;
  plannedOutageHours: number;
  forcedDeratingHours: number;
  availabilityFactorPct: number;
  equivalentAvailabilityFactorPct: number;
  equivalentForcedOutageRatePct: number;
  netCapacityFactorPct: number;
  coalUsageKg: number;
  coalCalorificKcalKg: number;
  biomassUsageKg: number;
  biomassCalorificKcalKg: number;
  grossPlantHeatRateKcalKwh: number;
  netPlantHeatRateKcalKwh: number;
  internalDisturbancesCount: number;
  externalDisturbancesCount: number;
}
