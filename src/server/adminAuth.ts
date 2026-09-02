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
