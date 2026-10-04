export type ThreatVerdict = 'BENIGN' | 'SUSPICIOUS' | 'MALICIOUS' | 'CRITICAL_PHISH';

export interface ThreatVectorScores {
  brandSpoofing: number;
  credentialHarvesting: number;
  socialEngineering: number;
  technicalDeception: number;
  domainReputation: number;
}

export interface ThreatIndicator {
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  evidence: string;
}

export interface ExtractedUrlFeatures {
  isValid: boolean;
  normalized: string;
  hostname: string;
  pathname: string;
  entropy: number;
  hasIpHost: boolean;
  isHttps: boolean;
  hasAtSymbol: boolean;
  hasDoubleSlashInPath?: boolean;
  subdomainCount: number;
  subdomains: string;
  registeredDomain: string;
  tld: string;
  homoglyphs: string[];
  hasHomoglyphs: boolean;
  targetedBrand: string | null;
  suspiciousTld: boolean;
  suspiciousKeywords: string[];
}

export interface UrlAnalysisData {
  riskScore: number;
  verdict: ThreatVerdict;
  confidence: number;
  threatType: string;
  impersonatedBrand: string | null;
  summary: string;
  vectorScores: ThreatVectorScores;
  indicators: ThreatIndicator[];
  safeBrowsingAdvice: string;
}

export interface UrlAnalysisResponse {
  success: boolean;
  source: 'gemini-3.8-flash' | 'heuristic-engine';
  features: ExtractedUrlFeatures;
  analysis: UrlAnalysisData;
}

export interface MessageRedFlag {
  quote: string;
  reason: string;
  severity: 'medium' | 'high' | 'critical';
}

export interface MessageAnalysisData {
  threatScore: number;
  verdict: 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK_PHISH';
  attackCategory: string;
  psychologicalTriggers: string[];
  redFlags: MessageRedFlag[];
  summary: string;
  recommendedAction: string;
}

export interface MessageAnalysisResponse {
  success: boolean;
  source: 'gemini-3.8-flash' | 'heuristic-engine';
  extractedUrls: string[];
  analysis: MessageAnalysisData;
}

export interface TyposquatVariant {
  variant: string;
  technique: string;
  riskScore: number;
  description: string;
  isHomoglyph: boolean;
}

export interface TyposquatResponse {
  success: boolean;
  originalDomain: string;
  totalVariants: number;
  variants: TyposquatVariant[];
}

export interface SimulationScenario {
  id: string;
  title: string;
  type: 'email' | 'sms' | 'chat';
  category: 'Credential Harvester' | 'Executive Impersonation (BEC)' | 'Delivery Smishing' | 'Fake IT Support' | 'HR Benefit Update' | 'Legitimate Notification';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  isPhish: boolean;
  sender: {
    name: string;
    emailOrPhone: string;
    displayMatch: boolean;
  };
  subject?: string;
  timestamp: string;
  body: string;
  embeddedLink?: {
    anchorText: string;
    destinationUrl: string;
    isSpoofed: boolean;
  };
  clues: string[];
  psychologicalTactics: string[];
  technicalRedFlags: string[];
  takeaway: string;
}
