import { cookies } from "next/headers";
import { api, ApiError, currentSession, sessionCookie } from "@/lib/api";
import { sameOrigin } from "@/lib/request-origin";
async function handle(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  if (!sameOrigin(request))
    return Response.json(
      { message: "허용되지 않은 요청입니다." },
      { status: 403 },
    );
  const path = (await context.params).path.join("/");
  const allowed =
    (path === "accounts" && request.method === "POST") ||
    (/^accounts\/[1-9]\d*\/(password|status|order)$/.test(path) &&
      request.method === "PATCH");
  if (!allowed)
    return Response.json(
      { message: "허용되지 않은 요청입니다." },
      { status: 404 },
    );
  try {
    const session = await currentSession();
    if (!session)
      return Response.json(
        { message: "다시 로그인해 주세요." },
        { status: 401 },
      );
    if (session.role !== "ADMIN")
      return Response.json(
        { message: "관리자 권한이 필요합니다." },
        { status: 403 },
      );
    const token = (await cookies()).get(sessionCookie)!.value;
    await api(`admin/${path}`, token, {
      method: request.method,
      body: JSON.stringify(await request.json()),
    });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof ApiError
            ? error.message
            : "관리 서버에 연결할 수 없습니다.",
      },
      { status: error instanceof ApiError ? error.status : 503 },
    );
  }
}
export const POST = handle;
export const PATCH = handle;
