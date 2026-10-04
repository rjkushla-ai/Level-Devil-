import React from 'react';
import { ShieldAlert, Search, MailWarning, Award, Globe, BookOpen } from 'lucide-react';

export type ActiveTab = 'scanner' | 'messages' | 'simulator' | 'typosquat' | 'playbook';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  completedScenariosCount: number;
  totalScenariosCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  completedScenariosCount,
  totalScenariosCount,
}) => {
  const tabs = [
    { id: 'scanner' as ActiveTab, label: 'URL Threat Detector', icon: Search, hint: 'ML & Lexical Analysis' },
    { id: 'messages' as ActiveTab, label: 'Message & Smish Inspector', icon: MailWarning, hint: 'Email / SMS Analyzer' },
    { id: 'simulator' as ActiveTab, label: 'Defense Training Lab', icon: Award, hint: `${completedScenariosCount}/${totalScenariosCount} Solved` },
    { id: 'typosquat' as ActiveTab, label: 'Typosquat Watchdog', icon: Globe, hint: 'Brand Defense' },
    { id: 'playbook' as ActiveTab, label: 'Breach Playbook', icon: BookOpen, hint: 'Incident Response' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">PhishGuard</span>
                <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                  AI + ML ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Machine Learning Threat Detection &amp; Security Awareness Platform
              </p>
            </div>
          </div>

          {/* System Telemetry & Awareness Badge */}
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300">Live Heuristics &amp; Gemini 3.8 Flash</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-md text-slate-300">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Lab Score: <strong className="text-white">{completedScenariosCount}</strong>/{totalScenariosCount}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-900/60 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span className="text-[11px] text-slate-500 font-mono hidden lg:inline">
                  · {tab.hint}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
