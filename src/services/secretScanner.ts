import { SecretScanResult, SecretScanViolation } from '../types/marketplace';

interface SecretRule {
  name: string;
  description: string;
  pattern: RegExp;
}

const SECRET_RULES: SecretRule[] = [
  {
    name: 'OPENAI_API_KEY',
    description: 'OpenAI API key detected',
    pattern: /sk-[a-zA-Z0-9_-]{20,}/g,
  },
  {
    name: 'GITHUB_TOKEN',
    description: 'GitHub personal access token or OAuth secret detected',
    pattern: /gh[pousr]_[A-Za-z0-9_]{36,255}/g,
  },
  {
    name: 'AWS_ACCESS_KEY_ID',
    description: 'AWS Access Key ID detected',
    pattern: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
  },
  {
    name: 'AWS_SECRET_KEY',
    description: 'AWS Secret Access Key pattern detected',
    pattern: /(?:aws_secret_access_key|aws_secret_key)\s*[:=]\s*["']?([a-zA-Z0-9/+=]{40})["']?/gi,
  },
  {
    name: 'PRIVATE_KEY',
    description: 'Cryptographic Private Key block detected',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/g,
  },
  {
    name: 'JWT_TOKEN',
    description: 'JSON Web Token (JWT) detected',
    pattern: /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,
  },
  {
    name: 'SLACK_TOKEN',
    description: 'Slack API Token detected',
    pattern: /xox[baprs]-[0-9a-zA-Z]{10,48}/g,
  },
  {
    name: 'VERCEL_TOKEN',
    description: 'Vercel API token pattern detected',
    pattern: /(?:vercel_token|vercel_secret|VERCEL_TOKEN)\s*[:=]\s*["']?([a-zA-Z0-9_-]{24,})["']?/gi,
  },
  {
    name: 'GENERIC_HIGH_ENTROPY_SECRET',
    description: 'Potential raw credential or API secret variable assignment',
    pattern: /(?:password|secret_key|api_secret|auth_token|client_secret)\s*[:=]\s*["']([a-zA-Z0-9_\-\.\$\#\@\!]{16,})["']/gi,
  },
];

function maskSecret(secret: string): string {
  if (secret.length <= 6) {
    return '***';
  }
  const prefix = secret.slice(0, 3);
  const suffix = secret.slice(-2);
  return `${prefix}***${suffix}`;
}

/**
 * Recursively scans an object, array, or string for exposed credentials and secrets.
 * Returns a detailed result containing any violations with masked previews.
 */
export function scanForSecrets(input: any, currentPath: string = 'root'): SecretScanResult {
  const violations: SecretScanViolation[] = [];

  function inspectValue(val: any, path: string) {
    if (val === null || val === undefined) {
      return;
    }

    if (typeof val === 'string') {
      for (const rule of SECRET_RULES) {
        // Reset regex state
        rule.pattern.lastIndex = 0;
        const matches = val.match(rule.pattern);
        if (matches) {
          for (const match of matches) {
            violations.push({
              rule: rule.name,
              path,
              maskedPreview: maskSecret(match),
              description: rule.description,
            });
          }
        }
      }
      return;
    }

    if (Array.isArray(val)) {
      val.forEach((item, index) => {
        inspectValue(item, `${path}[${index}]`);
      });
      return;
    }

    if (typeof val === 'object') {
      for (const [key, propVal] of Object.entries(val)) {
        // Check for suspicious key names with hardcoded string values
        const sensitiveKeyNames = ['secret', 'api_key', 'apikey', 'access_token', 'private_key', 'password', 'token'];
        if (
          sensitiveKeyNames.some(sk => key.toLowerCase().includes(sk)) &&
          typeof propVal === 'string' &&
          propVal.trim().length > 8 &&
          !propVal.startsWith('{{') && // Allow environment variable placeholders like {{ secrets.KEY }}
          !propVal.startsWith('$') && // Allow references like $ENV_VAR
          !propVal.startsWith('env.') // Allow env.VAR
        ) {
          violations.push({
            rule: 'SENSITIVE_KEY_VALUE',
            path: `${path}.${key}`,
            maskedPreview: maskSecret(propVal),
            description: `Potential secret stored in sensitive field "${key}"`,
          });
        }

        inspectValue(propVal, `${path}.${key}`);
      }
    }
  }

  inspectValue(input, currentPath);

  // De-duplicate violations on the same path & rule
  const uniqueViolations: SecretScanViolation[] = [];
  const seen = new Set<string>();

  for (const v of violations) {
    const key = `${v.rule}:${v.path}:${v.maskedPreview}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueViolations.push(v);
    }
  }

  return {
    hasSecrets: uniqueViolations.length > 0,
    violations: uniqueViolations,
  };
}
