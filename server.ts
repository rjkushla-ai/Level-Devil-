import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '2mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI();
}

// Top target brands commonly abused in phishing
const KNOWN_BRANDS = [
  'paypal', 'microsoft', 'office365', 'apple', 'google', 'gmail', 'amazon',
  'netflix', 'chase', 'wellsfargo', 'bankofamerica', 'citibank', 'usps',
  'dhl', 'fedex', 'ups', 'meta', 'facebook', 'instagram', 'whatsapp',
  'linkedin', 'twitter', 'x', 'coinbase', 'binance', 'metamask', 'dropbox',
  'onedrive', 'docusign', 'adobe', 'steam', 'roblox', 'yahoo', 'outlook',
  'irs', 'hmrc', 'att', 'verizon', 'tmobile', 'ebay', 'walmart', 'target'
];

// Shannon Entropy calculation for domain randomness
function calculateShannonEntropy(str: string): number {
  if (!str) return 0;
  const frequencies = new Map<string, number>();
  for (const char of str) {
    frequencies.set(char, (frequencies.get(char) || 0) + 1);
  }
  let entropy = 0;
  const len = str.length;
  for (const count of frequencies.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(3));
}

// Check for homoglyphs / non-ASCII Cyrillic / Greek spoofing characters
function detectHomoglyphs(str: string): { hasHomoglyphs: boolean; homoglyphs: string[] } {
  const suspiciousChars: string[] = [];
  const lookalikeRegex = /[\u0400-\u04FF\u0370-\u03FF]/g;
  let match;
  while ((match = lookalikeRegex.exec(str)) !== null) {
    suspiciousChars.push(match[0]);
  }
  return {
    hasHomoglyphs: suspiciousChars.length > 0,
    homoglyphs: Array.from(new Set(suspiciousChars)),
  };
}

// Extract lexical and structural features of the URL
function extractUrlFeatures(rawUrl: string) {
  let normalized = rawUrl.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return {
      isValid: false,
      normalized,
      hostname: '',
      pathname: '',
      entropy: 0,
      hasIpHost: false,
      isHttps: false,
      hasAtSymbol: false,
      subdomainCount: 0,
      subdomains: '',
      registeredDomain: '',
      tld: '',
      homoglyphs: [],
      hasHomoglyphs: false,
      targetedBrand: null,
      suspiciousTld: false,
      suspiciousKeywords: [],
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();
  const search = parsed.search.toLowerCase();
  const fullPath = pathname + search;

  const entropy = calculateShannonEntropy(hostname);
  const { hasHomoglyphs, homoglyphs } = detectHomoglyphs(hostname);

  const isIpv4 = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
  const isIpv6 = /^\[?[a-f0-9:]+\]?$/i.test(hostname) && hostname.includes(':');
  const hasIpHost = isIpv4 || isIpv6;

  const hostParts = hostname.split('.');
  const tld = hostParts.slice(-1)[0] || '';
  const registeredDomain = hostParts.length >= 2 ? hostParts.slice(-2).join('.') : hostname;
  const subdomains = hostParts.length > 2 ? hostParts.slice(0, -2).join('.') : '';
  const subdomainCount = hostParts.length > 2 ? hostParts.length - 2 : 0;

  const highRiskTlds = new Set(['xyz', 'top', 'work', 'icu', 'buzz', 'fit', 'live', 'gq', 'cf', 'ml', 'tk', 'ga', 'country', 'stream', 'download', 'win', 'bid', 'click', 'link']);
  const suspiciousTld = highRiskTlds.has(tld);

  let targetedBrand: string | null = null;
  for (const brand of KNOWN_BRANDS) {
    const brandInHost = hostname.includes(brand);
    const brandIsReg = registeredDomain.startsWith(brand + '.');

    if (brandInHost && !brandIsReg) {
      targetedBrand = brand;
      break;
    } else if (fullPath.includes(brand) && !brandIsReg && (fullPath.includes('login') || fullPath.includes('verify') || fullPath.includes('auth'))) {
      targetedBrand = brand;
      break;
    }
  }

  const riskKeywords = [
    'login', 'signin', 'verify', 'verification', 'secure', 'account', 'banking',
    'suspended', 'update-billing', 'security-alert', 'wallet', 'unlock', 'recover',
    'password-reset', 'confirm-identity', 'auth', 'webscr', 'session-id', 'kyc'
  ];
  const detectedKeywords = riskKeywords.filter(k => fullPath.includes(k) || hostname.includes(k));

  return {
    isValid: true,
    normalized,
    hostname,
    pathname,
    entropy,
    hasIpHost,
    isHttps: parsed.protocol === 'https:',
    hasAtSymbol: rawUrl.includes('@'),
    hasDoubleSlashInPath: parsed.pathname.includes('//'),
    subdomainCount,
    subdomains,
    registeredDomain,
    tld,
    homoglyphs,
    hasHomoglyphs,
    targetedBrand,
    suspiciousTld,
    suspiciousKeywords: detectedKeywords,
  };
}

function calculateHeuristicScore(features: ReturnType<typeof extractUrlFeatures>) {
  if (!features.isValid) {
    return {
      riskScore: 85,
      verdict: 'SUSPICIOUS',
      confidence: 70,
      threatType: 'Malformed / Deceptive URL Format',
      impersonatedBrand: null,
      summary: 'URL structure is malformed or uses deceptive syntax intended to evade standard browser URL validation.',
      vectorScores: {
        brandSpoofing: 40,
        credentialHarvesting: 50,
        socialEngineering: 45,
        technicalDeception: 90,
        domainReputation: 75,
      },
      indicators: [
        { severity: 'high', title: 'Malformed URL Structure', description: 'The provided address fails standard URI specification.', evidence: 'Invalid URI parser state' }
      ],
      safeBrowsingAdvice: 'Avoid opening unparseable URLs. Modern attackers exploit parser differential bugs to bypass browser protections.'
    };
  }

  let score = 5;
  const indicators: Array<{ severity: 'low' | 'medium' | 'high' | 'critical'; title: string; description: string; evidence: string }> = [];

  const cleanTopDomains = ['google.com', 'microsoft.com', 'apple.com', 'github.com', 'amazon.com', 'youtube.com', 'wikipedia.org', 'cloudflare.com', 'mozilla.org'];
  if (cleanTopDomains.includes(features.registeredDomain) && !features.hasHomoglyphs && !features.hasAtSymbol) {
    return {
      riskScore: 4,
      verdict: 'BENIGN',
      confidence: 96,
      threatType: 'Legitimate Verified Domain',
      impersonatedBrand: null,
      summary: `Domain belongs to verified entity (${features.registeredDomain}) with established reputation and secure TLS structure.`,
      vectorScores: {
        brandSpoofing: 0,
        credentialHarvesting: 0,
        socialEngineering: 0,
        technicalDeception: 0,
        domainReputation: 5,
      },
      indicators: [
        { severity: 'low', title: 'Verified Apex Domain', description: 'The domain matches a known, high-reputation enterprise root.', evidence: features.registeredDomain }
      ],
      safeBrowsingAdvice: 'Standard browsing precautions apply. Always verify SSL lock and 2FA credentials.'
    };
  }

  if (features.hasHomoglyphs) {
    score += 45;
    indicators.push({
      severity: 'critical',
      title: 'Punycode / Cyrillic Homoglyph Spoofing',
      description: 'Contains non-Latin lookalike characters mimicking Latin letters (IDN homograph attack).',
      evidence: `Chars: ${features.homoglyphs.join(', ')}`
    });
  }

  if (features.targetedBrand) {
    score += 40;
    indicators.push({
      severity: 'critical',
      title: `Brand Impersonation (${features.targetedBrand.toUpperCase()})`,
      description: `Domain or subpath references brand '${features.targetedBrand}', but registered apex is '${features.registeredDomain}'.`,
      evidence: `Apex: ${features.registeredDomain} vs Brand: ${features.targetedBrand}`
    });
  }

  if (features.hasIpHost) {
    score += 35;
    indicators.push({
      severity: 'high',
      title: 'Raw IP Address Host',
      description: 'Host is an IP address instead of a registered domain, common in phishing staging and botnet C2 servers.',
      evidence: features.hostname
    });
  }

  if (features.hasAtSymbol) {
    score += 35;
    indicators.push({
      severity: 'high',
      title: 'Embedded Authentication Syntax (@)',
      description: 'Uses user-info delimiter (@) to fool users regarding the true destination host.',
      evidence: '@ symbol detected in URL authority section'
    });
  }

  if (features.subdomainCount >= 3) {
    score += 20;
    indicators.push({
      severity: 'medium',
      title: 'Deep Subdomain Stacking',
      description: 'Excessive subdomain nesting designed to push the real domain off-screen in mobile address bars.',
      evidence: `${features.subdomainCount} subdomains: ${features.subdomains}`
    });
  }

  if (features.entropy > 4.2) {
    score += 25;
    indicators.push({
      severity: 'high',
      title: 'High Shannon Entropy Domain',
      description: `Domain has high character randomness (${features.entropy.toFixed(2)}), characteristic of Domain Generation Algorithms (DGA) or disposable throwaway domains.`,
      evidence: `Entropy: ${features.entropy}`
    });
  }

  if (features.suspiciousTld) {
    score += 15;
    indicators.push({
      severity: 'medium',
      title: 'High-Abuse Top Level Domain',
      description: `The .${features.tld} extension has disproportionately high spam/abuse rates in public threat intelligence feeds.`,
      evidence: `TLD: .${features.tld}`
    });
  }

  if (features.suspiciousKeywords.length > 0) {
    score += Math.min(25, features.suspiciousKeywords.length * 10);
    indicators.push({
      severity: 'medium',
      title: 'Credential Harvesting Path Keywords',
      description: 'Contains sensitive authentication and verification keywords in the URI path.',
      evidence: features.suspiciousKeywords.join(', ')
    });
  }

  if (!features.isHttps) {
    score += 15;
    indicators.push({
      severity: 'medium',
      title: 'Unencrypted HTTP Protocol',
      description: 'Site does not enforce TLS encryption, exposing any submitted data to adversary interception.',
      evidence: 'Protocol: http://'
    });
  }

  const finalScore = Math.min(99, Math.max(2, score));
  let verdict: 'BENIGN' | 'SUSPICIOUS' | 'MALICIOUS' | 'CRITICAL_PHISH' = 'BENIGN';
  if (finalScore >= 75) verdict = 'CRITICAL_PHISH';
  else if (finalScore >= 50) verdict = 'MALICIOUS';
  else if (finalScore >= 25) verdict = 'SUSPICIOUS';

  let threatType = 'Standard Low Risk';
  if (features.targetedBrand) threatType = 'Brand Impersonation & Credential Harvesting';
  else if (features.hasHomoglyphs) threatType = 'IDN Homograph Attack (Lookalike Domain)';
  else if (features.hasIpHost) threatType = 'Direct IP Phishing Staging Host';
  else if (finalScore >= 50) threatType = 'Heuristic Phishing Vector';

  return {
    riskScore: finalScore,
    verdict,
    confidence: 88,
    threatType,
    impersonatedBrand: features.targetedBrand,
    summary: indicators.length > 0
      ? `Identified ${indicators.length} structural risk indicators including ${indicators[0].title.toLowerCase()}.`
      : 'No significant structural phishing indicators detected by heuristic lexical engine.',
    vectorScores: {
      brandSpoofing: features.targetedBrand ? 88 : 5,
      credentialHarvesting: features.suspiciousKeywords.length > 0 ? 75 : 10,
      socialEngineering: features.targetedBrand || features.suspiciousKeywords.length > 0 ? 70 : 10,
      technicalDeception: Math.min(95, (features.hasHomoglyphs ? 50 : 0) + (features.entropy > 4 ? 30 : 0) + (features.hasIpHost ? 20 : 0)),
      domainReputation: features.suspiciousTld ? 75 : (finalScore > 50 ? 65 : 15),
    },
    indicators,
    safeBrowsingAdvice: finalScore > 40
      ? 'Do NOT enter passwords, phone numbers, or credit card credentials. Do NOT download files from this site.'
      : 'URL appears standard, but exercise vigilance if prompted for unexpected credentials.'
  };
}

// POST /api/analyze-url
app.post('/api/analyze-url', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Valid URL string is required.' });
  }

  const features = extractUrlFeatures(url);
  const heuristicResult = calculateHeuristicScore(features);

  if (ai) {
    try {
      const prompt = `You are an elite cybersecurity threat analyst and machine learning classification system specializing in anti-phishing, typosquatting, credential harvesting, and deceptive URL detection.

Analyze the following URL and extracted structural features:
- Target URL: "${url}"
- Normalized URL: "${features.normalized}"
- Hostname: "${features.hostname}"
- Registered Apex Domain: "${features.registeredDomain}"
- Subdomains: "${features.subdomains}" (Count: ${features.subdomainCount})
- Shannon Entropy: ${features.entropy}
- Homoglyphs Detected: ${features.hasHomoglyphs ? JSON.stringify(features.homoglyphs) : 'None'}
- Uses Raw IP Host: ${features.hasIpHost}
- Protocol: ${features.isHttps ? 'HTTPS' : 'HTTP'}
- Sensitive Keywords in Path/Host: ${JSON.stringify(features.suspiciousKeywords)}
- Targeted Brand Flagged: ${features.targetedBrand || 'None identified'}

Perform deep multi-vector threat inspection:
1. Brand Impersonation / Typosquatting (is it mimicking PayPal, Microsoft 365, Google, Apple, Chase, etc.?)
2. Technical Deception (Punycode, IDN homoglyphs, deep subdomains, excessive entropy, userinfo @ tricks)
3. Credential Harvesting & Malicious Intent (login, verification, token steal, bank alert bait)
4. Overall Risk Score from 0 to 100 (0-20 = Safe/Benign, 21-49 = Suspicious, 50-74 = Malicious, 75-100 = Critical Phish)
5. Explainability indicators and actionable defense recommendations.

Respond strictly in the requested JSON schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: { type: Type.INTEGER, description: 'Threat score from 0 (completely safe) to 100 (critical active phishing site)' },
              verdict: { type: Type.STRING, enum: ['BENIGN', 'SUSPICIOUS', 'MALICIOUS', 'CRITICAL_PHISH'], description: 'Verdict classification' },
              confidence: { type: Type.INTEGER, description: 'Model confidence score 0 to 100' },
              threatType: { type: Type.STRING, description: 'Primary threat category or "Legitimate Service"' },
              impersonatedBrand: { type: Type.STRING, description: 'Brand being impersonated if any, or empty string' },
              summary: { type: Type.STRING, description: 'Concise 2-sentence threat intelligence summary' },
              vectorScores: {
                type: Type.OBJECT,
                properties: {
                  brandSpoofing: { type: Type.INTEGER },
                  credentialHarvesting: { type: Type.INTEGER },
                  socialEngineering: { type: Type.INTEGER },
                  technicalDeception: { type: Type.INTEGER },
                  domainReputation: { type: Type.INTEGER },
                },
                required: ['brandSpoofing', 'credentialHarvesting', 'socialEngineering', 'technicalDeception', 'domainReputation']
              },
              indicators: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    evidence: { type: Type.STRING },
                  },
                  required: ['severity', 'title', 'description', 'evidence']
                }
              },
              safeBrowsingAdvice: { type: Type.STRING, description: 'Immediate user protection instructions' },
            },
            required: ['riskScore', 'verdict', 'confidence', 'threatType', 'summary', 'vectorScores', 'indicators', 'safeBrowsingAdvice']
          }
        }
      });

      const parsedJson = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        source: 'gemini-3.8-flash',
        features,
        analysis: {
          ...parsedJson,
          impersonatedBrand: parsedJson.impersonatedBrand || features.targetedBrand || null,
        }
      });
    } catch (err: unknown) {
      console.warn('Gemini analysis fallback to heuristic engine:', (err as Error).message);
    }
  }

  return res.json({
    success: true,
    source: 'heuristic-engine',
    features,
    analysis: heuristicResult,
  });
});

// POST /api/analyze-message
app.post('/api/analyze-message', async (req, res) => {
  const { message, sender } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  const urlRegex = /(?:https?:\/\/|www\.)[^\s"'>]+/gi;
  const extractedUrls = (message.match(urlRegex) || []).map(u => u.replace(/[.,;!?]+$/, ''));

  const urgencyTriggers = [
    'immediately', 'suspended', '24 hours', 'urgent action', 'unauthorized transaction',
    'security breach', 'wire transfer', 'gift card', 'payroll update', 'verify your identity',
    'account locked', 'legal notice', 'arrest warrant', 'refund approved', 'mfa reset'
  ];
  const detectedTriggers = urgencyTriggers.filter(t => message.toLowerCase().includes(t));

  if (ai) {
    try {
      const prompt = `Analyze this message (email, SMS, or direct communication) for social engineering and phishing vectors:
Sender metadata: "${sender || 'Unknown'}"
Message content:
"""
${message}
"""
Extracted URLs: ${JSON.stringify(extractedUrls)}

Identify:
1. Psychological manipulation vectors (Urgency, Authority, Fear, Greed, Social Proof)
2. Inconsistencies between claimed sender and links or content
3. Overall Phishing Probability score (0-100)
4. Specific red flag quotes with explanations
5. Safe response protocol.

Respond strictly in the requested JSON schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              threatScore: { type: Type.INTEGER },
              verdict: { type: Type.STRING, enum: ['SAFE', 'SUSPICIOUS', 'HIGH_RISK_PHISH'] },
              attackCategory: { type: Type.STRING, description: 'e.g. CEO Fraud / BEC, Smishing, Credential Harvest, Fake Invoice' },
              psychologicalTriggers: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              redFlags: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    quote: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ['medium', 'high', 'critical'] }
                  },
                  required: ['quote', 'reason', 'severity']
                }
              },
              summary: { type: Type.STRING },
              recommendedAction: { type: Type.STRING }
            },
            required: ['threatScore', 'verdict', 'attackCategory', 'psychologicalTriggers', 'redFlags', 'summary', 'recommendedAction']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        source: 'gemini-3.8-flash',
        extractedUrls,
        analysis: parsed
      });
    } catch (err: unknown) {
      console.warn('Gemini message analysis fallback:', (err as Error).message);
    }
  }

  const isHighRisk = detectedTriggers.length >= 2 || extractedUrls.length > 0;
  const score = Math.min(95, detectedTriggers.length * 28 + (extractedUrls.length > 0 ? 30 : 0));
  return res.json({
    success: true,
    source: 'heuristic-engine',
    extractedUrls,
    analysis: {
      threatScore: score,
      verdict: score >= 60 ? 'HIGH_RISK_PHISH' : (score >= 30 ? 'SUSPICIOUS' : 'SAFE'),
      attackCategory: isHighRisk ? 'Urgency-Driven Social Engineering' : 'Standard Communication',
      psychologicalTriggers: detectedTriggers,
      redFlags: detectedTriggers.map(t => ({
        quote: t,
        reason: 'Common artificial deadline/coercion cue used in deceptive pretexts.',
        severity: 'high'
      })),
      summary: detectedTriggers.length > 0
        ? `Found ${detectedTriggers.length} urgency triggers frequently paired with phishing campaigns.`
        : 'No obvious urgency or coercion patterns detected in message body.',
      recommendedAction: score >= 50
        ? 'Do not reply, do not click links. Verify sender via independent out-of-band channel (e.g. official phone directory).'
        : 'Verify any requested credentials or account actions with the purported sender.'
    }
  });
});

// POST /api/generate-typosquats
app.post('/api/generate-typosquats', (req, res) => {
  const { domain } = req.body;
  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'Valid domain string is required.' });
  }

  const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const parts = clean.split('.');
  if (parts.length < 2) {
    return res.status(400).json({ error: 'Please enter a full domain (e.g. paypal.com).' });
  }

  const name = parts[0];
  const tld = parts.slice(1).join('.');

  const variants: Array<{
    variant: string;
    technique: string;
    riskScore: number;
    description: string;
    isHomoglyph: boolean;
  }> = [];

  const homoglyphMap: Record<string, string> = {
    a: '\u0430',
    o: '\u043e',
    e: '\u0435',
    p: '\u0440',
    c: '\u0441',
    y: '\u0443',
    x: '\u0445',
    i: '\u0456',
  };

  for (const [latin, cyrillic] of Object.entries(homoglyphMap)) {
    if (name.includes(latin)) {
      const spoofed = name.replace(new RegExp(latin, 'g'), cyrillic);
      variants.push({
        variant: `${spoofed}.${tld}`,
        technique: 'IDN Homograph Spoof',
        riskScore: 98,
        description: `Substitutes Latin '${latin}' with visually identical Cyrillic '${cyrillic}' character.`,
        isHomoglyph: true,
      });
      break;
    }
  }

  if (name.length > 3) {
    const omitted = name.slice(0, 1) + name.slice(2);
    variants.push({
      variant: `${omitted}.${tld}`,
      technique: 'Character Omission',
      riskScore: 78,
      description: 'Omits internal character relying on fast typing errors.',
      isHomoglyph: false,
    });
  }

  const doubled = name.slice(0, 2) + name[1] + name.slice(2);
  variants.push({
    variant: `${doubled}.${tld}`,
    technique: 'Character Repetition',
    riskScore: 74,
    description: 'Repeats a common key press.',
    isHomoglyph: false,
  });

  if (name.includes('o')) {
    variants.push({
      variant: `${name.replace(/o/g, '0')}.${tld}`,
      technique: 'Numeral Substitution (o -> 0)',
      riskScore: 88,
      description: 'Replaces letter "o" with number "0".',
      isHomoglyph: false,
    });
  } else if (name.includes('l')) {
    variants.push({
      variant: `${name.replace(/l/g, '1')}.${tld}`,
      technique: 'Numeral Substitution (l -> 1)',
      riskScore: 90,
      description: 'Replaces letter "l" with digit "1".',
      isHomoglyph: false,
    });
  }

  variants.push({
    variant: `${name}-login.${tld}`,
    technique: 'Hyphenated Security Affix',
    riskScore: 92,
    description: 'Appends deceptive "-login" suffix to mimic corporate portals.',
    isHomoglyph: false,
  });
  variants.push({
    variant: `${name}-verify.com`,
    technique: 'Credential Trap Affix',
    riskScore: 89,
    description: 'Appends "-verify" on a generic commercial TLD.',
    isHomoglyph: false,
  });

  const alternateTlds = ['xyz', 'co', 'org', 'top', 'online'];
  for (const alt of alternateTlds) {
    if (alt !== tld) {
      variants.push({
        variant: `${name}.${alt}`,
        technique: 'TLD Hijack / Cross-Registry',
        riskScore: 82,
        description: `Registers identical brand stem under .${alt} domain registry.`,
        isHomoglyph: false,
      });
      break;
    }
  }

  variants.push({
    variant: `${name}.com.account-update.xyz`,
    technique: 'Domain Stacking (False Apex)',
    riskScore: 95,
    description: `Uses "${name}.com" as a subdomain of attacker-controlled apex domain.`,
    isHomoglyph: false,
  });

  return res.json({
    success: true,
    originalDomain: clean,
    totalVariants: variants.length,
    variants,
  });
});

const isProd = process.env.NODE_ENV === 'production';
if (!isProd) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Level Devil] Server running on http://0.0.0.0:${PORT}`);
});
