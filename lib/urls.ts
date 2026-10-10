export function safeUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (/^\/api\/v1\/media\/[a-f0-9-]+$/i.test(value)) return value;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
