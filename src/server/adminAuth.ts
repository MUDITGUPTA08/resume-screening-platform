const DEFAULT_ADMIN_PASSCODE = 'admin123';

export function isValidAdminPasscode(passcode: string | undefined | null): boolean {
  if (!passcode) return false;
  const expected = process.env.ADMIN_PASSCODE || DEFAULT_ADMIN_PASSCODE;
  return passcode === expected;
}

export function getAdminPasscodeFromRequest(headers: Record<string, string | string[] | undefined>): string | null {
  const raw = headers['x-admin-passcode'];
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return null;
}

interface JsonResponder {
  status(code: number): { json(body: unknown): void };
}

/**
 * Checks the request's admin passcode header and, if invalid, writes the 401
 * response itself. Returns true if the request is authorized (caller should
 * continue); false if it already rejected the request (caller should return).
 */
export function requireAdmin(
  headers: Record<string, string | string[] | undefined>,
  res: JsonResponder
): boolean {
  const passcode = getAdminPasscodeFromRequest(headers);
  if (!isValidAdminPasscode(passcode)) {
    res.status(401).json({ error: 'Invalid or missing admin passcode.' });
    return false;
  }
  return true;
}
