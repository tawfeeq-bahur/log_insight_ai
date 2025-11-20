export async function getSha256(fileContent: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(fileContent);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function redactSensitiveData(logContent: string): string {
  let redactedText = logContent;

  const redactions = [
    // IPs (v4 & v6)
    { regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b|([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:(:|([0-9a-fA-F]{1,4}:){1,7}|[0-9a-fA-F]{1,4})/g, replacement: '[REDACTED_IP]' },
    // URLs
    { regex: /https?:\/\/[^\s,"]+/g, replacement: '[REDACTED_URL]' },
    // File Paths (Linux & Windows)
    { regex: /(?:[a-zA-Z]:\\|\/)(?:[^\s:"*?<>|]+\/)*[^\s:"*?<>|]+/g, replacement: '[REDACTED_PATH]' },
    // Email Addresses
    { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[REDACTED_EMAIL]' },
    // API Keys (common prefixes and long alphanumeric strings)
    { regex: /\b(sk|pk|ak|rk)_[a-zA-Z0-9]{20,}\b|\b[a-zA-Z0-9]{32,}\b/g, replacement: '[REDACTED_API_KEY]' },
    // Timestamps (ISO 8601)
    { regex: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?/g, replacement: '[REDACTED_TIMESTAMP]' },
    // Social Security Numbers (SSN)
    { regex: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[REDACTED_SSN]' },
    // Phone Numbers (various formats)
    { regex: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, replacement: '[REDACTED_PHONE]' },
    // Credit Card Numbers (major providers) & Last 4
    { regex: /\b(?:\d[ -]*?){13,16}\b/g, replacement: '[REDACTED_CREDIT_CARD]' },
    { regex: /(card_last4|last_four)\s*[:=]\s*['"]?(\d{4})['"]?/gi, replacement: (match, p1) => `${p1}: "[REDACTED_LAST4]"`},
    // Usernames in key-value pairs
    { regex: /(user(?:name)?\s*[:=]\s*)['"]?([a-zA-Z0-9._-]+)['"]?/gi, replacement: (match, p1) => `${p1}"[REDACTED_USER]"` },
    // Passwords, Secrets, Tokens in key-value pairs
    { regex: /(password|secret|token|cvv|pin)\s*[:=]\s*['"]?([^,'"\s}]+)['"]?/gi, replacement: (match, p1) => `${p1}: "[REDACTED_SECRET]"` },
    // Addresses (simple street address patterns)
    { regex: /\d+\s+[a-zA-Z0-9\s]+(?:street|st|avenue|ave|road|rd|drive|dr|court|ct|lane|ln|boulevard|blvd)\b/gi, replacement: '[REDACTED_ADDRESS]' },
  ];

  for (const { regex, replacement } of redactions) {
    if (typeof replacement === 'string') {
      redactedText = redactedText.replace(regex, replacement);
    } else {
      redactedText = redactedText.replace(regex, replacement as any);
    }
  }

  return redactedText;
}
