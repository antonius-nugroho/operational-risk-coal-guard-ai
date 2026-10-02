import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Radio, 
  Flame, 
  Gauge, 
  Wind, 
  Zap, 
  AlertCircle, 
  Database,
  CloudLightning,
  RefreshCw
} from 'lucide-react';
import { TelemetryReading } from '../types/riskModel';
import { formatNumberID, formatTimeID } from '../lib/formatters';

interface TelemetryStreamViewProps {
  telemetry: TelemetryReading[];
  onInjectSpike: () => void;
}

export const TelemetryStreamView: React.FC<TelemetryStreamViewProps> = ({
  telemetry,
  onInjectSpike,
}) => {
  const latest = telemetry[telemetry.length - 1] || telemetry[0];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white">BigQuery & Pub/Sub High-Frequency Telemetry Ingestion</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Streaming 10-second industrial SCADA metrics ingested via Cloud Pub/Sub, windowed in Dataflow, and partitioned in BigQuery.
          </p>
        </div>

        <button
          onClick={onInjectSpike}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-500 text-white font-semibold text-xs transition-all shadow-md self-start sm:self-auto"
        >
          <CloudLightning className="w-4 h-4" />
          <span>Simulate Sensor Thermal Anomaly Spike</span>
        </button>
      </div>

      {/* Live Unit Gauge Cluster */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Steam Temp */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Main Steam Temp</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">
            {formatNumberID(latest?.mainSteamTempC, 1)} <span className="text-xs text-slate-400">°C</span>
          </div>
          <div className="text-[10px] text-slate-400">Nominal: {formatNumberID(566.0, 1)} °C</div>
        </div>

        {/* Steam Pressure */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Main Pressure</span>
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">
            {formatNumberID(latest?.mainSteamPressureBar, 1)} <span className="text-xs text-slate-400">bar</span>
          </div>
          <div className="text-[10px] text-slate-400">Limit: {formatNumberID(255.0, 1)} bar</div>
        </div>

        {/* Turbine Vibration */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Turbine Vibration</span>
            <Activity className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">
            {formatNumberID(latest?.turbineVibrationUm, 1)} <span className="text-xs text-slate-400">μm</span>
          </div>
          <div className={`text-[10px] font-semibold ${latest?.turbineVibrationUm > 70 ? 'text-red-400' : 'text-emerald-400'}`}>
            Trip Alarm: {formatNumberID(110, 0)} μm
          </div>
        </div>

        {/* Flue Gas SO2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Flue Gas SO2</span>
            <Wind className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-black text-white font-mono">
            {formatNumberID(latest?.flueGasSO2MgNm3, 1)} <span className="text-xs text-slate-400">mg/m³</span>
          </div>
          <div className="text-[10px] text-slate-400">EPA Limit: {formatNumberID(350, 0)} mg/m³</div>
        </div>

        {/* Net Output MW */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Net Grid Output</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono">
            {formatNumberID(latest?.netOutputMW, 1)} <span className="text-xs text-slate-400">MW</span>
          </div>
          <div className="text-[10px] text-slate-400">Rated: {formatNumberID(660.0, 1)} MW</div>
        </div>

        {/* Real-Time ML Anomaly Score */}
        <div className={`rounded-xl p-3.5 space-y-1 border ${
          latest?.anomalyScore > 60 
            ? 'bg-red-950/40 border-red-500/50' 
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>ML Anomaly Score</span>
            <AlertCircle className={`w-3.5 h-3.5 ${latest?.anomalyScore > 60 ? 'text-red-400 animate-bounce' : 'text-slate-400'}`} />
          </div>
          <div className={`text-xl font-black font-mono ${latest?.anomalyScore > 60 ? 'text-red-400' : 'text-slate-200'}`}>
            {formatNumberID(latest?.anomalyScore, 0)} <span className="text-xs font-normal">/ 100</span>
          </div>
          <div className="text-[10px] text-slate-400 truncate" title={latest?.anomalyPredictedSubsystem}>
            {latest?.anomalyPredictedSubsystem || 'Normal'}
          </div>
        </div>

      </div>

      {/* BigQuery Table Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            SELECT * FROM `gcp-thermal-ops.bigquery_scada.unit_telemetry_live` ORDER BY timestamp DESC LIMIT 10
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
            Streaming Buffer Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-3.5 py-2.5">Time (hh:mm)</th>
                <th className="px-3.5 py-2.5">Unit</th>
                <th className="px-3.5 py-2.5">Main Temp (°C)</th>
                <th className="px-3.5 py-2.5">Press (bar)</th>
                <th className="px-3.5 py-2.5">Turbine Vib (μm)</th>
                <th className="px-3.5 py-2.5">SO2 (mg/Nm³)</th>
                <th className="px-3.5 py-2.5">Coal (t/h)</th>
                <th className="px-3.5 py-2.5">Output (MW)</th>
                <th className="px-3.5 py-2.5">Anomaly (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300 text-[11px]">
              {telemetry.slice().reverse().map((row, idx) => (
                <tr key={idx} className={row.anomalyScore > 60 ? 'bg-red-950/20' : 'hover:bg-slate-800/30'}>
                  <td className="px-3.5 py-2 text-slate-400">{formatTimeID(row.timestamp)}</td>
                  <td className="px-3.5 py-2 text-amber-400">{row.unitId}</td>
                  <td className="px-3.5 py-2">{formatNumberID(row.mainSteamTempC, 1)}</td>
                  <td className="px-3.5 py-2">{formatNumberID(row.mainSteamPressureBar, 1)}</td>
                  <td className="px-3.5 py-2">{formatNumberID(row.turbineVibrationUm, 1)}</td>
                  <td className="px-3.5 py-2">{formatNumberID(row.flueGasSO2MgNm3, 1)}</td>
                  <td className="px-3.5 py-2">{formatNumberID(row.coalFeedRateTph, 1)}</td>
                  <td className="px-3.5 py-2 text-emerald-400 font-bold">{formatNumberID(row.netOutputMW, 1)}</td>
                  <td className="px-3.5 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      row.anomalyScore > 60 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {formatNumberID(row.anomalyScore, 0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
