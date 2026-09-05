/**
 * NEXUS SSRF (Server-Side Request Forgery) Protection Utility
 * 
 * Validates outgoing URLs before the server or edge runtime fetches external resources
 * (MCP servers, A2A agents, webhooks).
 * Blocks:
 * - Localhost and loopback addresses (127.0.0.0/8, ::1)
 * - Cloud metadata services (169.254.169.254, metadata.google.internal)
 * - Private RFC1918 networks (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
 * - Link-local and multicast ranges (169.254.0.0/16, fe80::/10, 224.0.0.0/4)
 * - IPv4-mapped IPv6 and alternative decimal/octal/hex representations
 */

export interface SsrfValidationResult {
  valid: boolean;
  reason?: string;
}

export interface SsrfValidationOptions {
  allowLocal?: boolean; // For controlled development/testing mocks only
  allowedProtocols?: string[];
}

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  'metadata.google.internal',
  'instance-data',
  'kubernetes.default',
  'kubernetes.default.svc',
]);

/**
 * Parses numeric IPv4 representations (standard decimal dotted, single integer, hex, octal).
 * Returns array of 4 octets [a, b, c, d] or null if not a recognized IPv4.
 */
function parseIpv4(host: string): number[] | null {
  // Standard dotted decimal: 1.2.3.4
  const dottedMatch = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (dottedMatch) {
    const octets = [
      parseInt(dottedMatch[1], 10),
      parseInt(dottedMatch[2], 10),
      parseInt(dottedMatch[3], 10),
      parseInt(dottedMatch[4], 10),
    ];
    if (octets.every((o) => o >= 0 && o <= 255)) {
      return octets;
    }
  }

  // Pure integer / decimal representation: e.g. 2130706433 for 127.0.0.1
  if (/^\d+$/.test(host)) {
    const num = Number(host);
    if (num >= 0 && num <= 0xffffffff) {
      return [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255,
      ];
    }
  }

  // Hex representation: e.g. 0x7f000001
  if (/^0x[0-9a-fA-F]+$/i.test(host)) {
    const num = parseInt(host, 16);
    if (num >= 0 && num <= 0xffffffff) {
      return [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255,
      ];
    }
  }

  // Octal dotted or mixed
  if (/^0[0-7]+(\.0[0-7]+){3}$/.test(host)) {
    const parts = host.split('.').map((p) => parseInt(p, 8));
    if (parts.every((p) => p >= 0 && p <= 255)) {
      return parts;
    }
  }

  return null;
}

/**
 * Determines if an IPv4 octet quartet falls in a restricted or private range.
 */
function isRestrictedIpv4(octets: number[]): { restricted: boolean; reason?: string } {
  const [a, b] = octets;

  // 0.0.0.0/8 - Broadcast / Current network
  if (a === 0) {
    return { restricted: true, reason: 'Current network (0.0.0.0/8) is disallowed' };
  }

  // 127.0.0.0/8 - Loopback
  if (a === 127) {
    return { restricted: true, reason: 'Loopback address (127.0.0.0/8) is disallowed' };
  }

  // 10.0.0.0/8 - Private network (RFC1918)
  if (a === 10) {
    return { restricted: true, reason: 'Private network address (10.0.0.0/8) is disallowed' };
  }

  // 172.16.0.0/12 - Private network (RFC1918: 172.16.0.0 to 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) {
    return { restricted: true, reason: 'Private network address (172.16.0.0/12) is disallowed' };
  }

  // 192.168.0.0/16 - Private network (RFC1918)
  if (a === 192 && b === 168) {
    return { restricted: true, reason: 'Private network address (192.168.0.0/16) is disallowed' };
  }

  // 169.254.0.0/16 - Link-Local / Cloud Metadata (169.254.169.254)
  if (a === 169 && b === 254) {
    return { restricted: true, reason: 'Link-local / Cloud metadata address (169.254.0.0/16) is disallowed' };
  }

  // 100.64.0.0/10 - Carrier-grade NAT (100.64.0.0 to 100.127.255.255)
  if (a === 100 && b >= 64 && b <= 127) {
    return { restricted: true, reason: 'Carrier-grade NAT address (100.64.0.0/10) is disallowed' };
  }

  // 224.0.0.0/4 - Multicast
  if (a >= 224 && a <= 239) {
    return { restricted: true, reason: 'Multicast address range is disallowed' };
  }

  // 240.0.0.0/4 - Reserved
  if (a >= 240) {
    return { restricted: true, reason: 'Reserved / broadcast address is disallowed' };
  }

  return { restricted: false };
}

/**
 * Checks if an IPv6 string is a restricted or local address.
 */
function isRestrictedIpv6(host: string): { restricted: boolean; reason?: string } {
  const clean = host.toLowerCase().replace(/^\[|\]$/g, '');

  // Loopback ::1
  if (clean === '::1' || clean === '0000:0000:0000:0000:0000:0000:0000:0001' || clean === '0:0:0:0:0:0:0:1') {
    return { restricted: true, reason: 'IPv6 Loopback (::1) is disallowed' };
  }

  // Unspecified ::
  if (clean === '::' || clean === '0:0:0:0:0:0:0:0' || clean === '0000:0000:0000:0000:0000:0000:0000:0000') {
    return { restricted: true, reason: 'IPv6 Unspecified address is disallowed' };
  }

  // Link-local fe80::/10
  if (clean.startsWith('fe8') || clean.startsWith('fe9') || clean.startsWith('fea') || clean.startsWith('feb')) {
    return { restricted: true, reason: 'IPv6 Link-local address (fe80::/10) is disallowed' };
  }

  // Unique local fc00::/7 (fc00:: to fdff::)
  if (clean.startsWith('fc') || clean.startsWith('fd')) {
    return { restricted: true, reason: 'IPv6 Unique local address (fc00::/7) is disallowed' };
  }

  // Site-local fec0::/10
  if (clean.startsWith('fec')) {
    return { restricted: true, reason: 'IPv6 Site-local address (fec0::/10) is disallowed' };
  }

  // IPv4-mapped IPv6: ::ffff:192.0.2.128 or ::ffff:c000:0280
  if (clean.startsWith('::ffff:') || clean.startsWith('0:0:0:0:0:ffff:')) {
    const ipv4Part = clean.replace(/^(::ffff:|0:0:0:0:0:ffff:)/, '');
    const octets = parseIpv4(ipv4Part);
    if (octets) {
      return isRestrictedIpv4(octets);
    }
    return { restricted: true, reason: 'IPv4-mapped IPv6 address is disallowed' };
  }

  return { restricted: false };
}

/**
 * Validates whether an external endpoint URL is safe from SSRF attacks.
 */
export function validateExternalUrl(
  urlString: string,
  options: SsrfValidationOptions = {}
): SsrfValidationResult {
  const { allowLocal = false, allowedProtocols = ['http:', 'https:'] } = options;

  if (!urlString || typeof urlString !== 'string') {
    return { valid: false, reason: 'URL string is empty or invalid' };
  }

  let parsed: URL;
  try {
    parsed = new URL(urlString.trim());
  } catch {
    return { valid: false, reason: 'URL is not a valid standard URL structure' };
  }

  // 1. Protocol check
  if (!allowedProtocols.includes(parsed.protocol)) {
    return {
      valid: false,
      reason: `Protocol "${parsed.protocol}" is not allowed. Permitted protocols: ${allowedProtocols.join(', ')}`,
    };
  }

  // 2. Extract host without port and normalize
  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, '');

  if (!hostname) {
    return { valid: false, reason: 'Hostname is missing' };
  }

  // Controlled bypass for unit tests or explicitly configured local environments
  if (allowLocal && (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1')) {
    return { valid: true };
  }

  // 3. Blocked hostnames check
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { valid: false, reason: `Hostname "${hostname}" is restricted` };
  }

  // Block top-level local domains
  if (
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.test')
  ) {
    return { valid: false, reason: `Local/internal domain "${hostname}" is restricted` };
  }

  // 4. IPv4 checks (including decimal / hex / octal encodings)
  const ipv4Octets = parseIpv4(hostname);
  if (ipv4Octets) {
    const check = isRestrictedIpv4(ipv4Octets);
    if (check.restricted) {
      return { valid: false, reason: check.reason };
    }
  }

  // 5. IPv6 checks
  if (hostname.includes(':') || hostname.startsWith('[')) {
    const check = isRestrictedIpv6(hostname);
    if (check.restricted) {
      return { valid: false, reason: check.reason };
    }
  }

  return { valid: true };
}

/**
 * Asserts that a URL is safe. Throws an Error if SSRF validation fails.
 */
export function assertSafeUrl(urlString: string, options: SsrfValidationOptions = {}): void {
  const result = validateExternalUrl(urlString, options);
  if (!result.valid) {
    throw new Error(`[NEXUS SSRF Protection] Destination URL is blocked: ${result.reason}`);
  }
}
