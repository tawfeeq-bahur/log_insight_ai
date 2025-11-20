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

  // Regex 1: For JSON-like values in quotes. e.g., "key": "value"
  redactedText = redactedText.replace(/"([^"]+)":\s*"[^"]*"/g, (match, key) => {
    if (["type", "code", "decline_code", "charge_id", "message"].includes(key)) {
      return `"${key}": "xxxxxx"`;
    }
    return `"${key}": "xxxxxx"`;
  });

  // Regex 2: For simple key-value pairs without quotes. e.g., key: value or key=value
  redactedText = redactedText.replace(/^(\s*[\w.-]+(?:\[\d+\])?\s*[:=]\s*).+$/gm, (match, keyPart) => {
    const lowerKey = keyPart.toLowerCase();
    // Avoid masking things that are not sensitive data
    if (lowerKey.includes('error') || lowerKey.includes('exception') || lowerKey.includes('status')) {
      return match;
    }
    return `${keyPart.trim()} xxxxxx`;
  });

  // Regex 3: For values in YAML-like or plain text user data blocks
  // e.g., username: gabriel.lopez
  redactedText = redactedText.replace(/(\b(username|email|phone|ssn|driverLicense|passport|creditScore|annualIncome|employer|employeeId)\b\s*:\s*).+/g, '$1xxxxxx');

  // Regex 4: Mask values in arrays like ["value1", "value2"]
  redactedText = redactedText.replace(/\[\s*".*?"\s*\]/g, '["xxxxxx"]');

  // Regex 5: General cleanup for any remaining sensitive-looking values not caught above
  // IPs, emails, long numbers/hashes, etc.
  const sensitivePatterns = [
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, // IPs
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Emails
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
    /\b\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // Phone
    /\bch_[\w\d]{24}\b/g, // charge_id like ch_3aBcDe...
    /(?<=User:\s).+/g, // User: sophia.martinez@...
  ];
  
  sensitivePatterns.forEach(pattern => {
    redactedText = redactedText.replace(pattern, 'xxxxxx');
  });

  return redactedText;
}