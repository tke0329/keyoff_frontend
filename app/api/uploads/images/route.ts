import { cookies } from "next/headers";
import { currentSession, backend, ApiError, sessionCookie } from "@/lib/api";
import { sameOrigin } from "@/lib/request-origin";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json(
      { message: "허용되지 않은 요청입니다." },
      { status: 403 },
    );
  try {
    const session = await currentSession();
    if (!session)
      return Response.json(
        { message: "다시 로그인해 주세요." },
        { status: 401 },
      );
    if (session.role !== "ARTIST")
      return Response.json(
        { message: "아티스트 계정으로만 이미지를 업로드할 수 있습니다." },
        { status: 403 },
      );
    if (Number(request.headers.get("content-length") || 0) > 9 * 1024 * 1024)
      return Response.json(
        { message: "이미지는 8MB 이하로 선택해 주세요." },
        { status: 413 },
      );
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return Response.json(
        { message: "이미지 파일을 선택해 주세요." },
        { status: 400 },
      );
    }
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      !file.size ||
      !["image/jpeg", "image/png"].includes(file.type)
    )
      return Response.json(
        { message: "JPG 또는 PNG 이미지 한 장을 선택해 주세요." },
        { status: 400 },
      );
    if (file.size > 8 * 1024 * 1024)
      return Response.json(
        { message: "이미지는 8MB 이하로 선택해 주세요." },
        { status: 413 },
      );
    const outgoing = new FormData();
    outgoing.append("file", file);
    const token = (await cookies()).get(sessionCookie)!.value;
    const response = await fetch(`${backend}/api/v1/media/me/images`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: outgoing,
      signal: AbortSignal.timeout(60000),
    });
    const body = await response.json();
    if (!response.ok || !body.success)
      return Response.json(
        { message: body.error?.message || "이미지 업로드에 실패했습니다." },
        { status: response.status },
      );
    return Response.json({ data: body.data });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof ApiError
            ? error.message
            : "이미지 서버에 연결할 수 없습니다.",
      },
      { status: error instanceof ApiError ? error.status : 503 },
    );
  }
}
