import { sameOrigin } from "@/lib/request-origin";
import { cookies } from "next/headers";
import { api, ApiError, sessionCookie } from "@/lib/api";
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
    (path === "artist/me" && request.method === "PUT") ||
    (path === "career/me/order" && request.method === "PUT") ||
    (/^playlist\/me(?:\/\d+)?$/.test(path) &&
      ((path === "playlist/me" && request.method === "POST") ||
        (path !== "playlist/me" && ["PUT", "DELETE"].includes(request.method)))) ||
    (/^media\/me\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(path) && request.method === "DELETE") ||
    (/^career\/me(?:\/\d+)?$/.test(path) &&
      ((path === "career/me" && request.method === "POST") ||
        (path !== "career/me" && ["PUT", "DELETE"].includes(request.method))));
  if (!allowed)
    return Response.json(
      { message: "허용되지 않은 요청입니다." },
      { status: 404 },
    );
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token)
    return Response.json({ message: "다시 로그인해 주세요." }, { status: 401 });
  try {
    const result = await api(path, token, {
      method: request.method,
      ...(request.method !== "DELETE"
        ? { body: JSON.stringify(await request.json()) }
        : {}),
    });
    return Response.json({ data: result });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof ApiError
            ? error.message
            : "저장 서버에 연결할 수 없습니다.",
      },
      { status: error instanceof ApiError ? error.status : 503 },
    );
  }
}
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
