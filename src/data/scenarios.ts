import { SimulationScenario } from '../types/phishing';

export const SCENARIOS: SimulationScenario[] = [
  {
    id: 'sc-1',
    title: 'Urgent Microsoft 365 Password Expiration Notice',
    type: 'email',
    category: 'Fake IT Support',
    difficulty: 'Beginner',
    isPhish: true,
    sender: {
      name: 'IT Global Helpdesk',
      emailOrPhone: 'helpdesk-notice@m365-tenant-portal-auth.xyz',
      displayMatch: false,
    },
    subject: 'CRITICAL: Your Microsoft 365 Password Expires in 2 Hours',
    timestamp: 'Today at 09:14 AM',
    body: `Dear Employee,\n\nYour enterprise password for Microsoft Office 365 is scheduled to expire today at 11:30 AM due to scheduled directory sync.\n\nTo retain your mailbox and avoid interruption of access to Teams, OneDrive, and SharePoint, keep your current password by verifying your credentials immediately below.\n\nFailure to verify will trigger automatic account quarantine.\n\nRegards,\nIT Infrastructure & Security Operations`,
    embeddedLink: {
      anchorText: 'Keep Current Password (Verify Now)',
      destinationUrl: 'https://login.microsoftonline.com.m365-tenant-portal-auth.xyz/security/pwd-sync?token=89f30',
      isSpoofed: true,
    },
    clues: [
      'Sender domain is "m365-tenant-portal-auth.xyz", not your organization\'s internal domain or official Microsoft.com',
      'Artificial 2-hour deadline designed to induce panic and bypass rational verification',
      'Anchor text claims to be Microsoft, but the actual URL points to an attacker-controlled .xyz apex domain',
      'Legitimate IT teams never ask you to click an email link to "keep your current password"'
    ],
    psychologicalTactics: ['Urgency & Panic', 'Authority Impersonation', 'Fear of Work Disruption'],
    technicalRedFlags: [
      'Domain Stacking: "login.microsoftonline.com" is placed as a subdomain on "m365-tenant-portal-auth.xyz"',
      'High-abuse TLD (.xyz)',
      'Display Name spoofing ("IT Global Helpdesk")'
    ],
    takeaway: 'Never click password reset or expiration links sent via email. Always navigate to your company portal directly via bookmark or official SSO.'
  },
  {
    id: 'sc-2',
    title: 'USPS Package Address Incomplete (Smishing)',
    type: 'sms',
    category: 'Delivery Smishing',
    difficulty: 'Intermediate',
    isPhish: true,
    sender: {
      name: 'USPS-Alerts',
      emailOrPhone: '+1 (832) 991-0428',
      displayMatch: false,
    },
    timestamp: 'Yesterday at 3:42 PM',
    body: `[USPS Alert]: Your package #US940011189812 has arrived at the regional sorting hub but cannot be dispatched due to an incomplete street number. Please update your delivery address and pay the $0.35 redelivery surcharge within 12 hours: https://usps-post-redelivery.top/tracking`,
    embeddedLink: {
      anchorText: 'https://usps-post-redelivery.top/tracking',
      destinationUrl: 'https://usps-post-redelivery.top/tracking',
      isSpoofed: true,
    },
    clues: [
      'Sent from an ordinary random mobile number (+1 832...), not the official 5-digit USPS shortcode (e.g. 28777)',
      'The destination domain is "usps-post-redelivery.top" rather than the official "usps.com"',
      'Small surcharge ($0.35) is bait used to harvest full credit card details, CVV, and billing zip codes',
      'Artificial 12-hour urgency window'
    ],
    psychologicalTactics: ['Curiosity', 'Artificial Urgency', 'Micro-commitment ($0.35 fee)'],
    technicalRedFlags: [
      'High-abuse TLD (.top)',
      'Unsolicited SMS with shortlink',
      'Non-official originating phone number'
    ],
    takeaway: 'Postal carriers never text requesting payment for redelivery. Always type the tracking number directly into usps.com.'
  },
  {
    id: 'sc-3',
    title: 'Urgent Wire Transfer Request from CEO',
    type: 'email',
    category: 'Executive Impersonation (BEC)',
    difficulty: 'Advanced',
    isPhish: true,
    sender: {
      name: 'Jonathan Sterling (CEO)',
      emailOrPhone: 'jonathan.sterling.exec@gmail.com',
      displayMatch: false,
    },
    subject: 'CONFIDENTIAL: Project Apex Acquisition - Immediate Wire',
    timestamp: 'Today at 11:05 AM',
    body: `Are you at your desk?\n\nI am currently in closed-door negotiations for the Project Apex acquisition and cannot take phone calls. Our legal counsel requires an escrow retainer deposit of $42,500 transferred today before 2:00 PM EST to secure the purchase agreement.\n\nPlease process this wire to the attached settlement account coordinates and confirm once completed. Keep this strictly between us until the formal press release tomorrow.\n\nSent from my iPhone`,
    clues: [
      'Sender claims to be the CEO but the message originates from a personal Gmail address ("jonathan.sterling.exec@gmail.com")',
      'Explicitly insists on secrecy ("keep this strictly between us") to prevent internal peer verification',
      'Forbids phone verification by claiming to be in a closed-door meeting',
      'Creates high stakes urgency with an arbitrary 2:00 PM cutoff'
    ],
    psychologicalTactics: ['Executive Authority', 'Secrecy/Confidentiality', 'Urgency', 'Isolation of Victim'],
    technicalRedFlags: [
      'Free webmail address used for corporate wire instructions',
      'Reply-To address divergence',
      'No cryptographic company signature/DKIM verification'
    ],
    takeaway: 'Business Email Compromise (BEC) rarely contains malicious links. Always verify financial disbursement requests using out-of-band communication (phone or in-person).'
  },
  {
    id: 'sc-4',
    title: 'Legitimate GitHub Security Alert: Secret Detected',
    type: 'email',
    category: 'Legitimate Notification',
    difficulty: 'Intermediate',
    isPhish: false,
    sender: {
      name: 'GitHub',
      emailOrPhone: 'notifications@github.com',
      displayMatch: true,
    },
    subject: '[GitHub] Secret scanning detected a personal access token in repository',
    timestamp: 'Today at 08:30 AM',
    body: `Hi developer,\n\nGitHub Secret Scanning detected a leaked GitHub Personal Access Token (ghp_***) in your repository 'frontend-design-demo' on commit 8a93fe.\n\nTo protect your account, GitHub has automatically revoked this token. Please review the commit history and ensure no other sensitive environment credentials are exposed.\n\nView security advisory in your security tab on GitHub.`,
    embeddedLink: {
      anchorText: 'View Security Advisory on GitHub.com',
      destinationUrl: 'https://github.com/torvalds/linux/security',
      isSpoofed: false,
    },
    clues: [
      'Sender domain is official "github.com" with valid SPF/DKIM authentication',
      'Link points directly to "https://github.com/..." with no subdomains or redirection hops',
      'Does NOT ask for password, personal information, or money',
      'Informs user that the token was already revoked automatically (informative, not coercive)'
    ],
    psychologicalTactics: ['Informative Security Notice'],
    technicalRedFlags: [
      'None. Verified domain, valid HTTPS, strict SPF match.'
    ],
    takeaway: 'Legitimate security alerts provide context and point directly to the authentic platform without asking for password entry or wire transfers.'
  },
  {
    id: 'sc-5',
    title: 'DocuSign Document Ready for Signature',
    type: 'email',
    category: 'Credential Harvester',
    difficulty: 'Intermediate',
    isPhish: true,
    sender: {
      name: 'DocuSign Electronic Signature Service',
      emailOrPhone: 'dse@docusign-contracts-view.com',
      displayMatch: false,
    },
    subject: 'Please DocuSign: 2026 Compensation & Bonus Adjustment Agreement.pdf',
    timestamp: 'Yesterday at 2:15 PM',
    body: `Hello,\n\nPlease review and electronically sign your updated 2026 Compensation Adjustment Agreement.\n\nAll signatures must be completed before month-end payroll processing to take effect.\n\nDocuSign Envelope ID: 3942C-8812B-0941A\nProtected by DocuSign Cloud Enclave`,
    embeddedLink: {
      anchorText: 'Review and Sign Document',
      destinationUrl: 'https://docusign-contracts-view.com/en/login-token?s=user481',
      isSpoofed: true,
    },
    clues: [
      'Sender domain is "docusign-contracts-view.com", not official "docusign.net" or "docusign.com"',
      'Uses greed and curiosity (compensation & bonus agreement) to lower vigilance',
      'Clicking leads to a credential harvesting form mimicking the enterprise identity login'
    ],
    psychologicalTactics: ['Financial Incentive (Greed)', 'Authority', 'Time sensitivity'],
    technicalRedFlags: [
      'Brand lookalike domain with hyphens',
      'Non-official envelope link',
      'Tracking token parameters designed to log individual employee clicks'
    ],
    takeaway: 'Check the sender domain on DocuSign emails carefully. Official DocuSign notifications come exclusively from docusign.net or docusign.com.'
  },
  {
    id: 'sc-6',
    title: 'Amazon Suspicious Order Placed (iPhone 16 Pro Max)',
    type: 'email',
    category: 'Credential Harvester',
    difficulty: 'Beginner',
    isPhish: true,
    sender: {
      name: 'Amazon Customer Support',
      emailOrPhone: 'order-update@amazn-billing-service.co',
      displayMatch: false,
    },
    subject: 'Order Confirmation: iPhone 16 Pro Max 512GB ($1,399.00)',
    timestamp: 'Today at 07:11 AM',
    body: `Thank you for your order!\n\nItem: Apple iPhone 16 Pro Max 512GB Titanium\nTotal Charged: $1,399.00\nShipping Address: 424 Elm St, Miami, FL\n\nIf you did not make this purchase, click Cancel Order immediately within 30 minutes to stop the charge and lock unauthorized access:`,
    embeddedLink: {
      anchorText: 'Cancel Order & Request Refund',
      destinationUrl: 'http://amazn-billing-service.co/cancel?id=99281',
      isSpoofed: true,
    },
    clues: [
      'Domain typo: "amazn-billing-service.co" (missing "o" in amazon)',
      'Unencrypted HTTP link (no SSL)',
      'Fabricated high-value charge designed to cause immediate shock',
      'Artificial 30-minute cancellation window'
    ],
    psychologicalTactics: ['Financial Shock & Fear', 'Urgency', 'Loss Aversion'],
    technicalRedFlags: [
      'Typosquatted domain (amazn instead of amazon)',
      'Unsecured HTTP link',
      'Foreign TLD (.co instead of official amazon.com)'
    ],
    takeaway: 'If you receive an alarming order confirmation, never click links in the email. Open the official Amazon app or website directly and check your "Returns & Orders" tab.'
  }
];
