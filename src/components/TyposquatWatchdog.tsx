import React, { useState } from 'react';
import {
  Globe, Search, AlertTriangle, ShieldCheck, ArrowRight,
  ExternalLink, Copy, Check, RefreshCw, Lock
} from 'lucide-react';
import { TyposquatResponse, TyposquatVariant } from '../types/phishing';

interface TyposquatWatchdogProps {
  onScanUrl: (url: string) => void;
}

export const TyposquatWatchdog: React.FC<TyposquatWatchdogProps> = ({ onScanUrl }) => {
  const [domainInput, setDomainInput] = useState<string>('paypal.com');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TyposquatResponse | null>(null);
  const [copiedVariant, setCopiedVariant] = useState<string | null>(null);

  const handleGenerate = async (targetDomain?: string) => {
    const domain = (targetDomain || domainInput).trim();
    if (!domain) {
      setError('Please enter a target domain to inspect.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-typosquats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${response.status} failed.`);
      }

      const resJson: TyposquatResponse = await response.json();
      setData(resJson);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to generate typosquat analysis.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    handleGenerate('paypal.com');
  }, []);

  const handleCopy = (variant: string) => {
    navigator.clipboard.writeText(variant);
    setCopiedVariant(variant);
    setTimeout(() => setCopiedVariant(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Brand Typosquat &amp; Lookalike Watchdog</span>
              <span className="text-xs font-mono font-normal bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded">
                Domain Defense Matrix
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Simulate how adversaries weaponize typosquatting, IDN homoglyphs, and domain stacking against your brand to launch deceptive campaigns.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Algorithmic Lookalike Engine</span>
          </div>
        </div>

        {/* Input Bar */}
        <div className="mt-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Globe className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="Enter apex domain to audit (e.g. microsoft.com, chase.com, acmeco.com)..."
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-lg text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Matrix...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Audit Brand Stems</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Targets */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400">Quick Audit Samples:</span>
            {['paypal.com', 'microsoft.com', 'chase.com', 'apple.com', 'netflix.com'].map((dom) => (
              <button
                key={dom}
                onClick={() => {
                  setDomainInput(dom);
                  handleGenerate(dom);
                }}
                className="px-2.5 py-1 bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white rounded font-mono transition-all"
              >
                {dom}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-3 p-3 bg-rose-950/70 border border-rose-800 text-rose-300 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Results Matrix */}
      {data && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Adversary Attack Matrix for:</span>
                  <span className="font-mono text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {data.originalDomain}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Generated {data.totalVariants} weaponizable permutation vectors commonly targeted by cybercriminal syndicates.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800">
                  Total Attack Vectors: <strong className="text-white">{data.totalVariants}</strong>
                </span>
              </div>
            </div>

            {/* Variants Grid */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.variants.map((v: TyposquatVariant, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg flex flex-col justify-between hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-rose-300">
                          {v.variant}
                        </span>
                        {v.isHomoglyph && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800">
                            PUNYCODE
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Technique: <strong className="text-slate-200">{v.technique}</strong>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-rose-400">
                        {v.riskScore}%
                      </span>
                      <span className="text-[10px] text-slate-500 block">Risk</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400">{v.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                    <button
                      onClick={() => handleCopy(v.variant)}
                      className="text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono transition-colors"
                    >
                      {copiedVariant === v.variant ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onScanUrl(`https://${v.variant}/login`)}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
                    >
                      <span>Analyze in URL Detector</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Defensive Playbook Callout */}
            <div className="mt-6 p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 space-y-1">
                <h4 className="font-semibold text-white">Brand Protection &amp; Anti-Spoofing Protocol:</h4>
                <p>
                  1. Preemptively register common defensive homoglyphs and top typo variations.
                </p>
                <p>
                  2. Enforce strict DMARC policy (<code className="font-mono text-emerald-400">p=reject</code>), SPF, and DKIM to prevent direct email sender spoofing.
                </p>
                <p>
                  3. Set up Certificate Transparency (CT) log alerts to detect fraudulent SSL certificates issued for lookalike variations of your company.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
