import React, { useState } from 'react';
import { 
  Database, 
  FileSpreadsheet, 
  Activity, 
  Calendar, 
  Zap, 
  Flame, 
  HelpCircle, 
  TrendingDown, 
  TrendingUp, 
  Search,
  Filter,
  CheckCircle,
  Clock,
  Layers,
  BarChart2,
  Upload,
  Download,
  ChevronDown,
  FileCode,
  Trash2
} from 'lucide-react';
import { 
  STATUS_DESCRIPTIONS, 
  RAW_BUSINESS_RECORDS, 
  RAW_FAILURE_RECORDS 
} from '../data/plantDataset';
import { RawBusinessData, RawFailureData, RawStatusDesc } from '../types/datasetTypes';
import { downloadExcelTemplate, downloadCsvTemplate } from '../lib/templateGenerator';
import { DataUploadReviewModal } from './DataUploadReviewModal';
import { ClearDataConfirmModal } from './ClearDataConfirmModal';
import { 
  formatCurrencyIDR, 
  formatNumberID, 
  formatHoursID, 
  formatMWhID, 
  formatTimestampID, 
  formatDateID,
  formatMonthYearID
} from '../lib/formatters';

interface DataSourceExplorerViewProps {
  onDataCommitted?: (type: 'failure' | 'business', count: number, records?: any[]) => void;
  onDataCleared?: () => void;
  onRestoreDemo?: () => void;
  failures?: RawFailureData[];
  businessData?: RawBusinessData[];
}

export const DataSourceExplorerView: React.FC<DataSourceExplorerViewProps> = ({ 
  onDataCommitted,
  onDataCleared,
  onRestoreDemo,
  failures = RAW_FAILURE_RECORDS,
  businessData = RAW_BUSINESS_RECORDS
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'failures' | 'business' | 'status'>('failures');
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState<'All' | 'Unit 3' | 'Unit 4'>('All');
  const [impactFilter, setImpactFilter] = useState<string>('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // Filtered failure data
  const filteredFailures = failures.filter(f => {
    const matchesSearch = 
      f.root_cause_failure_analysis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.failure_cause_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.unit_status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.asset_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = unitFilter === 'All' || f.unit_no === unitFilter;
    const matchesImpact = impactFilter === 'All' || f.failure_impact.toLowerCase().includes(impactFilter.toLowerCase());
    return matchesSearch && matchesUnit && matchesImpact;
  });

  // Filtered business data
  const filteredBusiness = businessData.filter(b => {
    const matchesSearch = 
      b.end_of_month.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.unit.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = unitFilter === 'All' || b.unit === unitFilter;
    return matchesSearch && matchesUnit;
  });

  // Filtered status descriptions
  const filteredStatuses = STATUS_DESCRIPTIONS.filter(s => 
    s.status_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.event_status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Business aggregations
  const totalGenMWh = Math.round(businessData.reduce((sum, b) => sum + b.kwh_produksi_kwh, 0) / 1000);
  const totalForcedOutageHours = Math.round(businessData.reduce((sum, b) => sum + b.foh_forcedoutagehours_jam, 0));
  const validHeatRates = businessData.filter(b => b.net_plant_heat_rate_kcal_kwh > 0);
  const avgNPHR = validHeatRates.length > 0
    ? Math.round(validHeatRates.reduce((sum, b) => sum + b.net_plant_heat_rate_kcal_kwh, 0) / validHeatRates.length)
    : 0;
  const totalCoalTons = Math.round(businessData.reduce((sum, b) => sum + b.pemakaian_bahan_bakar_batubara_kg, 0) / 1000);

  const handleCommitted = (type: 'failure' | 'business', count: number, records?: any[]) => {
    setUploadNotice(`Successfully committed ${count} ${type === 'failure' ? 'Failure Outage' : 'Monthly Business'} records into Firestore database collection.`);
    if (onDataCommitted) {
      onDataCommitted(type, count, records);
    }
    setTimeout(() => {
      setUploadNotice(null);
    }, 7000);
  };

  const handleCleared = () => {
    setUploadNotice('All plant failure events, monthly business metrics, and risk simulations have been cleared.');
    if (onDataCleared) {
      onDataCleared();
    }
    setTimeout(() => {
      setUploadNotice(null);
    }, 7000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Upload & Template Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold uppercase tracking-wider">
                Industrial Ground Truth
              </span>
              <span className="text-xs text-slate-400">Tarahan CFB Coal Power Station (Unit 3 & 4)</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-amber-400" />
              Plant Operational Data Sources & Status Taxonomy
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Grounded in official plant operation journals: <strong>Failure Data.csv</strong> (outages, RCFA, cause codes), 
              <strong>Business Data.csv</strong> (generation, heat rates NPHR/GPHR, EFOR), and 
              <strong>Status Description.csv</strong> (NERC/IEEE operational taxonomy).
            </p>
          </div>

          {/* Action Button Group */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Clear Data Button */}
            <button
              onClick={() => setIsClearModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-700/50 text-xs font-semibold transition-all"
              title="Clear all uploaded data and reset workspace"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Clear Data</span>
            </button>

            {/* Upload Button */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-900/30"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Monthly Data (.xlsx / .csv)</span>
            </button>

            {/* Download Templates Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all shadow-sm"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download Templates</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isTemplateDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Microsoft Excel (.xlsx) Templates
                  </div>
                  <button
                    onClick={() => { downloadExcelTemplate('failure'); setIsTemplateDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-amber-400 flex items-center justify-between transition-colors"
                  >
                    <span>Failure Data Template</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">.XLSX</span>
                  </button>
                  <button
                    onClick={() => { downloadExcelTemplate('business'); setIsTemplateDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-amber-400 flex items-center justify-between transition-colors"
                  >
                    <span>Business Data Template</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">.XLSX</span>
                  </button>

                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-b border-slate-800 mt-1">
                    Delimited CSV (.csv) Templates
                  </div>
                  <button
                    onClick={() => { downloadCsvTemplate('failure'); setIsTemplateDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-amber-400 flex items-center justify-between transition-colors"
                  >
                    <span>Failure Data Template</span>
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold">.CSV</span>
                  </button>
                  <button
                    onClick={() => { downloadCsvTemplate('business'); setIsTemplateDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-amber-400 flex items-center justify-between transition-colors"
                  >
                    <span>Business Data Template</span>
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold">.CSV</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {uploadNotice && (
          <div className="mt-4 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              {uploadNotice}
            </span>
          </div>
        )}

        {/* Global Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400">Total Generation (MWh)</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">{formatMWhID(totalGenMWh)}</div>
            <div className="text-[10px] text-slate-500">Unit 3 & Unit 4 Netto</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400">Forced Outage Hours</div>
            <div className="text-xl font-bold text-red-400 font-mono">{formatHoursID(totalForcedOutageHours)}</div>
            <div className="text-[10px] text-slate-500">EFOR Risk Exposure</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400">Mean Net Plant Heat Rate</div>
            <div className="text-xl font-bold text-amber-400 font-mono">{formatNumberID(avgNPHR)} kcal/kWh</div>
            <div className="text-[10px] text-slate-500">Thermal Efficiency</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400">Total Coal Ingested</div>
            <div className="text-xl font-bold text-cyan-400 font-mono">{formatNumberID(totalCoalTons)} Ton</div>
            <div className="text-[10px] text-slate-500">PTBA & Biomass blend</div>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center space-x-2 mt-5">
          <button
            onClick={() => setActiveSubTab('failures')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'failures'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Failure Data ({failures.length})
          </button>
          <button
            onClick={() => setActiveSubTab('business')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'business'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Business Data ({businessData.length})
          </button>
          <button
            onClick={() => setActiveSubTab('status')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'status'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            NERC/IEEE Status Dictionary ({STATUS_DESCRIPTIONS.length} Standard Codes)
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3.5">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search RCFA, cause code, asset number, status code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Filter Unit:</span>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1"
            >
              <option value="All">All Units (Unit 3 & 4)</option>
              <option value="Unit 3">Unit 3</option>
              <option value="Unit 4">Unit 4</option>
            </select>
          </div>

          {activeSubTab === 'failures' && (
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Failure Impact:</span>
              <select
                value={impactFilter}
                onChange={(e) => setImpactFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1"
              >
                <option value="All">All Impacts</option>
                <option value="Tripped">Tripped</option>
                <option value="Stopped">Stopped</option>
                <option value="Derating">Derating</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 1. Failure Data Tab */}
      {activeSubTab === 'failures' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Failure Data (Outage & Derating Log with RCFA)
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredFailures.length} of {failures.length} events
            </span>
          </div>

          {failures.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-white">No Failure Records Loaded</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All previous failure data was cleared. Click "Upload Monthly Data" to upload your fresh .xlsx or .csv dataset.
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Upload Failure Data (.xlsx / .csv)
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-3.5 py-2.5">Date & Unit</th>
                    <th className="px-3.5 py-2.5">Status</th>
                    <th className="px-3.5 py-2.5">Asset / Equipment</th>
                    <th className="px-3.5 py-2.5">Root Cause Failure Analysis (RCFA)</th>
                    <th className="px-3.5 py-2.5">Cause Code & Mode</th>
                    <th className="px-3.5 py-2.5">Duration</th>
                    <th className="px-3.5 py-2.5">Lost MWh</th>
                    <th className="px-3.5 py-2.5">Financial Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 text-[11px]">
                  {filteredFailures.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-3.5 py-2 whitespace-nowrap">
                        <div className="font-semibold text-white">{formatTimestampID(row.timestamp_start)}</div>
                        <div className="text-[10px] text-amber-400 font-mono">{row.unit_no}</div>
                      </td>

                      <td className="px-3.5 py-2 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          row.unit_status.startsWith('FO') ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          row.unit_status.startsWith('PO') ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                          row.unit_status.startsWith('MO') ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {row.unit_status}
                        </span>
                        <div className="text-[9px] text-slate-400 mt-0.5">{row.failure_impact}</div>
                      </td>

                      <td className="px-3.5 py-2 max-w-[140px] truncate font-mono text-[10px] text-slate-300" title={row.asset_number}>
                        {row.asset_number || 'General System'}
                      </td>

                      <td className="px-3.5 py-2 max-w-xs">
                        <div className="font-medium text-slate-100 line-clamp-2" title={row.root_cause_failure_analysis}>
                          {row.root_cause_failure_analysis}
                        </div>
                        <div className="text-[10px] text-emerald-400 italic line-clamp-1 mt-0.5">
                          ↳ Action: {row.mitigation}
                        </div>
                      </td>

                      <td className="px-3.5 py-2 max-w-xs text-slate-400 line-clamp-2" title={row.failure_cause_code}>
                        <div>{row.failure_cause_code}</div>
                        <div className="text-[10px] text-cyan-400 font-mono">{row.failure_mode}</div>
                      </td>

                      <td className="px-3.5 py-2 whitespace-nowrap font-mono font-semibold text-amber-300">
                        {formatHoursID(row.failure_duration_hours)}
                      </td>

                      <td className="px-3.5 py-2 whitespace-nowrap font-mono text-slate-200">
                        {formatMWhID(row.loss_output_mwh)}
                      </td>

                      <td className="px-3.5 py-2 whitespace-nowrap font-mono font-bold text-red-400">
                        {formatCurrencyIDR(row.financialLossUSD)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. Business Data Tab */}
      {activeSubTab === 'business' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Monthly Business Realization & Heat Rate Balance (Business Data.csv)
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {filteredBusiness.length} Reporting Months
            </span>
          </div>

          {businessData.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-white">No Business Records Loaded</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                All business records were cleared. Click "Upload Monthly Data" and select "Business Data (Monthly)" to upload your fresh dataset.
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Upload Business Data (.xlsx / .csv)
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-3.5 py-2.5">Month</th>
                    <th className="px-3.5 py-2.5">Unit</th>
                    <th className="px-3.5 py-2.5">Gross Gen (kWh)</th>
                    <th className="px-3.5 py-2.5">Net Sales (kWh)</th>
                    <th className="px-3.5 py-2.5">EAF (%)</th>
                    <th className="px-3.5 py-2.5">EFOR (%)</th>
                    <th className="px-3.5 py-2.5">FOH (hrs)</th>
                    <th className="px-3.5 py-2.5">Coal Burn (kg)</th>
                    <th className="px-3.5 py-2.5">Net Heat Rate (kcal/kWh)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 text-[11px]">
                  {filteredBusiness.map((b, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-3.5 py-2 whitespace-nowrap font-bold text-white font-mono">{formatMonthYearID(b.end_of_month)}</td>
                      <td className="px-3.5 py-2 whitespace-nowrap text-amber-400 font-mono">{b.unit}</td>
                      <td className="px-3.5 py-2 whitespace-nowrap font-mono">{formatNumberID(b.kwh_produksi_kwh)}</td>
                      <td className="px-3.5 py-2 whitespace-nowrap font-mono text-emerald-400">{formatNumberID(b.kwh_netto_penjualan_kwh)}</td>
                      <td className="px-3.5 py-2 whitespace-nowrap font-mono font-semibold text-cyan-400">{formatNumberID(b.eaf_equivalentavailibilityfactor_pct, 1)}%</td>
                      <td className={`px-3.5 py-2 whitespace-nowrap font-mono font-bold ${b.efor_equivalentforcedoutagerate_pct > 10 ? 'text-red-400' : 'text-slate-300'}`}>
                        {formatNumberID(b.efor_equivalentforcedoutagerate_pct, 2)}%
                      </td>
                      <td className="px-3.5 py-2 whitespace-nowrap font-mono text-amber-300">{formatHoursID(b.foh_forcedoutagehours_jam)}</td>
                      <td className="px-3.5 py-2 whitespace-nowrap font-mono text-slate-400">{formatNumberID(Math.round(b.pemakaian_bahan_bakar_batubara_kg / 1000))} Ton</td>
                      <td className="px-3.5 py-2 whitespace-nowrap font-mono font-semibold text-amber-400">
                        {b.net_plant_heat_rate_kcal_kwh > 0 ? `${formatNumberID(b.net_plant_heat_rate_kcal_kwh, 0)} kcal` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. Status Description Taxonomy */}
      {activeSubTab === 'status' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Unit Status Codes & NERC Operational Outage Taxonomy (Status Description.csv)
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {filteredStatuses.length} Definitions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {filteredStatuses.map((s, idx) => (
              <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 space-y-1.5 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {s.status_code}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{s.meaning}</span>
                </div>
                <div className="text-xs font-semibold text-white">{s.event_status}</div>
                <p className="text-[11px] text-slate-400 leading-snug">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Upload Review Modal */}
      <DataUploadReviewModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDataCommitted={handleCommitted}
      />

      {/* Clear Data Confirmation Modal */}
      <ClearDataConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onCleared={handleCleared}
        onRestoreDemo={onRestoreDemo}
      />

    </div>
  );
};
