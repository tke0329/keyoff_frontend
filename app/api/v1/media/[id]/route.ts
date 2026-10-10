import { backend } from "@/lib/api";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/i.test(id)) return new Response(null, { status: 404 });
  try {
    const headers = new Headers();
    const range = request.headers.get("range");
    if (range) headers.set("Range", range);
    const response = await fetch(`${backend}/api/v1/media/${id}`, {
      headers,
      signal: AbortSignal.timeout(15000),
    });
    const outgoing = new Headers();
    for (const key of [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
      "cache-control",
    ]) {
      const value = response.headers.get(key);
      if (value) outgoing.set(key, value);
    }
    outgoing.set("X-Content-Type-Options", "nosniff");
    return new Response(response.body, {
      status: response.status,
      headers: outgoing,
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
