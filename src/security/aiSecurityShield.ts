/**
 * NEXUS AI Security Shield
 * Enterprise-grade multi-layer defense against prompt injection, jailbreaks,
 * indirect prompt injection, data exfiltration, and PII/credential leakage.
 */

export interface SecurityScanResult {
  safe: boolean;
  score: number; // 0.0 (clean) to 1.0 (malicious)
  violations: SecurityViolation[];
  sanitizedInput?: string;
  detectedCategories: SecurityCategory[];
}

export type SecurityCategory =
  | 'PROMPT_INJECTION'
  | 'JAILBREAK_ATTEMPT'
  | 'SYSTEM_PROMPT_EXTRACTION'
  | 'DELIMITER_ATTACK'
  | 'MALICIOUS_EXECUTION'
  | 'CREDENTIAL_LEAK'
  | 'PII_EXPOSURE';

export interface SecurityViolation {
  category: SecurityCategory;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  matchedPattern?: string;
}

// 1. Direct Prompt Injection & Jailbreak Heuristics
const INJECTION_RULES: { pattern: RegExp; category: SecurityCategory; severity: 'MEDIUM' | 'HIGH' | 'CRITICAL'; desc: string }[] = [
  {
    pattern: /(?:ignore|disregard|forget|bypass|override)\s+(?:all\s+)?(?:previous|prior|above|existing)\s+(?:instructions|prompts|rules|guidelines|commands)/i,
    category: 'PROMPT_INJECTION',
    severity: 'CRITICAL',
    desc: 'Instruction override directive detected',
  },
  {
    pattern: /(?:you\s+are\s+now|act\s+as|pretend\s+to\s+be)\s+(?:DAN|unfiltered|jailbroken|evil|unrestricted|god\s*mode|developer\s*mode)/i,
    category: 'JAILBREAK_ATTEMPT',
    severity: 'CRITICAL',
    desc: 'Roleplay persona jailbreak attempt detected',
  },
  {
    pattern: /(?:output|reveal|show|print|display|dump|repeat|leak)\s+(?:the\s+)?(?:system\s+(?:prompt|instructions?)|developer\s+mode|initial\s+prompt|context\s+window|hidden\s+rules)/i,
    category: 'SYSTEM_PROMPT_EXTRACTION',
    severity: 'CRITICAL',
    desc: 'System prompt extraction attempt detected',
  },
  {
    pattern: /(?:\[\s*(?:system|assistant|system_instruction|admin)\s*\]|<\|im_start\|>|<\|system\|>|<<SYS>>|---\s*BEGIN\s+SYSTEM\s+PROMPT\s*---)/i,
    category: 'DELIMITER_ATTACK',
    severity: 'HIGH',
    desc: 'Adversarial system prompt delimiter smuggling',
  },
  {
    pattern: /(?:eval\s*\(|exec\s*\(|child_process|require\s*\(|import\s*\(|process\.env|__dirname|fs\.read)/i,
    category: 'MALICIOUS_EXECUTION',
    severity: 'CRITICAL',
    desc: 'Arbitrary code execution or system environment probing attempt',
  },
  {
    pattern: /(?:base64\s*(?:decode|eval)|atob\s*\(|rot13|hex_decode)\s*[:=]\s*["']?[A-Za-z0-9+/=]{30,}["']?/i,
    category: 'PROMPT_INJECTION',
    severity: 'HIGH',
    desc: 'Obfuscated encoded payload smuggling attempt',
  },
  {
    pattern: /(?:do\s+anything\s+now|never\s+refuse|ignore\s+safety|disable\s+guardrails|anti-censorship)/i,
    category: 'JAILBREAK_ATTEMPT',
    severity: 'HIGH',
    desc: 'Safety guardrail bypass assertion',
  },
];

// 2. Secret & Credential Leakage Regexes
const CREDENTIAL_RULES = [
  { name: 'OPENAI_KEY', pattern: /sk-[a-zA-Z0-9_-]{20,}/g },
  { name: 'GITHUB_TOKEN', pattern: /gh[pousr]_[A-Za-z0-9_]{36,255}/g },
  { name: 'NEXUS_API_KEY', pattern: /nxs_[a-zA-Z0-9_-]{32,}/g },
  { name: 'AWS_KEY', pattern: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g },
  { name: 'JWT_TOKEN', pattern: /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g },
  { name: 'PRIVATE_KEY', pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/g },
  { name: 'SLACK_TOKEN', pattern: /xox[baprs]-[0-9a-zA-Z]{10,48}/g },
];

// 3. PII (Personally Identifiable Information) Patterns
const PII_RULES = [
  // Credit Card Numbers (Major card brands)
  { name: 'CREDIT_CARD', pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})\b/g },
  // US SSN
  { name: 'SSN', pattern: /\b\d{3}-\d{2}-\d{4}\b/g },
  // Email addresses (when scrubbing sensitive inputs)
  { name: 'EMAIL_ADDRESS', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
];

/**
 * Evaluates an input prompt for adversarial attacks, jailbreaks, and injection attempts.
 */
export function detectPromptInjection(input: string): SecurityScanResult {
  if (!input || typeof input !== 'string') {
    return { safe: true, score: 0, violations: [], detectedCategories: [] };
  }

  const violations: SecurityViolation[] = [];
  const categories = new Set<SecurityCategory>();

  // Check injection heuristics
  for (const rule of INJECTION_RULES) {
    if (rule.pattern.test(input)) {
      violations.push({
        category: rule.category,
        severity: rule.severity,
        description: rule.desc,
        matchedPattern: rule.pattern.source,
      });
      categories.add(rule.category);
    }
  }

  // Calculate composite risk score
  let score = 0;
  for (const v of violations) {
    if (v.severity === 'CRITICAL') score += 0.5;
    else if (v.severity === 'HIGH') score += 0.3;
    else if (v.severity === 'MEDIUM') score += 0.15;
    else score += 0.05;
  }

  score = Math.min(score, 1.0);
  const safe = violations.length === 0 || score < 0.3;

  return {
    safe,
    score,
    violations,
    detectedCategories: Array.from(categories),
  };
}

export const scanPromptSafety = detectPromptInjection;

/**
 * Scans external contextual data (such as GitHub PR reviews, issue bodies, or webhook events)
 * to prevent indirect prompt injection before it is merged into the LLM context.
 */
export function scanExternalContext(externalData: string, sourceName: string): SecurityScanResult {
  const scan = detectPromptInjection(externalData);
  if (!scan.safe) {
    scan.violations.forEach((v) => {
      v.description = `[Indirect Injection via ${sourceName}] ${v.description}`;
    });
  }
  return scan;
}

/**
 * Redacts secrets, credentials, and sensitive PII from text before sending to LLM models or saving to logs.
 */
export function redactSensitiveData(text: string, options: { redactPii?: boolean; redactCredentials?: boolean } = {}): {
  cleanText: string;
  redactedCount: number;
} {
  if (!text) return { cleanText: '', redactedCount: 0 };
  const { redactPii = false, redactCredentials = true } = options;

  let clean = text;
  let count = 0;

  if (redactCredentials) {
    for (const rule of CREDENTIAL_RULES) {
      clean = clean.replace(rule.pattern, () => {
        count++;
        return `[REDACTED_${rule.name}]`;
      });
    }
  }

  if (redactPii) {
    for (const rule of PII_RULES) {
      clean = clean.replace(rule.pattern, () => {
        count++;
        return `[REDACTED_${rule.name}]`;
      });
    }
  }

  return { cleanText: clean, redactedCount: count };
}

/**
 * Validates AI agent output to verify that internal instructions, system prompt text,
 * or encrypted credentials were not exfiltrated by the agent response.
 */
export function verifyOutputSafety(output: string, systemPrompt?: string): { safe: boolean; reason?: string } {
  if (!output) return { safe: true };

  // 1. Check for credential leak in output
  for (const rule of CREDENTIAL_RULES) {
    if (rule.pattern.test(output)) {
      return {
        safe: false,
        reason: `Potential credential leakage detected in model response (${rule.name}).`,
      };
    }
  }

  // 2. Check for exact system prompt exfiltration if provided
  if (systemPrompt && systemPrompt.length > 50) {
    const promptSnippet = systemPrompt.slice(0, 40);
    if (output.includes(promptSnippet)) {
      return {
        safe: false,
        reason: 'Model output contains direct regurgitation of system instructions.',
      };
    }
  }

  return { safe: true };
}
