import React, { useState } from 'react';
import {
  MailWarning, Send, AlertCircle, CheckCircle, ShieldAlert,
  ExternalLink, Copy, Check, Sparkles, RefreshCw, MessageSquare
} from 'lucide-react';
import { MessageAnalysisResponse } from '../types/phishing';

interface MessageInspectorProps {
  onScanUrl: (url: string) => void;
}

const PRESET_MESSAGES = [
  {
    name: 'Executive Wire Transfer (BEC)',
    sender: 'Jonathan Sterling <ceo.office.corp@gmail.com>',
    text: `Are you available? I am in a closed-door board meeting right now and cannot take calls. I need you to immediately execute an urgent confidential escrow wire transfer of $48,500 for the Apex acquisition before 2:00 PM today. Please reply directly to confirm and I will send the wire details. Keep this strictly between us until the official press release.`,
  },
  {
    name: 'USPS Package Smishing (SMS)',
    sender: '+1 (832) 991-0428',
    text: `[USPS Alert]: Your package #US940011189812 has arrived at our sorting facility but cannot be dispatched due to an incomplete delivery address. Please verify your address and pay the $0.35 redelivery surcharge within 12 hours: https://usps-post-redelivery.top/tracking`,
  },
  {
    name: 'Urgent Office 365 MFA Notice',
    sender: 'IT Security Service <admin@m365-tenant-portal-auth.xyz>',
    text: `URGENT SECURITY ALERT: Unauthorized sign-in attempt detected from IP 185.220.101.4 (Frankfurt, DE). Your Microsoft 365 account will be locked within 1 hour unless you verify your 2FA authentication token immediately: https://login.microsoftonline.com.m365-tenant-portal-auth.xyz/verify-token`,
  },
  {
    name: 'Legitimate System Alert',
    sender: 'GitHub <notifications@github.com>',
    text: `[GitHub] Secret scanning detected a leaked Personal Access Token (ghp_***) in your repository 'project-core'. For your security, GitHub has automatically revoked this token. Please review your commit history. View details: https://github.com/settings/tokens`,
  },
];

export const MessageInspector: React.FC<MessageInspectorProps> = ({ onScanUrl }) => {
  const [sender, setSender] = useState<string>(PRESET_MESSAGES[0].sender);
  const [message, setMessage] = useState<string>(PRESET_MESSAGES[0].text);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MessageAnalysisResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleAnalyze = async () => {
    if (!message.trim()) {
      setError('Please provide a message or email body to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sender }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} message analysis failed.`);
      }

      const data: MessageAnalysisResponse = await response.json();
      setResult(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to inspect message.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_MESSAGES[0]) => {
    setSender(preset.sender);
    setMessage(preset.text);
    setResult(null);
  };

  const handleCopyAnalysis = () => {
    if (!result) return;
    const txt = `[PhishGuard Message Analysis]
Verdict: ${result.analysis.verdict} (Score: ${result.analysis.threatScore}/100)
Attack Type: ${result.analysis.attackCategory}
Triggers: ${result.analysis.psychologicalTriggers.join(', ')}
Summary: ${result.analysis.summary}
Recommended Action: ${result.analysis.recommendedAction}
`;
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Message &amp; Social Engineering Inspector</span>
              <span className="text-xs font-mono font-normal bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded">
                Email / SMS / Smishing
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Detect coercive psychology, executive impersonation (BEC), artificial urgency deadlines, and malicious embedded links inside emails and text messages.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Natural Language Threat Scoring</span>
          </div>
        </div>

        {/* Presets */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Load Pre-Analyzed Threat Scenario:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_MESSAGES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(preset)}
                className="text-xs px-2.5 py-1.5 rounded-md bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white transition-all font-mono"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="mt-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Sender Address / Header (Optional):
            </label>
            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="e.g. CEO <ceo@gmail.com> or +1 (555) 019-2834"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Message Body / Email Content:
            </label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste email text, SMS message, or notification body..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-lg text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-300 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg text-sm flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Social Engineering Vectors...</span>
                </>
              ) : (
                <>
                  <MailWarning className="w-4 h-4" />
                  <span>Scan Message</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Result */}
      {result && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {/* Header Banner */}
          <div
            className={`p-6 border-b border-slate-800 ${
              result.analysis.verdict === 'HIGH_RISK_PHISH'
                ? 'bg-rose-950/70 text-rose-300'
                : result.analysis.verdict === 'SUSPICIOUS'
                ? 'bg-amber-950/70 text-amber-300'
                : 'bg-emerald-950/70 text-emerald-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-current">
                  {result.analysis.verdict === 'HIGH_RISK_PHISH' ? (
                    <ShieldAlert className="w-7 h-7 text-rose-400" />
                  ) : result.analysis.verdict === 'SUSPICIOUS' ? (
                    <AlertCircle className="w-7 h-7 text-amber-400" />
                  ) : (
                    <CheckCircle className="w-7 h-7 text-emerald-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold tracking-tight text-white">
                      {result.analysis.verdict.replace(/_/g, ' ')}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 border border-current">
                      Category: {result.analysis.attackCategory}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    {result.analysis.summary}
                  </p>
                </div>
              </div>

              {/* Threat Score */}
              <div className="bg-slate-950/90 border border-slate-800 px-4 py-3 rounded-xl flex items-center gap-4 self-start sm:self-center">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block">DECEPTION SCORE</span>
                  <span className="text-2xl font-bold font-mono text-white">
                    {result.analysis.threatScore}
                    <span className="text-xs text-slate-500 font-normal"> / 100</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Extracted URLs if any */}
            {result.extractedUrls.length > 0 && (
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Embedded URLs Extracted from Message ({result.extractedUrls.length})</span>
                  <span className="text-[11px] text-slate-500">Click to cross-examine in URL Threat Scanner</span>
                </h4>
                <div className="space-y-2">
                  {result.extractedUrls.map((u, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 p-2.5 bg-slate-900 border border-slate-800 rounded text-xs font-mono"
                    >
                      <span className="text-slate-300 truncate">{u}</span>
                      <button
                        onClick={() => onScanUrl(u)}
                        className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Inspect in URL Engine</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Psychological Triggers & Red Flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Psychological Vectors */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Psychological Vectors &amp; Social Engineering Tactics
                </h4>
                {result.analysis.psychologicalTriggers.length === 0 ? (
                  <p className="text-xs text-slate-500">No coercion or psychological manipulation patterns found.</p>
                ) : (
                  <div className="space-y-2">
                    {result.analysis.psychologicalTriggers.map((trig, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-center gap-2.5 text-xs text-slate-200"
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                        <strong className="text-white font-mono">{trig}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Red Flag Quotes */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Specific Linguistic Deception Quotes
                </h4>
                {result.analysis.redFlags.length === 0 ? (
                  <p className="text-xs text-slate-500">No specific deceptive phrases flagged.</p>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {result.analysis.redFlags.map((rf, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-1 text-xs"
                      >
                        <div className="font-mono text-rose-300 italic border-l-2 border-rose-500 pl-2">
                          "{rf.quote}"
                        </div>
                        <p className="text-slate-400 text-[11px] pt-1">{rf.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Protocol Action */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  <strong className="text-white">Recommended Protocol: </strong>
                  {result.analysis.recommendedAction}
                </span>
              </div>
              <button
                onClick={handleCopyAnalysis}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium flex items-center gap-1.5 transition-colors self-end sm:self-center border border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
