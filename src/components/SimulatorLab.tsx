import React, { useState } from 'react';
import {
  Award, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Eye,
  ArrowRight, RotateCcw, Lightbulb, ExternalLink, HelpCircle
} from 'lucide-react';
import { SCENARIOS } from '../data/scenarios';
import { SimulationScenario } from '../types/phishing';

interface SimulatorLabProps {
  onScanUrl: (url: string) => void;
  onScenarioCompleted: (id: string, isCorrect: boolean) => void;
  completedScenarioIds: Set<string>;
}

export const SimulatorLab: React.FC<SimulatorLabProps> = ({
  onScanUrl,
  onScenarioCompleted,
  completedScenarioIds,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [filterType, setFilterType] = useState<string>('all');
  const [userDecision, setUserDecision] = useState<'phish' | 'safe' | null>(null);
  const [showInspector, setShowInspector] = useState<boolean>(false);
  const [scoreCount, setScoreCount] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  const activeScenarios = SCENARIOS.filter(s => {
    if (filterType === 'all') return true;
    if (filterType === 'email') return s.type === 'email';
    if (filterType === 'sms') return s.type === 'sms';
    return true;
  });

  const scenario = activeScenarios[currentIndex] || activeScenarios[0];

  const handleDecision = (decision: 'phish' | 'safe') => {
    if (userDecision !== null) return;
    setUserDecision(decision);

    const isCorrect = (decision === 'phish' && scenario.isPhish) || (decision === 'safe' && !scenario.isPhish);
    setScoreCount(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    onScenarioCompleted(scenario.id, isCorrect);
  };

  const handleNext = () => {
    setUserDecision(null);
    setShowInspector(false);
    setCurrentIndex(prev => (prev + 1) % activeScenarios.length);
  };

  const isCurrentCompleted = completedScenarioIds.has(scenario.id);
  const isCorrect = userDecision !== null && (
    (userDecision === 'phish' && scenario.isPhish) ||
    (userDecision === 'safe' && !scenario.isPhish)
  );

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Phishing Awareness Defense Training Lab</span>
              <span className="text-xs font-mono font-normal bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded">
                Interactive Simulator
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Sharpen your threat detection reflexes against real-world targeted attacks. Inspect sender addresses, scrutinize masked URLs, and make security decisions in a controlled sandbox.
            </p>
          </div>

          {/* User Scorecard */}
          <div className="flex items-center gap-4 bg-slate-950/90 border border-slate-800 p-4 rounded-xl self-start md:self-center">
            <div>
              <span className="text-xs font-mono text-slate-400 block">TRAINING ACCURACY</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-bold font-mono text-white">
                  {scoreCount.total > 0 ? Math.round((scoreCount.correct / scoreCount.total) * 100) : 100}%
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({scoreCount.correct}/{scoreCount.total} solved)
                </span>
              </div>
            </div>
            <Award className="w-8 h-8 text-amber-400 flex-shrink-0" />
          </div>
        </div>

        {/* Filter & Scenario Selector */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Filter Category:</span>
            {['all', 'email', 'sms'].map((ft) => (
              <button
                key={ft}
                onClick={() => {
                  setFilterType(ft);
                  setCurrentIndex(0);
                  setUserDecision(null);
                  setShowInspector(false);
                }}
                className={`text-xs px-2.5 py-1 rounded capitalize font-medium transition-all ${
                  filterType === ft
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {ft === 'all' ? 'All Scenarios' : `${ft.toUpperCase()} Phishing`}
              </button>
            ))}
          </div>

          {/* Scenario Index Indicator */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Scenario {currentIndex + 1} of {activeScenarios.length}</span>
            <div className="flex gap-1">
              {activeScenarios.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setUserDecision(null);
                    setShowInspector(false);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'bg-emerald-400 ring-2 ring-emerald-400/30'
                      : completedScenarioIds.has(s.id)
                      ? 'bg-slate-500'
                      : 'bg-slate-800'
                  }`}
                  title={s.title}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Simulation Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {/* Sandbox Window Bar */}
        <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/60 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/60 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/60 inline-block"></span>
            <span className="ml-2 text-xs font-mono text-slate-400">
              [Isolated Defense Sandbox] · {scenario.category} · {scenario.difficulty}
            </span>
          </div>

          <button
            onClick={() => setShowInspector(!showInspector)}
            className={`text-xs px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors font-mono ${
              showInspector
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showInspector ? 'Hide Security Microscope' : 'Open Security Microscope'}</span>
          </button>
        </div>

        {/* Message Presentation */}
        <div className="p-6 space-y-5">
          {/* Header Metadata */}
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-2 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono w-16">From:</span>
                <span className="text-white font-medium">{scenario.sender.name}</span>
                <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${showInspector && !scenario.sender.displayMatch ? 'bg-rose-950/90 text-rose-300 border border-rose-800' : 'text-slate-400'}`}>
                  &lt;{scenario.sender.emailOrPhone}&gt;
                </span>
              </div>
              <span className="text-slate-500 font-mono text-[11px]">{scenario.timestamp}</span>
            </div>

            {scenario.subject && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-900">
                <span className="text-slate-500 font-mono w-16">Subject:</span>
                <span className="text-slate-200 font-semibold">{scenario.subject}</span>
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-5 bg-slate-950 border border-slate-800/90 rounded-lg">
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
              {scenario.body}
            </div>

            {/* Embedded Link (if present) */}
            {scenario.embeddedLink && (
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <span className="text-xs text-slate-500 block mb-1.5 font-mono">Simulated Embedded Link:</span>
                <div className="inline-flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <span className="text-emerald-400 font-medium text-xs underline cursor-pointer">
                    {scenario.embeddedLink.anchorText}
                  </span>

                  {showInspector && (
                    <div className="text-xs font-mono px-2 py-1 rounded bg-rose-950/80 border border-rose-800 text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Actual target: {scenario.embeddedLink.destinationUrl}</span>
                    </div>
                  )}

                  <button
                    onClick={() => onScanUrl(scenario.embeddedLink!.destinationUrl)}
                    className="ml-auto text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-mono transition-colors"
                  >
                    <span>Test in URL Detector</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Security Microscope Overlay */}
          {showInspector && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-lg space-y-2 text-xs">
              <h4 className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                <span>Forensic Hints &amp; Clues Revealed:</span>
              </h4>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                {scenario.clues.map((clue, idx) => (
                  <li key={idx}>{clue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Interactive Decision Controls */}
          {userDecision === null ? (
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleDecision('phish')}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-600/20"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>🚩 Flag as Malicious Phishing</span>
              </button>
              <button
                onClick={() => handleDecision('safe')}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 border border-slate-700 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>🛡️ Mark as Legitimate &amp; Safe</span>
              </button>
            </div>
          ) : (
            /* Post-Decision Educational Debrief */
            <div className="space-y-4 pt-2">
              <div
                className={`p-5 rounded-xl border ${
                  isCorrect
                    ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {isCorrect ? 'Accurate Threat Assessment!' : 'Security Alert: Misidentified Threat!'}
                    </h3>
                    <p className="text-xs mt-1 text-slate-300">
                      This communication was{' '}
                      <strong className="text-white">
                        {scenario.isPhish ? 'AN ACTIVE PHISHING ATTACK' : 'A LEGITIMATE VERIFIED NOTIFICATION'}
                      </strong>
                      . You selected:{' '}
                      <span className="font-mono uppercase font-bold">
                        {userDecision === 'phish' ? 'Phishing' : 'Safe'}
                      </span>
                      .
                    </p>
                  </div>
                </div>

                {/* Vector Breakdown */}
                <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h5 className="font-semibold text-slate-200 mb-1">Psychological Triggers Exploited:</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {scenario.psychologicalTactics.map((tac, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300 font-mono text-[11px]">
                          {tac}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-200 mb-1">Key Forensic Red Flags:</h5>
                    <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                      {scenario.technicalRedFlags.map((trf, i) => (
                        <li key={i}>{trf}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Educational Takeaway */}
                <div className="mt-4 p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Key Takeaway: </strong>
                    {scenario.takeaway}
                  </span>
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg text-sm flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20"
                >
                  <span>Next Challenge Scenario</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
