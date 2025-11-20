export async function getSha256(fileContent: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(fileContent);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function redactSensitiveData(logContent: string): string {
  // Regex for IP addresses (v4 and v6)
  const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b|([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:(:|([0-9a-fA-F]{1,4}:){1,7}|[0-9a-fA-F]{1,4})/g;
  
  // Regex for URLs
  const urlRegex = /https?:\/\/[^\s,"]+/g;

  // Regex for file paths (simple version for Linux and Windows)
  const filePathRegex = /(?:[a-zA-Z]:\\|\/)(?:[^\s:"*?<>|]+\/)*[^\s:"*?<>|]+/g;
  
  // Regex for email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

  // Regex for common API key patterns (prefixed and long alphanumeric)
  const apiKeyRegex = /\b(sk|pk|rk)_[a-zA-Z0-9]{20,}\b|\b[a-zA-Z0-9]{32,}\b/g;

  // Regex for usernames (looks for common patterns)
  const usernameRegex = /(user(?:name)?\s*[:=]\s*)['"]?(\w+)['"]?/gi;

  // Regex for timestamps (ISO 8601 and common formats)
  const timestampRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?/g;

  let redactedText = logContent;
  redactedText = redactedText.replace(ipRegex, '[REDACTED_IP]');
  redactedText = redactedText.replace(urlRegex, '[REDACTED_URL]');
  redactedText = redactedText.replace(filePathRegex, '[REDACTED_PATH]');
  redactedText = redactedText.replace(emailRegex, '[REDACTED_EMAIL]');
  redactedText = redactedText.replace(apiKeyRegex, '[REDACTED_API_KEY]');
  redactedText = redactedText.replace(usernameRegex, (match, p1, p2) => `${p1}[REDACTED_USER]`);
  redactedText = redactedText.replace(timestampRegex, '[REDACTED_TIMESTAMP]');

  return redactedText;
}
