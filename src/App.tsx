import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { UrlScanner } from './components/UrlScanner';
import { MessageInspector } from './components/MessageInspector';
import { SimulatorLab } from './components/SimulatorLab';
import { TyposquatWatchdog } from './components/TyposquatWatchdog';
import { BreachPlaybook } from './components/BreachPlaybook';
import { SCENARIOS } from './data/scenarios';
import { ShieldCheck, Lock, ExternalLink, Terminal } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('scanner');
  const [completedScenarioIds, setCompletedScenarioIds] = useState<Set<string>>(new Set());
  const [injectedScanUrl, setInjectedScanUrl] = useState<string | null>(null);

  const handleScanUrlFromOtherTab = (url: string) => {
    setInjectedScanUrl(url);
    setActiveTab('scanner');
  };

  const handleScenarioCompleted = (id: string, _isCorrect: boolean) => {
    setCompletedScenarioIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Cybersecurity Top Bar & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        completedScenariosCount={completedScenarioIds.size}
        totalScenariosCount={SCENARIOS.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'scanner' && (
          <UrlScanner
            key={injectedScanUrl || 'default-scanner'}
            initialUrl={injectedScanUrl}
            onInspectInMessage={(url) => {
              setActiveTab('messages');
            }}
          />
        )}

        {activeTab === 'messages' && (
          <MessageInspector onScanUrl={handleScanUrlFromOtherTab} />
        )}

        {activeTab === 'simulator' && (
          <SimulatorLab
            onScanUrl={handleScanUrlFromOtherTab}
            onScenarioCompleted={handleScenarioCompleted}
            completedScenarioIds={completedScenarioIds}
          />
        )}

        {activeTab === 'typosquat' && (
          <TyposquatWatchdog onScanUrl={handleScanUrlFromOtherTab} />
        )}

        {activeTab === 'playbook' && (
          <BreachPlaybook />
        )}
      </main>

      {/* Security Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-400">PhishGuard Threat Intelligence</span>
            <span>· Multi-Vector ML Security Defense</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span className="text-slate-400">Heuristics Engine v3.8</span>
            <span className="text-slate-400">RFC 3986 &amp; IDN Homograph Compliant</span>
            <span className="text-slate-400">SOC Triage Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
