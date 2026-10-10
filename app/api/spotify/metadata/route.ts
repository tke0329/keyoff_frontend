import { currentSession } from "@/lib/api";
import { spotifyTrackId, spotifyTrackUrl } from "@/lib/spotify";

export async function GET(request: Request) {
  const session = await currentSession();
  if (session?.role !== "ARTIST") {
    return Response.json({ message: "작가 로그인이 필요합니다." }, { status: 401 });
  }

  const input = new URL(request.url).searchParams.get("url") || "";
  const trackId = spotifyTrackId(input);
  if (!trackId) {
    return Response.json({ message: "Spotify 곡 공유 링크를 확인해 주세요." }, { status: 400 });
  }

  try {
    const url = new URL("https://open.spotify.com/oembed");
    url.searchParams.set("url", spotifyTrackUrl(trackId));
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(6000) });
    if (!response.ok) {
      return Response.json({ message: "Spotify에서 음악 정보를 찾지 못했습니다." }, { status: 502 });
    }
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !("title" in data) ||
        typeof data.title !== "string" || !data.title.trim()) {
      return Response.json({ message: "제목을 확인할 수 없습니다." }, { status: 502 });
    }
    return Response.json({ title: data.title.trim().slice(0, 255) });
  } catch {
    return Response.json({ message: "Spotify 정보를 불러오지 못했습니다." }, { status: 503 });
  }
}
