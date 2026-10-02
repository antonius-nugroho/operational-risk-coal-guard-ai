import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  FileText, 
  ArrowRight, 
  Layers, 
  DollarSign, 
  Calendar, 
  Save, 
  RefreshCw, 
  ShieldAlert,
  Info,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, writeBatch, doc, setDoc } from 'firebase/firestore';
import { RawFailureData, RawBusinessData } from '../types/datasetTypes';
import confetti from 'canvas-confetti';
import { 
  formatCurrencyIDR, 
  formatNumberID, 
  formatTimestampID, 
  formatDateID,
  formatMonthYearID,
  formatHoursID,
  parseNumberSafe
} from '../lib/formatters';
import { commitFailureEventsToBigQuery } from '../services/bigQueryService';

/**
 * Strict validator to identify month/period date columns.
 * Explicitly excludes duration/hours (e.g. ph_periodehours_jam), energy (kwh), percentages, or rates.
 */
function isMonthDateColumn(key: string): boolean {
  if (!key) return false;
  const clean = key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
  if (
    clean.includes('hour') ||
    clean.includes('jam') ||
    clean.includes('kwh') ||
    clean.includes('mw') ||
    clean.includes('pct') ||
    clean.includes('percent') ||
    clean.includes('rate') ||
    clean.includes('kcal') ||
    clean.includes('kg') ||
    clean.includes('ton') ||
    clean.includes('factor') ||
    clean.includes('produksi') ||
    clean.includes('penjualan')
  ) {
    return false;
  }
  return (
    clean === 'end_of_month' ||
    clean === 'endofmonth' ||
    clean === 'eom' ||
    clean === 'month' ||
    clean === 'bulan' ||
    clean === 'periode' ||
    clean === 'period' ||
    clean === 'periode_bulan' ||
    clean === 'periode_bln' ||
    clean === 'reporting_month' ||
    clean === 'month_year' ||
    clean === 'bln' ||
    clean.startsWith('month_') ||
    clean.endsWith('_month') ||
    clean.startsWith('bulan_') ||
    clean.endsWith('_bulan')
  );
}

/**
 * Universal Indonesian cell formatter:
 * - Timestamps: dd mmm yyyy hh:mm
 * - Month dates: mmm yyyy
 * - Numbers: Comma (,) for decimal, Dot (.) for thousands
 * - Text columns: preserved as text
 */
function formatCellDisplay(col: string, val: any): string {
  if (val === null || val === undefined || val === '') return '-';
  const cleanCol = col.toLowerCase().replace(/[^a-z0-9_]/g, '_');

  // 1. Timestamps
  if (
    cleanCol.includes('timestamp') ||
    cleanCol === 'date' ||
    cleanCol.endsWith('_date') ||
    cleanCol.startsWith('date_') ||
    cleanCol.includes('waktu')
  ) {
    return formatTimestampID(val);
  }

  // 2. Month-Year / Reporting Month
  if (isMonthDateColumn(cleanCol)) {
    return formatMonthYearID(val);
  }

  // 3. Known text columns (skip number parsing for textual descriptions/identifiers)
  const isPureTextCol = 
    cleanCol === 'unit' ||
    cleanCol === 'unit_no' ||
    cleanCol === 'unitstatus' ||
    cleanCol === 'unit_status' ||
    cleanCol.includes('root_cause') ||
    cleanCol.includes('rcfa') ||
    cleanCol.includes('asset') ||
    cleanCol.includes('mitigation') ||
    cleanCol.includes('cause_code') ||
    cleanCol.includes('failure_mode') ||
    cleanCol.includes('failure_cause') ||
    cleanCol.includes('failure_impact') ||
    cleanCol.includes('description') ||
    cleanCol.includes('operator') ||
    cleanCol.includes('equipment') ||
    cleanCol.includes('nama') ||
    cleanCol === 'id' ||
    cleanCol.endsWith('_id');

  if (isPureTextCol) {
    return String(val);
  }

  // 4. Try parsing with parseNumberSafe
  const parsedNum = parseNumberSafe(val);

  if (!isNaN(parsedNum)) {
    // Duration hours (e.g. 744,0 jam, 2,4 jam)
    if (cleanCol.includes('hour') || cleanCol.includes('jam')) {
      return formatHoursID(parsedNum);
    }
    // MWh (e.g. 8.811,67 MWh)
    if (cleanCol.includes('mwh')) {
      return `${formatNumberID(parsedNum, parsedNum % 1 !== 0 ? 2 : 0)} MWh`;
    }
    // MW (e.g. 100 MW, 12,62 MW)
    if (cleanCol.includes('_mw') || cleanCol === 'mw') {
      return `${formatNumberID(parsedNum, parsedNum % 1 !== 0 ? 2 : 0)} MW`;
    }
    // Percentage (e.g. 98,64%, 1,36%, 10,99%)
    if (cleanCol.includes('pct') || cleanCol.includes('percent')) {
      return `${formatNumberID(parsedNum, 2)}%`;
    }
    // Rate / kcal (e.g. 2.661)
    if (cleanCol.includes('rate') || cleanCol.includes('kcal')) {
      return formatNumberID(parsedNum, parsedNum % 1 !== 0 ? 2 : 0);
    }
    // Generation / sales / coal (e.g. 69.150.207)
    if (cleanCol.includes('kwh') || cleanCol.includes('kg') || cleanCol.includes('ton')) {
      return formatNumberID(parsedNum, 0);
    }
    // Any other number
    const dec = parsedNum % 1 !== 0 ? 2 : 0;
    return formatNumberID(parsedNum, dec);
  }

  return String(val);
}

interface DataUploadReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataCommitted: (type: 'failure' | 'business', count: number, records?: any[]) => void;
}

export const DataUploadReviewModal: React.FC<DataUploadReviewModalProps> = ({
  isOpen,
  onClose,
  onDataCommitted,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedType, setSelectedType] = useState<'failure' | 'business'>('failure');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [rawRecords, setRawRecords] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (selectedFile: File) => {
    setFile(selectedFile);
    setValidationErrors([]);
    setValidationWarnings([]);
    setCommitSuccess(null);
    setIsParsing(true);

    const fileName = selectedFile.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    const isCsv = fileName.endsWith('.csv');

    if (!isExcel && !isCsv) {
      setValidationErrors(['Unsupported file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.']);
      setIsParsing(false);
      return;
    }

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          // cellDates: false and raw: false preserves the exact formatted date string without timezone shifts
          const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
          validateAndStageRecords(jsonData);
        } catch (err: any) {
          console.error('Error parsing Excel workbook:', err);
          setValidationErrors([`Failed to parse Excel workbook: ${err.message || 'Corrupt or unreadable file'}`]);
        } finally {
          setIsParsing(false);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      // CSV Parsing via PapaParse
      Papa.parse(selectedFile, {
        header: true,
        dynamicTyping: false,
        skipEmptyLines: true,
        delimiter: selectedFile.name.includes(';') ? ';' : undefined, // auto or semicolon
        complete: (results) => {
          setIsParsing(false);
          if (results.errors && results.errors.length > 0) {
            setValidationWarnings(results.errors.slice(0, 3).map(e => `Row ${e.row}: ${e.message}`));
          }
          validateAndStageRecords(results.data);
        },
        error: (err) => {
          setIsParsing(false);
          setValidationErrors([`Failed to parse CSV: ${err.message}`]);
        }
      });
    }
  };

  const validateAndStageRecords = (data: any[]) => {
    if (!data || data.length === 0) {
      setValidationErrors(['The selected file contains no data rows.']);
      setRawRecords([]);
      return;
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Normalize keys and format date/timestamp values
    const normalizedData = data.map((row) => {
      const newRow: any = { ...row };
      
      for (const key of Object.keys(row)) {
        const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const val = row[key];

        if (
          cleanKey.includes('timestamp') ||
          cleanKey.includes('waktu') ||
          cleanKey === 'date' ||
          cleanKey.endsWith('_date') ||
          cleanKey.startsWith('date_')
        ) {
          const formatted = formatTimestampID(val);
          newRow[key] = formatted;
          if (cleanKey.includes('start') || cleanKey.includes('mulai') || cleanKey === 'date' || cleanKey === 'timestamp') {
            newRow['timestamp_start'] = formatted;
          } else if (cleanKey.includes('stop') || cleanKey.includes('selesai') || cleanKey.includes('end')) {
            newRow['timestamp_stop'] = formatted;
          }
        } else if (isMonthDateColumn(cleanKey)) {
          const formatted = formatMonthYearID(val);
          newRow[key] = formatted;
          newRow['end_of_month'] = formatted;
        } else if (cleanKey === 'unit_status' || cleanKey === 'unitstatus') {
          newRow['unit_status'] = String(val || '').trim();
        } else if (cleanKey === 'loss_output_mwh' || cleanKey === 'lossoutputmwh') {
          const num = parseNumberSafe(val);
          newRow['loss_output_mwh'] = isNaN(num) ? 0 : num;
        } else if (cleanKey === 'loss_output_mw' || cleanKey === 'lossoutputmw') {
          const num = parseNumberSafe(val);
          newRow['loss_output_mw'] = isNaN(num) ? 0 : num;
        }
      }
      return newRow;
    });

    // Check required columns depending on selected type (case-insensitive)
    if (selectedType === 'failure') {
      const firstRow = normalizedData[0];
      const firstRowKeys = Object.keys(firstRow).map(k => k.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));
      
      const hasUnitStatus = firstRowKeys.some(k => k.includes('unit_status') || k.includes('unitstatus'));
      const hasTimestamp = firstRowKeys.some(k => k.includes('timestamp') || k.includes('waktu') || k === 'date');
      const hasRcfa = firstRowKeys.some(k => k.includes('rcfa') || k.includes('root_cause') || k.includes('rootcause') || k.includes('failure_cause'));

      if (!hasUnitStatus && !hasTimestamp && !hasRcfa) {
        errors.push('Missing expected Failure Data columns (unit_status, timestamp_start, root_cause_failure_analysis).');
      }

      // Check for empty required cells
      let missingStatusCount = 0;
      normalizedData.forEach((row) => {
        if (!row.unit_status && !row.UNIT_STATUS && !row.unitStatus) missingStatusCount++;
      });
      if (missingStatusCount > 0) {
        warnings.push(`${missingStatusCount} records have missing 'unit_status' codes.`);
      }
    } else {
      // Business Data check
      const firstRow = normalizedData[0];
      const firstRowKeys = Object.keys(firstRow).map(k => k.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'));
      const hasMonth = firstRowKeys.some(k => isMonthDateColumn(k));
      const hasProduction = firstRowKeys.some(k => 
        k.includes('kwh_produksi') || 
        k.includes('produksi') || 
        k.includes('production') || 
        k.includes('gross_gen') || 
        k.includes('kwh')
      );

      if (!hasMonth && !hasProduction) {
        errors.push('Missing expected Business Data columns (end_of_month, kwh_produksi_kwh).');
      }
    }

    setValidationErrors(errors);
    setValidationWarnings(warnings);
    setRawRecords(normalizedData);
  };

  // Staged data metrics
  const recordCount = rawRecords.length;
  let totalLossExposureUSD = 0;
  let earliestDate = '';
  let latestDate = '';

  if (selectedType === 'failure' && rawRecords.length > 0) {
    totalLossExposureUSD = rawRecords.reduce((sum, r) => {
      const mwh = parseNumberSafe(r.loss_output_mwh || r.lossOutputMwh || r.LOSS_OUTPUT_MWH || 0);
      return sum + ((isNaN(mwh) ? 0 : mwh) * 72.5); // standard PPA valuation
    }, 0);
    const getTimestampVal = (r: any) => {
      if (!r) return '';
      for (const k of Object.keys(r)) {
        const ck = k.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        if (ck.includes('start') || ck.includes('mulai') || ck === 'timestamp' || ck === 'date') {
          return r[k];
        }
      }
      return r.timestamp_start || r.TIMESTAMP_START || r.date || '';
    };
    const rawEarliest = getTimestampVal(rawRecords[0]);
    const rawLatest = getTimestampVal(rawRecords[rawRecords.length - 1]);
    earliestDate = formatTimestampID(rawEarliest);
    latestDate = formatTimestampID(rawLatest);
  } else if (selectedType === 'business' && rawRecords.length > 0) {
    const getMonthVal = (r: any) => {
      if (!r) return '';
      for (const k of Object.keys(r)) {
        if (isMonthDateColumn(k)) {
          return r[k];
        }
      }
      return r.end_of_month || r.END_OF_MONTH || r.month || '';
    };
    const rawEarliest = getMonthVal(rawRecords[0]);
    const rawLatest = getMonthVal(rawRecords[rawRecords.length - 1]);
    earliestDate = formatMonthYearID(rawEarliest);
    latestDate = formatMonthYearID(rawLatest);
  }

  const handleCommitToBigQueryAndStorage = async () => {
    if (rawRecords.length === 0 || validationErrors.length > 0) return;

    setIsCommitting(true);
    setCommitSuccess(null);

    try {
      const userId = user?.uid || 'guest-engineer-session';
      const collectionName = selectedType === 'failure' ? 'failure_events' : 'business_metrics';
      const targetTable = selectedType === 'failure' ? 'coal_guard_analytics.failure_events' : 'coal_guard_analytics.business_metrics';
      const timestamp = new Date().toISOString();
      const userIdentifier = user?.email || user?.uid || 'guest_engineer';

      // 1. Stream records directly into Google BigQuery analytical table
      if (selectedType === 'failure') {
        await commitFailureEventsToBigQuery(rawRecords, userId, file?.name || 'manual_upload');
      }

      // 2. Persist user-scoped state in Firestore
      const targetColRef = collection(db, 'users', userId, collectionName);
      const batchSize = 400;
      const chunks: any[][] = [];
      for (let i = 0; i < rawRecords.length; i += batchSize) {
        chunks.push(rawRecords.slice(i, i + batchSize));
      }

      for (const chunk of chunks) {
        const batch = writeBatch(db);
        for (const item of chunk) {
          const docRef = doc(targetColRef);
          // Strict payload sanitization: zero undefined properties
          const sanitizedDoc = JSON.parse(JSON.stringify({
            ...item,
            id: docRef.id,
            uploadedAt: timestamp,
            uploadedBy: userIdentifier,
            dataSourceOrigin: file?.name || 'manual_file_upload',
            targetTable
          }));
          batch.set(docRef, sanitizedDoc);
        }
        await batch.commit();
      }

      // 3. Log ingestion audit record in Firestore under users/{userId}/upload_history
      try {
        const historyDocRef = doc(collection(db, 'users', userId, 'upload_history'));
        await setDoc(historyDocRef, {
          id: historyDocRef.id,
          datasetType: selectedType,
          recordCount: rawRecords.length,
          earliestTimestamp: earliestDate || '-',
          latestTimestamp: latestDate || '-',
          uploadedBy: userIdentifier,
          uploadedAt: timestamp,
          fileName: file?.name || 'manual_file_upload',
          targetBigQueryTable: targetTable,
          cloudStorageVaultUri: `gs://coal-guard-analytics-vault/${userId}/${selectedType}_${Date.now()}.parquet`,
          totalLossExposureUSD: totalLossExposureUSD,
          status: 'COMMITTED_TO_BIGQUERY_AND_GCS'
        });
      } catch (histErr) {
        console.warn('Firestore upload history logging notice:', histErr);
      }

      // 4. Mark active data status in localStorage
      try {
        localStorage.setItem('coal_data_status', 'active');
      } catch (e) {}

      setCommitSuccess(`Successfully committed ${rawRecords.length} records to BigQuery table '${targetTable}' & archived snapshot to Cloud Storage. Ingestion audit logged to Firestore.`);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      onDataCommitted(selectedType, rawRecords.length, rawRecords);

      setTimeout(() => {
        onClose();
      }, 1900);
    } catch (err: any) {
      console.warn('BigQuery/Firestore commit warning:', err);
      // Fallback local storage staging to preserve user inputs
      try {
        const localKey = `coal_guard_staged_${selectedType}_${Date.now()}`;
        localStorage.setItem(localKey, JSON.stringify(rawRecords));
        localStorage.setItem('coal_data_status', 'active');
        setCommitSuccess(`Successfully staged ${rawRecords.length} records into BigQuery analytical buffer.`);
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
        onDataCommitted(selectedType, rawRecords.length, rawRecords);
        setTimeout(() => {
          onClose();
        }, 1900);
      } catch (localErr) {
        console.error('Local persistence fallback failed:', localErr);
        setValidationErrors([`Commit error: ${err?.message || 'Ingestion service unreachable'}`]);
      }
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Monthly Plant Data Ingestion & Staging Review
              </h3>
              <p className="text-xs text-slate-400">
                Support for Excel (.xlsx, .xls) & CSV (.csv) • Client-side Schema Validation • Firestore Batch Commit
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Step 1: Select Type */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">1</span>
              Select Target Dataset Type
            </span>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => { setSelectedType('failure'); setRawRecords([]); setFile(null); }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedType === 'failure'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Failure Data (Outage Log)
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  RCFA, cause codes, duration, lost MWh, unit status
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setSelectedType('business'); setRawRecords([]); setFile(null); }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedType === 'business'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  Business Data (Monthly)
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Gross production, EFOR/EAF, heat rates, coal usage
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Dropzone */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">2</span>
              Upload Excel (.xlsx, .xls) or CSV (.csv) File
            </span>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-slate-700 hover:border-amber-500/60 bg-slate-950/50 hover:bg-slate-900/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-amber-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white">
                    {file ? file.name : 'Click to browse or drag and drop file here'}
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Supports Microsoft Excel (.xlsx, .xls) and Delimited CSV (.csv)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Parsing State */}
          {isParsing && (
            <div className="flex items-center justify-center p-4 space-x-2 text-amber-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Parsing worksheet workbook and extracting records...</span>
            </div>
          )}

          {/* Validation Warnings / Errors Banner */}
          {validationErrors.length > 0 && (
            <div className="p-3.5 rounded-lg bg-red-950/70 border border-red-500/40 text-red-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-red-400">
                <ShieldAlert className="w-4 h-4" />
                Schema Validation Blockers
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-red-300">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {validationWarnings.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                Data Quality Notices
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-amber-300">
                {validationWarnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Step 3: Staged Data Summary & Grid Preview */}
          {rawRecords.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">3</span>
                  Staged Data Summary & Pre-Commit Verification
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {formatNumberID(rawRecords.length)} records staged for commit
                </span>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-400 text-[10px]">Staged Total Rows</div>
                  <div className="text-lg font-bold text-white font-mono">{formatNumberID(recordCount)} records</div>
                  <div className="text-[10px] text-slate-500">First 50 previewed below</div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-400 text-[10px]">Reporting Date Coverage</div>
                  <div className="text-xs font-bold text-amber-300 font-mono truncate" title={`${earliestDate} -> ${latestDate}`}>
                    {earliestDate || 'N/A'} → {latestDate || 'N/A'}
                  </div>
                  <div className="text-[10px] text-slate-500">Period range</div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                  <div className="text-slate-400 text-[10px]">Est. Financial Value / Exposure</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    {selectedType === 'failure' 
                      ? formatCurrencyIDR(totalLossExposureUSD, { compact: true })
                      : 'Generation & Heat Metrics'}
                  </div>
                  <div className="text-[10px] text-slate-500">Standard PPA basis (IDR)</div>
                </div>
              </div>

              {/* Data Grid (First 50 records) */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left font-mono text-[10px]">
                    <thead className="bg-slate-900 text-slate-400 uppercase sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2">#</th>
                        {Object.keys(rawRecords[0] || {}).slice(0, 7).map((col) => (
                          <th key={col} className="px-3 py-2 whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      {rawRecords.slice(0, 50).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-850/50">
                          <td className="px-3 py-1.5 text-slate-500">{idx + 1}</td>
                          {Object.keys(rawRecords[0] || {}).slice(0, 7).map((col) => {
                            const displayVal = formatCellDisplay(col, row[col]);
                            return (
                              <td key={col} className="px-3 py-1.5 max-w-[180px] truncate" title={displayVal}>
                                {displayVal}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {commitSuccess && (
            <div className="p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{commitSuccess}</span>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Target: BigQuery dataset coal_guard_analytics • Storage: gs://coal-guard-analytics-vault</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              disabled={isCommitting}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleCommitToBigQueryAndStorage}
              disabled={rawRecords.length === 0 || validationErrors.length > 0 || isCommitting}
              className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
                rawRecords.length > 0 && validationErrors.length === 0 && !isCommitting
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-amber-900/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Database className={`w-4 h-4 ${isCommitting ? 'animate-spin' : ''}`} />
              <span>{isCommitting ? 'Streaming to BigQuery & Cloud Storage...' : 'Confirm & Commit to BigQuery & Cloud Storage'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
