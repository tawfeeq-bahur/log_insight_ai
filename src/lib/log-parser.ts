export async function getSha256(fileContent: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(fileContent);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function redactSensitiveData(logContent: string): string {
  // Regex to find key-value pairs where the value is in quotes
  // It captures the key (including quotes) and the opening quote of the value.
  const jsonRegex = /("([^"]+)":\s*)"([^"]*)"/g;
  let redactedText = logContent.replace(jsonRegex, (match, keyPart, key, value) => {
    // For specific keys, we might want to keep the value if it's not sensitive
    if (["currency", "payment_method", "state", "country"].includes(key)) {
        return match; // Return original match if key is in allowlist
    }
    return `${keyPart}"xxxxxx"`;
  });

  // Regex for other simple key-value formats (e.g. key: value)
  const plainTextRegex = /^(\s*[\w\s.-]+:\s+).+$/gm;
  redactedText = redactedText.replace(plainTextRegex, (match, keyPart) => {
      if (/Account locked|Last successful login|User-Agent|IP Address/i.test(keyPart)) {
          return `${keyPart.trim()} xxxxxx`;
      }
      return match;
  });

  // Regex for timestamps and IPs in the log lines
  const logLineRegex = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)|(\b(?:\d{1,3}\.){3}\d{1,3}\b)/g;
  redactedText = redactedText.replace(logLineRegex, 'xxxxxx');

  return redactedText;
}