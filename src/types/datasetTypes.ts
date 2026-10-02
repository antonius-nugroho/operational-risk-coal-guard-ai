export interface RawStatusDesc {
  status_code: string;
  meaning: string;
  event_status: string;
  description: string;
}

export interface RawBusinessData {
  end_of_month: string;
  unit: string;
  kwh_produksi_kwh: number;
  kwh_terima_kwh: number;
  kwh_kirim_kwh: number;
  totalizer_uat_kwh: number;
  kwh_netto_penjualan_kwh: number;
  ps_pemakaiansendiri_plus_susuttrafo_pct: number;
  ph_periodehours_jam: number;
  sh_servicehours_jam: number;
  foh_forcedoutagehours_jam: number;
  poh_plannedoutagehours_jam: number;
  moh_maintenanceoutagehours_jam: number;
  rsh_reserveshutdownhours_jam: number;
  ah_availablehours_jam: number;
  af_availibilityfactor_pct: number;
  eaf_equivalentavailibilityfactor_pct: number;
  fof_forcedoutagefactor_pct: number;
  for_forcedoutagerate_pct: number;
  efor_equivalentforcedoutagerate_pct: number;
  ncf_netcapacityfactor_pct: number;
  pemakaian_bahan_bakar_batubara_kg: number;
  nilai_kalor_batubara_kcal_kg: number;
  gross_plant_heat_rate_kcal_kwh: number;
  net_plant_heat_rate_kcal_kwh: number;
  rencana_produksi_kwh: number;
  rencana_penjualan_kwh: number;
}

export interface RawFailureData {
  id: string;
  timestamp_start: string;
  unit_status: string;
  asset_number: string;
  root_cause_failure_analysis: string;
  failure_cause_code: string;
  failure_mode: string;
  mitigation: string;
  power_gross_realization: number;
  power_net_realization: number;
  failure_impact: 'Trip' | 'Tripped' | 'Stop' | 'Stopped' | 'Derating' | string;
  loss_output_mw: number;
  timestamp_stop: string;
  failure_duration_hour_minute: string;
  failure_duration_hours: number;
  loss_output_mwh: number;
  unit_no: string;
  // enriched risk properties
  financialLossUSD: number;
  category: string;
  preventableWithML: boolean;
  severity: 'Low' | 'Medium' | 'High' | 'Catastrophic';
  detectedBy: 'Acoustic Leak Sensor' | 'Vibration Telemetry' | 'Pyrometer/Thermal' | 'Operator Inspection' | 'BigQuery Anomaly Model';
}
