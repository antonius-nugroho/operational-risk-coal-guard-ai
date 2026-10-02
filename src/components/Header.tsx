import React from 'react';
import { 
  Flame, 
  ShieldCheck, 
  Cpu, 
  Database, 
  CloudSun, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  BarChart3, 
  Layers, 
  Lock, 
  LogOut, 
  User as UserIcon,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenWalkthrough: () => void;
  onOpenStorageInfo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenWalkthrough,
  onOpenStorageInfo 
}) => {
  const { user, signInWithGoogle, signOut, authError } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Executive Risk & Monte Carlo', icon: BarChart3 },
    { id: 'data-sources', label: 'Plant Data Sources (CSV)', icon: FileSpreadsheet },
    { id: 'ml-predictions', label: 'Vertex AI Subsystem Risks', icon: Cpu },
    { id: 'historical-events', label: 'Loss Events & RCA', icon: AlertTriangle },
    { id: 'telemetry', label: 'BigQuery Telemetry Stream', icon: Activity },
    { id: 'architecture', label: 'GCP Industrial Architecture', icon: Layers },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & App Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Flame className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">COAL-GUARD™ AI</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Operational Risk Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">Vertex AI • BigQuery • Thermal Plant Reliability</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive 
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions & Auth */}
          <div className="flex items-center space-x-2.5">
            {onOpenStorageInfo && (
              <button
                onClick={onOpenStorageInfo}
                title="View Data Storage details & Reset options"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/40 transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Data Storage</span>
              </button>
            )}

            <button
              onClick={onOpenWalkthrough}
              title="Verification Walkthrough Steps"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Verification Checklist</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-3 bg-slate-800/80 border border-slate-700 rounded-full py-1 pl-3 pr-1.5">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-400 flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Verified Plant Eng.
                  </span>
                </div>
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="avatar" 
                    className="w-7 h-7 rounded-full border border-amber-500/50" 
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                )}
                <button
                  onClick={signOut}
                  title="Sign out"
                  className="p-1 hover:text-red-400 text-slate-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-900/30 transition-all font-sans"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Google Sign-In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex overflow-x-auto py-2 space-x-2 border-t border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap ${
                  isActive 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {authError && (
        <div className="bg-red-950/80 border-b border-red-700/50 px-4 py-1.5 text-xs text-red-200 text-center">
          Authentication note: {authError} (Simulation mode active with local persistence fallback)
        </div>
      )}
    </header>
  );
};
