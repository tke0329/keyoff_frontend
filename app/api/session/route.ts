import { sameOrigin } from "@/lib/request-origin";
import { cookies } from "next/headers";
import { api, ApiError, sessionCookie } from "@/lib/api";
import type { Session } from "@/lib/types";

export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json(
      { message: "허용되지 않은 요청입니다." },
      { status: 403 },
    );
  try {
    const input = await request.json();
    const data = await api<{ accessToken: string }>("auth/login", undefined, {
      method: "POST",
      body: JSON.stringify({
        username: input.username,
        password: input.password,
      }),
    });
    const session = await api<Session>("auth/me", data.accessToken);
    if (!["ADMIN", "ARTIST"].includes(session.role))
      throw new ApiError(403, "접근 권한이 없습니다.");
    (await cookies()).set(sessionCookie, data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return Response.json({ role: session.role, slug: session.slug });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof ApiError
            ? error.message
            : "로그인 서버에 연결할 수 없습니다.",
      },
      { status: error instanceof ApiError ? error.status : 503 },
    );
  }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request))
    return Response.json(
      { message: "허용되지 않은 요청입니다." },
      { status: 403 },
    );
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  try {
    if (token) await api("auth/logout", token, { method: "POST" });
  } catch {
    /* Local session is cleared even if the backend is unavailable. */
  }
  jar.delete(sessionCookie);
  return Response.json({ success: true });
}
