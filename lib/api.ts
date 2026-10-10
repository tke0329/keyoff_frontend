import "server-only";
import { safeUrl } from "./urls";
import { cookies } from "next/headers";
import { cache } from "react";
import type {
  Artist,
  ArtistPage,
  Career,
  Track,
  Page,
  Session,
  ArtistAccount,
} from "./types";

export const backend = process.env.BACKEND_URL || "http://localhost:8080";
export const sessionCookie = "keyoff_session";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  token?: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${backend}/api/v1/${path}`, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(init?.method && init.method !== "GET" ? 30000 : 10000),
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (error) {
    throw new ApiError(503, error instanceof Error && error.name === "TimeoutError"
      ? "서버 응답이 지연되었습니다. 저장 결과를 확인한 뒤 다시 시도해 주세요."
      : "서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success)
    throw new ApiError(
      response.status,
      body?.error?.message || `요청을 처리하지 못했습니다. (${response.status})`,
    );
  return body.data;
}
export const currentSession = cache(async (): Promise<Session | null> => {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;
  try {
    return await api<Session>("auth/me", token);
  } catch (error) {
    if (error instanceof ApiError && [401, 403].includes(error.status))
      return null;
    throw error;
  }
});
export async function currentArtist(): Promise<Artist | null> {
  const session = await currentSession();
  if (session?.role !== "ARTIST") return null;
  const token = (await cookies()).get(sessionCookie)!.value;
  return api<Artist>("artist/me", token);
}
export async function artists(page = 0): Promise<ArtistPage> {
  return api(`artist?page=${page}&size=20`);
}
export async function artist(slug: string): Promise<Artist> {
  return api(`artist/${encodeURIComponent(slug)}`);
}
export async function careers(slug: string): Promise<Career[]> {
  return api(`artist/${encodeURIComponent(slug)}/careers`);
}
export async function tracks(slug: string): Promise<Track[]> {
  return api(`artist/${encodeURIComponent(slug)}/playlist`);
}
export async function catalog(page = 0): Promise<Page<Track>> {
  const result = await api<Page<Track>>(`catalog?page=${page}&size=20`);
  return {
    ...result,
    content: result.content.map((track) => ({
      ...track,
      audioUrl: safeUrl(track.audioUrl) || null,
    })),
  };
}
export async function adminAccounts(page = 0): Promise<Page<ArtistAccount>> {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) throw new ApiError(401, "다시 로그인해 주세요.");
  return api(`admin/accounts?page=${page}&size=20`, token);
}
export function pageNumber(value?: string): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0;
}
export { safeUrl } from "./urls";
