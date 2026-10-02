import React, { useState } from 'react';
import { 
  AlertOctagon, 
  Plus, 
  Trash2, 
  Filter, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileSpreadsheet,
  AlertTriangle,
  Info
} from 'lucide-react';
import { LossEvent, LossCategory } from '../types/riskModel';
import { 
  formatCurrencyIDR, 
  formatDateID, 
  formatHoursID, 
  formatMWhID, 
  formatNumberID 
} from '../lib/formatters';

interface HistoricalEventsViewProps {
  events: LossEvent[];
  onAddEvent: (event: Omit<LossEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
}

const CATEGORIES: LossCategory[] = [
  'Boiler Tube Leakage & Pressure Parts',
  'Turbine Vibration & Blade Erosion',
  'Coal Mill & Pulverizer Trip',
  'FGD / Flue Gas Desulfurization Outage',
  'Ash Handling & Slagging',
  'Grid Curtailment & Generator Trip',
  'Coal Supply Quality Variance & Moisture',
  'Environmental Emission Exceedance (NOx/SO2/Particulate)'
];

export const HistoricalEventsView: React.FC<HistoricalEventsViewProps> = ({
  events,
  onAddEvent,
  onDeleteEvent,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState<Omit<LossEvent, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    plantId: 'plant-suralaya-u7',
    unit: 'Unit 4',
    category: 'Boiler Tube Leakage & Pressure Parts',
    forcedOutageHours: 24,
    mwhLost: 15840,
    financialLossUSD: 1148400,
    rootCause: 'Fly ash erosion localized wear on secondary reheater pendant tube bend.',
    detectedBy: 'Acoustic Leak Sensor',
    severity: 'High',
    preventableWithML: true,
    mitigationActionTaken: 'Applied thermal spray refractory shield and updated acoustic trigger limits.'
  });

  const filteredEvents = events.filter(e => 
    filterCategory === 'all' || e.category === filterCategory
  );

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEvent(formData);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Historical Loss Events & Root Cause Analysis (RCA)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standardized operational failure database ingested from BigQuery loss ledgers, work orders, and SCADA incident logs.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Outage Event</span>
        </button>
      </div>

      {/* Filter and Overview Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Filter by Subsystem:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-md px-2.5 py-1"
          >
            <option value="all">All Subsystem Categories ({events.length})</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <span className="text-slate-400">
            Total Forced Hours: <strong className="text-white">{formatHoursID(filteredEvents.reduce((s, e) => s + e.forcedOutageHours, 0))}</strong>
          </span>
          <span className="text-slate-400">
            Total Financial Toll: <strong className="text-red-400">{formatCurrencyIDR(filteredEvents.reduce((s, e) => s + e.financialLossUSD, 0), { compact: true })}</strong>
          </span>
        </div>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmitNew} className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Ingest New Coal Plant Loss Event
              </h3>
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Event Date</label>
                <input 
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" 
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Subsystem Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as LossCategory })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Forced Outage Duration (Hours)</label>
                <input 
                  type="number"
                  value={formData.forcedOutageHours}
                  onChange={(e) => setFormData({ ...formData, forcedOutageHours: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" 
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Estimated Financial Loss (USD)</label>
                <input 
                  type="number"
                  value={formData.financialLossUSD}
                  onChange={(e) => setFormData({ ...formData, financialLossUSD: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white" 
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Severity Tier</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Catastrophic">Catastrophic</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Primary Detection Vector</label>
                <select
                  value={formData.detectedBy}
                  onChange={(e) => setFormData({ ...formData, detectedBy: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                >
                  <option value="Acoustic Leak Sensor">Acoustic Leak Sensor</option>
                  <option value="BigQuery Anomaly Model">BigQuery Anomaly Model</option>
                  <option value="Vibration Telemetry">Vibration Telemetry</option>
                  <option value="Pyrometer/Thermal">Pyrometer/Thermal</option>
                  <option value="Operator Inspection">Operator Inspection</option>
                </select>
              </div>
            </div>

            <div className="text-xs space-y-2">
              <div>
                <label className="block text-slate-400 mb-1">Detailed Root Cause Analysis (RCA)</label>
                <textarea 
                  value={formData.rootCause}
                  onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs" 
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Engineered Mitigation & Maintenance Response</label>
                <textarea 
                  value={formData.mitigationActionTaken}
                  onChange={(e) => setFormData({ ...formData, mitigationActionTaken: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-xs" 
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input 
                  type="checkbox"
                  id="preventable"
                  checked={formData.preventableWithML}
                  onChange={(e) => setFormData({ ...formData, preventableWithML: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
                />
                <label htmlFor="preventable" className="text-slate-300">
                  Deemed Preventable via High-Resolution ML Anomaly Detection
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Ingest Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Date / Unit</th>
                <th className="px-4 py-3">Subsystem Category</th>
                <th className="px-4 py-3">Duration & Outage</th>
                <th className="px-4 py-3">Financial Impact</th>
                <th className="px-4 py-3">Root Cause & Mitigation</th>
                <th className="px-4 py-3">ML Preventable</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-semibold text-white">{formatDateID(evt.date)}</div>
                    <div className="text-[11px] text-slate-400">{evt.unit}</div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-200">{evt.category}</div>
                    <div className="text-[10px] text-amber-400 mt-0.5">Sensor: {evt.detectedBy}</div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-mono font-semibold text-amber-300">{formatHoursID(evt.forcedOutageHours)}</div>
                    <div className="text-[10px] text-slate-400">{formatMWhID(evt.mwhLost)}</div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-mono font-bold text-red-400">
                      {formatCurrencyIDR(evt.financialLossUSD)}
                    </div>
                    <span className={`inline-block mt-0.5 text-[9px] uppercase px-1.5 py-0.5 rounded font-semibold ${
                      evt.severity === 'Catastrophic' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                      evt.severity === 'High' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {evt.severity}
                    </span>
                  </td>

                  <td className="px-4 py-3 max-w-sm">
                    <div className="line-clamp-2 text-slate-300" title={evt.rootCause}>
                      {evt.rootCause}
                    </div>
                    <div className="text-[11px] text-emerald-400/90 mt-1 line-clamp-1 italic">
                      ↳ Fix: {evt.mitigationActionTaken}
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {evt.preventableWithML ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Yes (42% sav.)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <XCircle className="w-3.5 h-3.5 text-slate-500" /> External / Weather
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onDeleteEvent(evt.id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
