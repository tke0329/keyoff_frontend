export async function save(path: string, method: string, data?: unknown) {
  let response: Response;
  try {
    response = await fetch(`/api/manage/${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    });
  } catch {
    throw new Error("서버에 연결하지 못했습니다. 네트워크 상태를 확인하고 다시 시도해 주세요.");
  }
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(response.status === 401
    ? "로그인이 만료되었습니다. /login에서 다시 로그인해 주세요."
    : result?.message || `요청을 처리하지 못했습니다. (${response.status})`);
  if (!result || typeof result !== "object" || !("data" in result)) {
    throw new Error("서버 응답을 확인할 수 없습니다. 화면을 새로고침해 결과를 확인해 주세요.");
  }
  return result;
}
