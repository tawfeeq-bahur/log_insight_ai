export function redactSensitiveData(logContent: string): { maskedLog: string, redactions: { original: string, masked: string, lineNumber: number }[] } {
  const lines = logContent.split('\n');
  const redactions: { original: string, masked: string, lineNumber: number }[] = [];

  const maskedLines = lines.map((line, index) => {
    let maskedLine = line;

    // Regex to find "key": "value" patterns and mask the value
    maskedLine = maskedLine.replace(/(["'])([^"']*)(["']\s*:\s*["'])([^"']*)(["'])/g, (match, q1, key, q2, value, q3) => {
      if (value) {
        redactions.push({
          original: `${key}: ${value}`,
          masked: `${key}: xxxxxx`,
          lineNumber: index + 1,
        });
      }
      return `${q1}${key}${q2}xxxxxx${q3}`;
    });

    // Regex for key=value or key: value
    maskedLine = maskedLine.replace(/([a-zA-Z0-9_]+)\s*[:=]\s*([^\s,\]}]+)/g, (match, key, value) => {
       // Avoid masking entire URLs or paths in one go if they contain =
      if (value.startsWith('http')) return match;
      if (value) {
        redactions.push({
          original: `${key}: ${value}`,
          masked: `${key}: xxxxxx`,
          lineNumber: index + 1,
        });
      }
      return `${key}: xxxxxx`;
    });
    
    // Final check for any other sensitive-looking values that were missed
    const sensitivePatterns = [
      /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, // IPs
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Emails
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, // Credit Card
      /(?<=User:\s).+/g,
    ];

    sensitivePatterns.forEach(pattern => {
      maskedLine = maskedLine.replace(pattern, (match) => {
        redactions.push({
          original: match,
          masked: 'xxxxxx',
          lineNumber: index + 1,
        });
        return 'xxxxxx';
      });
    });

    return maskedLine;
  });

  // Deduplicate redactions based on line number and original value
  const uniqueRedactions = Array.from(new Map(redactions.map(r => [`${r.lineNumber}-${r.original}`, r])).values());

  return { 
    maskedLog: maskedLines.join('\n'), 
    redactions: uniqueRedactions
  };
}


export async function getSha256(fileContent: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(fileContent);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
