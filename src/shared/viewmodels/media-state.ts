export function imageUri(value: unknown): string | undefined {
  if (Array.isArray(value)) return value.map(imageUri).find((uri) => !!uri);
  if (typeof value !== 'string' || !value.trim()) return undefined;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !!url.hostname ? url.href : undefined; } catch { return undefined; }
}
