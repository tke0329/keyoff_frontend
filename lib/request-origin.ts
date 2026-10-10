/** Compare the browser's Origin with the incoming public Host, not Next's internal URL. */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    return (
      ["http:", "https:"].includes(parsed.protocol) &&
      parsed.host === request.headers.get("host")
    );
  } catch {
    return false;
  }
}
