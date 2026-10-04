import React, { useState } from 'react';
import {
  ShieldAlert, AlertTriangle, CheckCircle2, Lock, KeyRound,
  WifiOff, RefreshCw, Terminal, QrCode, FileWarning, HelpCircle
} from 'lucide-react';

export const BreachPlaybook: React.FC = () => {
  const [activeIncidentStep, setActiveIncidentStep] = useState<number>(1);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const incidentSteps = [
    {
      step: 1,
      title: 'Isolate & Sever Network Connectivity',
      subtitle: 'Immediate containment of automated payload staging',
      icon: WifiOff,
      action: 'Turn off Wi-Fi or disconnect Ethernet cable immediately if you downloaded an unexpected executable or entered administrator credentials. This blocks immediate Command & Control (C2) beaconing and data exfiltration.',
      checklist: [
        { id: 'step-1-1', label: 'Disconnect Wi-Fi / Ethernet on the affected endpoint' },
        { id: 'step-1-2', label: 'Do not restart computer if malware download is suspected (preserves RAM forensics)' },
      ]
    },
    {
      step: 2,
      title: 'Terminate Active Sessions & Rotate Credentials',
      subtitle: 'Neutralize harvested passwords and session tokens',
      icon: KeyRound,
      action: 'Using a separate, uncompromised device (e.g. your smartphone on cellular network), log into the legitimate account and execute "Log out of all active sessions". Then immediately update the account password.',
      checklist: [
        { id: 'step-2-1', label: 'Navigate to official service via separate trusted device' },
        { id: 'step-2-2', label: 'Force sign-out of all existing active sessions & remember-me tokens' },
        { id: 'step-2-3', label: 'Update primary account password with unique 16+ character passphrase' },
      ]
    },
    {
      step: 3,
      title: 'Audit Connected OAuth Apps & MFA Tokens',
      subtitle: 'Prevent persistent backdoor access',
      icon: Lock,
      action: 'Modern phishing kits often trigger an OAuth application consent dialog (Illicit Consent Grant) or prompt for MFA. Review connected third-party applications in Google, Microsoft, or GitHub settings and revoke any unfamiliar permissions.',
      checklist: [
        { id: 'step-3-1', label: 'Review third-party app authorizations (Google Account / Microsoft Entra ID)' },
        { id: 'step-3-2', label: 'Revoke unfamiliar OAuth application grants and API tokens' },
        { id: 'step-3-3', label: 'Switch from SMS 2FA to FIDO2 / Passkeys / Hardware Security Keys' },
      ]
    },
    {
      step: 4,
      title: 'Clear Session Storage & Report Incident',
      subtitle: 'Clean browser state and protect your peers',
      icon: ShieldAlert,
      action: 'Clear browser cookies and session storage for the targeted domain. Notify your IT / Security Operations Center (SOC) so they can block the adversary domain across the corporate firewall and email gateway.',
      checklist: [
        { id: 'step-4-1', label: 'Flush browser cookies and site storage for compromised domains' },
        { id: 'step-4-2', label: 'Submit malicious link and headers to company SOC / IT security' },
        { id: 'step-4-3', label: 'Report phishing URL to Google Safe Browsing and CISA / PhishTank' },
      ]
    }
  ];

  const threatArchetypes = [
    {
      title: 'AiTM (Adversary-in-the-Middle) Reverse Proxy Phishing',
      category: 'Session Token Theft',
      description: 'Attackers deploy transparent reverse proxies (e.g. Evilginx) between the victim and legitimate service. Even with SMS or Authenticator 2FA, the attacker intercepts the authenticated session cookie, bypassing MFA completely.',
      defense: 'Adopt FIDO2 / WebAuthn Passkeys and Hardware Security Keys (YubiKey), which are cryptographically bound to the real domain name and cannot be proxied.'
    },
    {
      title: 'Quishing (QR Code Phishing)',
      category: 'Mobile Vector',
      description: 'Attackers embed QR codes in emails, PDF attachments, or physical mail/parking meters. Scanning with a personal phone bypasses enterprise email security filters and endpoint monitors.',
      defense: 'Never scan unsolicited QR codes requesting account logins or payment. Verify URL in browser address bar before interacting.'
    },
    {
      title: 'Subdomain Stacking & Brand Lookalikes',
      category: 'Visual Deception',
      description: 'Attackers register names like "account-update.xyz" and create deep subdomains like "login.microsoft.com.account-update.xyz". On mobile screens, the address bar truncates the actual domain.',
      defense: 'Always inspect the registered apex domain (the last two segments before the first slash: e.g. "account-update.xyz", NOT the prefix).'
    },
    {
      title: 'Executive Impersonation (Business Email Compromise)',
      category: 'Social Engineering',
      description: 'Attackers impersonate executives, legal counsel, or vendors requesting urgent confidential wire transfers or payroll account rerouting, exploiting authority and artificial deadlines.',
      defense: 'Enforce mandatory dual-authorization and out-of-band phone/in-person verification for all wire requests and banking changes.'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Breach Prevention &amp; Emergency Incident Playbook</span>
          <span className="text-xs font-mono font-normal bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded">
            Incident Response Guide
          </span>
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Standard operating procedures for immediate post-click containment, credential neutralization, and defense against modern phishing vectors.
        </p>
      </div>

      {/* Emergency Response Flow */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Emergency Triage Protocol: "I Clicked a Suspicious Link"
          </h2>
        </div>

        {/* Step Selector Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 my-5">
          {incidentSteps.map((step) => {
            const Icon = step.icon;
            const isSelected = activeIncidentStep === step.step;
            return (
              <button
                key={step.step}
                onClick={() => setActiveIncidentStep(step.step)}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">Phase 0{step.step}</span>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                </div>
                <span className="text-xs font-semibold line-clamp-1">{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Step Detail */}
        {(() => {
          const current = incidentSteps.find(s => s.step === activeIncidentStep) || incidentSteps[0];
          const Icon = current.icon;
          return (
            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block">
                    Execution Phase {current.step} of 4
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{current.title}</h3>
                  <p className="text-xs text-slate-400">{current.subtitle}</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
                {current.action}
              </p>

              {/* Checklist */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Phase Checklist:
                </h4>
                {current.checklist.map((item) => (
                  <label
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className="flex items-center gap-3 p-2.5 bg-slate-900/80 border border-slate-800 rounded-md cursor-pointer hover:border-slate-700 transition-colors text-xs text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedItems[item.id]}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-950 border-slate-700"
                    />
                    <span className={checkedItems[item.id] ? 'line-through text-slate-500' : ''}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Anatomy of Modern Phishing Threats */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-base font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <span>Anatomy of Modern Phishing Threats</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {threatArchetypes.map((threat, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-950/70 border border-slate-800/90 rounded-lg space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-sm text-white">{threat.title}</h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {threat.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{threat.description}</p>
              <div className="pt-2 border-t border-slate-900 text-xs text-emerald-400">
                <strong className="text-slate-300">Defense: </strong>
                {threat.defense}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
