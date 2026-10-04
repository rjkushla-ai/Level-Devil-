export interface SampleUrl {
  name: string;
  category: string;
  url: string;
  expectedThreat: 'Safe' | 'Suspicious' | 'Malicious' | 'Critical';
  vector: string;
  description: string;
}

export const SAMPLE_URLS: SampleUrl[] = [
  {
    name: 'Cyrillic PayPal Homoglyph',
    category: 'Homograph Attack',
    url: 'https://раypal.com/webscr/login-verify',
    expectedThreat: 'Critical',
    vector: 'Punycode / IDN Spoof',
    description: 'Uses Cyrillic letter "а" (\u0430) instead of Latin "a", creating an identical visual duplicate of paypal.com.'
  },
  {
    name: 'Microsoft 365 Subdomain Stack',
    category: 'Credential Harvest',
    url: 'https://login.microsoftonline.com.m365-tenant-portal-auth.xyz/security/pwd-sync',
    expectedThreat: 'Critical',
    vector: 'Subdomain Stacking',
    description: 'Puts legitimate brand "login.microsoftonline.com" as a subdomain of the attacker apex domain "m365-tenant-portal-auth.xyz".'
  },
  {
    name: 'Chase Bank Raw IP Host',
    category: 'Staging Server',
    url: 'http://198.51.100.42/secure/chase-online/auth/login.php',
    expectedThreat: 'Malicious',
    vector: 'Raw IP Host + Unencrypted',
    description: 'Uses unencrypted HTTP and a raw numerical IP address host hosting a fake Chase banking login.'
  },
  {
    name: 'Apple ID Billing Unlock Trap',
    category: 'Brand Impersonation',
    url: 'https://apple-id-verify-alert.net/manage/update-billing?session=89a7',
    expectedThreat: 'Critical',
    vector: 'Hyphenated Brand Affix',
    description: 'Uses "apple-id-verify-alert.net" with credential harvesting keywords in the path.'
  },
  {
    name: 'High-Entropy DGA Phish',
    category: 'Algorithmic Domain',
    url: 'http://x9v87q-secure-login-portal.icu/auth/gateway',
    expectedThreat: 'Suspicious',
    vector: 'High Shannon Entropy',
    description: 'High character randomness on an abuse-prone .icu TLD used by disposable phishing kits.'
  },
  {
    name: 'Legitimate GitHub Repository',
    category: 'Benign Service',
    url: 'https://github.com/torvalds/linux',
    expectedThreat: 'Safe',
    vector: 'Verified Enterprise Root',
    description: 'Verified apex domain github.com with legitimate repository URL path and valid TLS.'
  },
  {
    name: 'Legitimate Google Search',
    category: 'Benign Service',
    url: 'https://www.google.com/search?q=cybersecurity+threat+intelligence',
    expectedThreat: 'Safe',
    vector: 'Verified Enterprise Root',
    description: 'Standard authentic query on google.com.'
  }
];
