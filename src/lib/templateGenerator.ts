import * as XLSX from 'xlsx';

// Sample row matching Failure Data specification
export const SAMPLE_FAILURE_DATA = [
  {
    timestamp_start: '16 Jan 2025 08:22',
    unit_status: 'FO',
    asset_number: 'TRHN-TU-30-MAG10',
    root_cause_failure_analysis: 'Turbine trip exhaust pressure high-high auxiliary steam leak',
    failure_cause_code: '3832 Auxiliary steam valves - Auxiliary Systems - Balance of Plant',
    failure_mode: 'F060 Broken',
    mitigation: 'Normalized pressure on auxiliary steam followed by re-firing',
    power_gross_realization: 0,
    power_net_realization: 0,
    failure_impact: 'Tripped',
    loss_output_mw: 100.0,
    timestamp_stop: '16 Jan 2025 10:46',
    failure_duration_hour_minute: '0 2:24',
    failure_duration_hours: 2.4,
    loss_output_mwh: 240.0,
    unit_no: 'Unit 3'
  },
  {
    timestamp_start: '08 Feb 2025 09:00',
    unit_status: 'FO',
    asset_number: 'TRHN-TU-40-HBK10',
    root_cause_failure_analysis: 'Bed material overflow from ash screw cooler triggering flameout',
    failure_cause_code: '950 Other bed material system problems - Bed Material Removal System - Boiler',
    failure_mode: 'F460 Flameout',
    mitigation: 'Cleaned bed material line and repaired valve seal on ash screw cooler',
    power_gross_realization: 0,
    power_net_realization: 0,
    failure_impact: 'Stopped',
    loss_output_mw: 100.0,
    timestamp_stop: '11 Feb 2025 17:04',
    failure_duration_hour_minute: '3 16:07',
    failure_duration_hours: 88.12,
    loss_output_mwh: 8811.67,
    unit_no: 'Unit 4'
  },
  {
    timestamp_start: '15 Mar 2025 03:51',
    unit_status: 'FD',
    asset_number: 'TRHN-TU-40-HAH11AA001',
    root_cause_failure_analysis: 'Desuperheater Control Valve calibration failure hunting during load ramp',
    failure_cause_code: '590 Desuperheater/attemperator valves - Boiler Piping System - Boiler',
    failure_mode: 'F090 Calibration, not within limits',
    mitigation: 'Recalibrated and serviced Control Valve Desuperheater 1 and 2 actuator',
    power_gross_realization: 87.38,
    power_net_realization: 77.88,
    failure_impact: 'Derating',
    loss_output_mw: 12.62,
    timestamp_stop: '15 Mar 2025 11:06',
    failure_duration_hour_minute: '0 7:15',
    failure_duration_hours: 7.25,
    loss_output_mwh: 91.50,
    unit_no: 'Unit 4'
  }
];

// Sample row matching Business Data specification
export const SAMPLE_BUSINESS_DATA = [
  {
    end_of_month: 'Jan-25',
    unit: 'Unit 3',
    kwh_produksi_kwh: 69150207,
    kwh_terima_kwh: 7887,
    kwh_kirim_kwh: 61537402,
    totalizer_uat_kwh: 7224300,
    pemakaian_dari_pln_distribusi_kwh: 18906,
    ps_gi_kwh: 7867,
    susut_trafo_kwh: 380638,
    kwh_netto_penjualan_kwh: 61545269,
    ps_pemakaiansendiri_plus_susuttrafo_pct: 10.99,
    ph_periodehours_jam: 744,
    sh_servicehours_jam: 741.6,
    foh_forcedoutagehours_jam: 2.4,
    poh_plannedoutagehours_jam: 0,
    moh_maintenanceoutagehours_jam: 0,
    rsh_reserveshutdownhours_jam: 0,
    ah_availablehours_jam: 741.6,
    af_availibilityfactor_pct: 99.68,
    eaf_equivalentavailibilityfactor_pct: 98.64,
    fof_forcedoutagefactor_pct: 0.32,
    for_forcedoutagerate_pct: 0.32,
    efor_equivalentforcedoutagerate_pct: 1.36,
    ncf_netcapacityfactor_pct: 97.32,
    pemakaian_bahan_bakar_batubara_kg: 36967080,
    nilai_kalor_batubara_kcal_kg: 4934,
    gross_plant_heat_rate_kcal_kwh: 2661,
    net_plant_heat_rate_kcal_kwh: 2990,
    rencana_produksi_kwh: 70680000,
    rencana_penjualan_kwh: 62763840
  },
  {
    end_of_month: 'Jan-25',
    unit: 'Unit 4',
    kwh_produksi_kwh: 68683321,
    kwh_terima_kwh: 24059,
    kwh_kirim_kwh: 61011859,
    totalizer_uat_kwh: 7287600,
    pemakaian_dari_pln_distribusi_kwh: 18906,
    ps_gi_kwh: 7800,
    susut_trafo_kwh: 376062,
    kwh_netto_penjualan_kwh: 61019659,
    ps_pemakaiansendiri_plus_susuttrafo_pct: 11.15,
    ph_periodehours_jam: 744,
    sh_servicehours_jam: 744.0,
    foh_forcedoutagehours_jam: 0,
    poh_plannedoutagehours_jam: 0,
    moh_maintenanceoutagehours_jam: 0,
    rsh_reserveshutdownhours_jam: 0,
    ah_availablehours_jam: 744.0,
    af_availibilityfactor_pct: 100.0,
    eaf_equivalentavailibilityfactor_pct: 99.90,
    fof_forcedoutagefactor_pct: 0,
    for_forcedoutagerate_pct: 0,
    efor_equivalentforcedoutagerate_pct: 0.08,
    ncf_netcapacityfactor_pct: 96.49,
    pemakaian_bahan_bakar_batubara_kg: 37355720,
    nilai_kalor_batubara_kcal_kg: 4934,
    gross_plant_heat_rate_kcal_kwh: 2701,
    net_plant_heat_rate_kcal_kwh: 3040,
    rencana_produksi_kwh: 70680000,
    rencana_penjualan_kwh: 62763840
  }
];

/**
 * Trigger client-side Excel download via SheetJS
 */
export function downloadExcelTemplate(type: 'failure' | 'business') {
  const data = type === 'failure' ? SAMPLE_FAILURE_DATA : SAMPLE_BUSINESS_DATA;
  const fileName = type === 'failure' ? 'Failure_Data_Template.xlsx' : 'Business_Data_Template.xlsx';
  const sheetName = type === 'failure' ? 'Failure_Data' : 'Business_Data';

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
}

/**
 * Trigger client-side CSV download
 */
export function downloadCsvTemplate(type: 'failure' | 'business') {
  const data = type === 'failure' ? SAMPLE_FAILURE_DATA : SAMPLE_BUSINESS_DATA;
  const fileName = type === 'failure' ? 'Failure_Data_Template.csv' : 'Business_Data_Template.csv';
  
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(item => 
    headers.map(h => {
      const val = (item as any)[h];
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val ?? '';
    }).join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
