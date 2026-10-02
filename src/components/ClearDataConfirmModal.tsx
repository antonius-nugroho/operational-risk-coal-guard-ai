import React, { useState } from 'react';
import { Trash2, AlertTriangle, RefreshCw, CheckCircle2, X, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, writeBatch } from 'firebase/firestore';

interface ClearDataConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCleared: () => void;
  onRestoreDemo?: () => void;
}

export const ClearDataConfirmModal: React.FC<ClearDataConfirmModalProps> = ({
  isOpen,
  onClose,
  onCleared,
  onRestoreDemo,
}) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClearAll = async () => {
    setIsDeleting(true);
    setErrorMsg(null);

    try {
      // 1. Mark explicitly in localStorage that data has been cleared
      try {
        localStorage.setItem('coal_data_status', 'cleared');
        localStorage.removeItem('coal_custom_failures');
        localStorage.removeItem('coal_custom_business');
        
        // Remove old assessment snapshots
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('coal_risk_assessment_') || key.startsWith('coal_guard_staged_'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } catch (localErr) {
        console.warn('LocalStorage clear warning:', localErr);
      }

      // 2. Clear Firestore collections for the authenticated user (if signed in)
      if (user?.uid) {
        const collectionsToPurge = [
          'failure_events',
          'business_metrics',
          'lossEvents',
          'assessments'
        ];

        for (const colName of collectionsToPurge) {
          try {
            const colRef = collection(db, 'users', user.uid, colName);
            const snapshot = await getDocs(colRef);
            if (!snapshot.empty) {
              const batch = writeBatch(db);
              snapshot.docs.forEach((docSnap) => {
                batch.delete(docSnap.ref);
              });
              await batch.commit();
            }
          } catch (err: any) {
            console.warn(`Purging collection ${colName} notice:`, err?.message || err);
          }
        }
      }

      // 3. Trigger callback to reset in-memory datasets in App state
      onCleared();
      onClose();
    } catch (err: any) {
      console.error('Failed to clear operational data:', err);
      setErrorMsg(err.message || 'Failed to complete data purge');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = () => {
    try {
      localStorage.removeItem('coal_data_status');
      localStorage.removeItem('coal_custom_failures');
      localStorage.removeItem('coal_custom_business');
      if (onRestoreDemo) {
        onRestoreDemo();
      }
      onClose();
    } catch (e) {
      console.warn('Restore notice:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5 text-red-400">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Clear All Plant Data</h3>
              <p className="text-[11px] text-slate-400">Prepare Workspace for Fresh Uploads</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning text */}
        <div className="bg-red-950/40 border border-red-500/30 rounded-lg p-3.5 space-y-2 text-xs text-red-200">
          <div className="font-bold flex items-center gap-1.5 text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            What will be cleared:
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1 text-[11px]">
            <li><strong>All Failure Outage Events:</strong> Reset to 0 records</li>
            <li><strong>All Monthly Business Metrics:</strong> Reset to 0 records</li>
            <li><strong>Monte Carlo Risk Engine:</strong> Calibrated to zero baseline</li>
            <li><strong>D3.js Probability Density:</strong> Cleared ready for fresh data</li>
            <li><strong>Firestore & Cache:</strong> Persisted purge across page refreshes</li>
          </ul>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Clicking <strong>"Yes, Clear All Data"</strong> will immediately remove the sample and staged datasets so you can upload your own custom Excel or CSV files.
        </p>

        {errorMsg && (
          <div className="text-xs text-red-400 font-medium bg-red-950/50 p-2 rounded border border-red-800/40">
            {errorMsg}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-slate-800">
          {onRestoreDemo && (
            <button
              type="button"
              onClick={handleRestore}
              className="w-full sm:w-auto flex items-center justify-center space-x-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              title="Reload the Tarahan CFB sample plant records"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reload Sample Data</span>
            </button>
          )}

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              disabled={isDeleting}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-900/40"
            >
              <Trash2 className={`w-3.5 h-3.5 ${isDeleting ? 'animate-spin' : ''}`} />
              <span>{isDeleting ? 'Clearing Records...' : 'Yes, Clear All Data'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
