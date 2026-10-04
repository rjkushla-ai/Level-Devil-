import React, { useState } from 'react';
import {
  Search, AlertTriangle, CheckCircle2, XCircle, ShieldAlert,
  Copy, Check, ArrowRight, ExternalLink, RefreshCw, Cpu, Layers, Sparkles
} from 'lucide-react';
import { SAMPLE_URLS, SampleUrl } from '../data/samples';
import { UrlAnalysisResponse, ThreatIndicator } from '../types/phishing';

interface UrlScannerProps {
  initialUrl?: string | null;
  onInspectInMessage?: (url: string) => void;
}

export const UrlScanner: React.FC<UrlScannerProps> = ({ initialUrl }) => {
  const [inputUrl, setInputUrl] = useState<string>(initialUrl || 'https://раypal.com/webscr/login-verify');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UrlAnalysisResponse | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const handleScan = async (urlToScan?: string) => {
    const target = (urlToScan || inputUrl).trim();
    if (!target) {
      setError('Please provide a URL to evaluate.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status} evaluation failed.`);
      }

      const data: UrlAnalysisResponse = await response.json();
      setResult(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to analyze URL.');
    } finally {
      setLoading(false);
    }
  };

  // Run initial scan on mount
  React.useEffect(() => {
    handleScan(inputUrl);
  }, []);

  const handleSelectSample = (sample: SampleUrl) => {
    setInputUrl(sample.url);
    handleScan(sample.url);
  };

  const handleCopyReport = () => {
    if (!result) return;
    const reportText = `[PhishGuard AI Audit Report]
URL: ${inputUrl}
Threat Verdict: ${result.analysis.verdict} (Risk Score: ${result.analysis.riskScore}/100)
Threat Category: ${result.analysis.threatType}
Confidence: ${result.analysis.confidence}%
Impersonated Brand: ${result.analysis.impersonatedBrand || 'None identified'}
Analysis Engine: ${result.source}

Vector Breakdown:
- Brand Spoofing: ${result.analysis.vectorScores.brandSpoofing}/100
- Credential Harvesting: ${result.analysis.vectorScores.credentialHarvesting}/100
- Technical Deception: ${result.analysis.vectorScores.technicalDeception}/100
- Social Engineering: ${result.analysis.vectorScores.socialEngineering}/100
- Domain Reputation: ${result.analysis.vectorScores.domainReputation}/100

Key Forensic Indicators:
${result.analysis.indicators.map((ind: ThreatIndicator) => `- [${ind.severity.toUpperCase()}] ${ind.title}: ${ind.description} (Evidence: ${ind.evidence})`).join('\n')}

Actionable Recommendation:
${result.analysis.safeBrowsingAdvice}
`;
    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'BENIGN':
        return {
          badge: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400',
          gauge: 'text-emerald-400 stroke-emerald-400',
          title: 'BENIGN / SAFE',
          desc: 'Verified legitimate structure with no structural or neural anomalies detected.',
          icon: CheckCircle2,
          color: '#10b981',
        };
      case 'SUSPICIOUS':
        return {
          badge: 'bg-amber-950/80 border-amber-500/40 text-amber-400',
          gauge: 'text-amber-400 stroke-amber-400',
          title: 'SUSPICIOUS ANOMALY',
          desc: 'Exhibits several deceptive patterns, unverified host structures, or keyword lures.',
          icon: AlertTriangle,
          color: '#f59e0b',
        };
      case 'MALICIOUS':
        return {
          badge: 'bg-orange-950/80 border-orange-500/40 text-orange-400',
          gauge: 'text-orange-400 stroke-orange-400',
          title: 'MALICIOUS THREAT',
          desc: 'High probability of active credential interception or brand spoofing.',
          icon: AlertTriangle,
          color: '#f97316',
        };
      case 'CRITICAL_PHISH':
      default:
        return {
          badge: 'bg-rose-950/80 border-rose-500/50 text-rose-400',
          gauge: 'text-rose-500 stroke-rose-500',
          title: 'CRITICAL PHISHING ATTACK',
          desc: 'Weaponized deceptive link designed to harvest credentials or compromise system.',
          icon: XCircle,
          color: '#ef4444',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Deep URL Threat &amp; Phishing Detector</span>
              <span className="text-xs font-mono font-normal bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded">
                Neural + Lexical ML
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Inspect suspicious links for IDN homoglyphs, brand spoofing, subdomain stacking, deceptive redirects, and credential harvesting vectors.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Gemini 3.8 Flash Threat Model</span>
          </div>
        </div>

        {/* Input Bar */}
        <div className="mt-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleScan();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste or enter any website address (e.g. https://login.microsoft.com.portal-auth.xyz)..."
                className="w-full pl-11 pr-24 py-3 bg-slate-950 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-xs sm:text-sm"
              />
              <button
                type="button"
                onClick={async () => {
                  try {
                    const clip = await navigator.clipboard.readText();
                    if (clip) {
                      setInputUrl(clip);
                      handleScan(clip);
                    }
                  } catch {
                    // Clipboard permission fallback
                  }
                }}
                className="absolute inset-y-1.5 right-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono flex items-center gap-1 transition-colors"
                title="Paste from clipboard"
              >
                <span>Paste</span>
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning Threat Vectors...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Analyze Threat</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-3 p-3 bg-rose-950/70 border border-rose-800 text-rose-300 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Quick Sample Library */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Quick Test Attack Scenarios:
            </span>
            <span className="text-[11px] text-slate-500">1-click automated load &amp; scan</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_URLS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(sample)}
                className={`text-xs px-2.5 py-1.5 rounded-md border font-mono transition-all text-left flex items-center gap-2 ${
                  sample.expectedThreat === 'Safe'
                    ? 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-emerald-600/50 hover:text-emerald-400'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-rose-600/50 hover:text-rose-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    sample.expectedThreat === 'Safe' ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                <span className="font-sans font-medium">{sample.name}</span>
                <span className="text-slate-500 text-[10px]">({sample.vector})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && !result && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 animate-spin">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-white">Deconstructing URL &amp; Querying Neural Threat Engine</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Computing Shannon entropy, testing IDN homoglyphs, validating registrar apex, and running multi-vector machine learning inference...
          </p>
        </div>
      )}

      {/* Analysis Result */}
      {result && (
        <div className="space-y-6">
          {/* Main Verdict Card */}
          {(() => {
            const verdictStyle = getVerdictStyle(result.analysis.verdict);
            const VerdictIcon = verdictStyle.icon;
            const score = result.analysis.riskScore;

            return (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                {/* Top Alert Banner */}
                <div className={`p-6 border-b border-slate-800 ${verdictStyle.badge}`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-current shadow-md">
                        <VerdictIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xl sm:text-2xl font-bold tracking-tight">
                            {verdictStyle.title}
                          </span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950/80 border border-current">
                            Confidence: {result.analysis.confidence}%
                          </span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950/80 border border-current">
                            Engine: {result.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Lexical Heuristics'}
                          </span>
                        </div>
                        <p className="text-sm mt-1 text-slate-200">
                          {result.analysis.summary}
                        </p>
                        {result.analysis.impersonatedBrand && (
                          <div className="mt-2 text-xs font-medium text-rose-300 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Impersonation Detected: Target brand appears to be <strong>{result.analysis.impersonatedBrand.toUpperCase()}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Threat Score Radial / Stat Display */}
                    <div className="flex items-center gap-6 self-start lg:self-center bg-slate-950/90 border border-slate-800 p-4 rounded-xl min-w-[200px] justify-between">
                      <div>
                        <span className="text-xs text-slate-400 font-mono block">THREAT RISK SCORE</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-3xl font-extrabold font-mono text-white">
                            {score}
                          </span>
                          <span className="text-slate-500 text-xs font-mono">/ 100</span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400">
                          {result.analysis.threatType}
                        </span>
                      </div>
                      <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-800"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className={verdictStyle.gauge}
                            strokeDasharray={`${score}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="absolute text-xs font-bold font-mono text-white">
                          {score}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Educational URL Deconstruction Inspector */}
                <div className="p-6 bg-slate-950/50 border-b border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>URL Structural Deconstruction (Phishing Anatomy)</span>
                    </h3>
                    <span className="text-xs text-slate-500">How the browser routes this request</span>
                  </div>

                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3 font-mono text-xs">
                    {/* Visual Segment Tokens */}
                    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950 rounded border border-slate-800/80 overflow-x-auto">
                      {/* Protocol */}
                      <span className={`px-2 py-1 rounded text-[11px] ${result.features.isHttps ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50' : 'bg-rose-950/80 text-rose-300 border border-rose-800/50'}`}>
                        {result.features.isHttps ? 'https://' : 'http:// (INSECURE)'}
                      </span>

                      {/* Subdomain Stacking if present */}
                      {result.features.subdomains && (
                        <span className="px-2 py-1 rounded text-[11px] bg-amber-950/80 text-amber-300 border border-amber-800/50">
                          {result.features.subdomains}.
                        </span>
                      )}

                      {/* Registered Apex Domain (THE CRITICAL ELEMENT) */}
                      <span className="px-2 py-1 rounded text-[11px] bg-purple-950/80 text-purple-200 border border-purple-700/60 font-bold">
                        {result.features.registeredDomain || result.features.hostname}
                      </span>

                      {/* Path & Query */}
                      {result.features.pathname && (
                        <span className="px-2 py-1 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                          {result.features.pathname}
                        </span>
                      )}
                    </div>

                    {/* Explanatory Callout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-[11px]">
                      <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 block">Actual Registered Apex:</span>
                        <strong className="text-purple-300 text-xs break-all">{result.features.registeredDomain || result.features.hostname}</strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">The entity that controls the server</span>
                      </div>
                      <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 block">Shannon Entropy:</span>
                        <strong className="text-slate-200 text-xs">{result.features.entropy} bits</strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {result.features.entropy > 4 ? 'High randomness (DGA/Phish)' : 'Normal lexical pattern'}
                        </span>
                      </div>
                      <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 block">Homoglyphs / Punycode:</span>
                        <strong className={result.features.hasHomoglyphs ? 'text-rose-400 text-xs' : 'text-emerald-400 text-xs'}>
                          {result.features.hasHomoglyphs ? `Spoofed chars: ${result.features.homoglyphs.join(' ')}` : 'None detected'}
                        </strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {result.features.hasHomoglyphs ? 'IDN homograph attack alert' : 'Standard Latin alphabet'}
                        </span>
                      </div>
                      <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 block">Host Format:</span>
                        <strong className={result.features.hasIpHost ? 'text-rose-400 text-xs' : 'text-slate-300 text-xs'}>
                          {result.features.hasIpHost ? 'Raw IP address' : `TLD .${result.features.tld || 'com'}`}
                        </strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {result.features.suspiciousTld ? 'High-abuse registry' : 'Standard registry'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vector Scores & Forensic Indicators Grid */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Multi-Vector Threat Radar/Bar Breakdown */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      <span>Machine Learning Threat Vector Breakdown</span>
                    </h3>

                    <div className="space-y-3.5 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                      {[
                        { label: 'Brand Impersonation / Typosquatting', score: result.analysis.vectorScores.brandSpoofing },
                        { label: 'Credential Harvesting Risk', score: result.analysis.vectorScores.credentialHarvesting },
                        { label: 'Technical Deception (Homoglyphs/Entropy)', score: result.analysis.vectorScores.technicalDeception },
                        { label: 'Social Engineering Urgency', score: result.analysis.vectorScores.socialEngineering },
                        { label: 'Domain Host Reputation Risk', score: result.analysis.vectorScores.domainReputation },
                      ].map((vec, i) => {
                        const getColor = (s: number) => {
                          if (s >= 70) return 'bg-rose-500';
                          if (s >= 40) return 'bg-amber-500';
                          return 'bg-emerald-500';
                        };
                        return (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-slate-300">{vec.label}</span>
                              <span className="font-bold text-slate-200">{vec.score}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getColor(vec.score)} transition-all duration-700`}
                                style={{ width: `${Math.max(4, vec.score)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Forensic Indicators List */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-emerald-400" />
                      <span>Forensic Threat Indicators ({result.analysis.indicators.length})</span>
                    </h3>

                    <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                      {result.analysis.indicators.length === 0 ? (
                        <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                          No deceptive indicators or structural red flags identified for this address.
                        </div>
                      ) : (
                        result.analysis.indicators.map((ind, i) => {
                          const badgeColor =
                            ind.severity === 'critical'
                              ? 'bg-rose-950/90 text-rose-300 border-rose-800'
                              : ind.severity === 'high'
                              ? 'bg-orange-950/90 text-orange-300 border-orange-800'
                              : ind.severity === 'medium'
                              ? 'bg-amber-950/90 text-amber-300 border-amber-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700';

                          return (
                            <div
                              key={i}
                              className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg space-y-1 hover:border-slate-700 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{ind.title}</span>
                                </span>
                                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${badgeColor}`}>
                                  {ind.severity}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">{ind.description}</p>
                              {ind.evidence && (
                                <div className="text-[11px] font-mono text-slate-500 bg-slate-900/90 px-2 py-1 rounded border border-slate-800 break-all">
                                  Evidence: {ind.evidence}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Safe Browsing & Defense Recommendation Bar */}
                <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      <strong className="text-white">Security Action: </strong>
                      {result.analysis.safeBrowsingAdvice}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={handleCopyReport}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      {copiedReport ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Report Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Audit Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
